/**
 * Yucu Core - Motor Criptográfico de Integridad
 * Calcula identificadores únicos y hashes SHA-256 reales con WebCrypto
 * sobre bytes completos de fotos (sin metadatos GPS/EXIF) y lotes en JSON canónico.
 */

export interface CommunityDigestInput {
  code?: string;
  /** Dirección pública de la productora (G...), nunca su nombre. */
  producerAddress?: string;
  /** Municipio o región, nunca la comunidad exacta ni un domicilio. */
  location?: string;
  category?: string;
  variety?: string;
  volumeRange?: number;
  /** SHA-256 en hexadecimal de los bytes completos de la foto limpia. */
  photoHashHex?: string;
  /** Bytes o representación completa de la foto para calcular photoHashHex si no se proporciona. */
  photo?: Uint8Array | ArrayBuffer | string;
  photoBase64?: string;
  timestamp?: number;
  processStagesSummary?: string;
}

export class CryptoEngine {
  /**
   * Convierte una entrada (Uint8Array, ArrayBuffer, data URL base64 o texto) a sus bytes completos.
   */
  public static toBytes(data: Uint8Array | ArrayBuffer | string): Uint8Array<ArrayBuffer> {
    if (typeof data === 'string') {
      const dataUrlMatch = /^data:[^;]+;base64,(.*)$/s.exec(data);
      if (dataUrlMatch) {
        const b64 = dataUrlMatch[1].replace(/\s+/g, '');
        if (typeof Buffer !== 'undefined') {
          const buf = Buffer.from(b64, 'base64');
          const out = new Uint8Array(buf.byteLength);
          out.set(buf);
          return out;
        }
        if (typeof atob === 'function') {
          const binary = atob(b64);
          const out = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            out[i] = binary.charCodeAt(i);
          }
          return out;
        }
      }
      const encoded = new TextEncoder().encode(data);
      const out = new Uint8Array(encoded.byteLength);
      out.set(encoded);
      return out;
    }
    if (data instanceof Uint8Array) {
      const out = new Uint8Array(data.byteLength);
      out.set(data);
      return out;
    }
    return new Uint8Array(data);
  }

  /**
   * Calcula el hash SHA-256 real usando WebCrypto (`crypto.subtle.digest`).
   * Si WebCrypto no está disponible, lanza un error; nunca devuelve un cálculo simulado.
   */
  public static async sha256(data: Uint8Array | ArrayBuffer | string): Promise<string> {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle || typeof subtle.digest !== 'function') {
      throw new Error('WebCrypto (crypto.subtle.digest) no está disponible; no se permite respaldo simulado para SHA-256.');
    }

    const bytes = this.toBytes(data);
    const hashBuffer = await subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Alias asíncrono de `sha256` sobre la entrada completa.
   */
  public static async computeSha256(data: Uint8Array | ArrayBuffer | string): Promise<string> {
    return this.sha256(data);
  }

  /**
   * Elimina segmentos de metadatos EXIF/GPS/XMP y comentarios (APP1..APP15, COM) de una imagen JPEG,
   * equivalente al redibujado limpio en canvas antes de calcular el hash (BASE_DE_DATOS.md, sección 5).
   */
  public static stripPhotoMetadata(photoBytes: Uint8Array): Uint8Array<ArrayBuffer> {
    if (photoBytes.byteLength < 4 || photoBytes[0] !== 0xff || photoBytes[1] !== 0xd8) {
      const copy = new Uint8Array(photoBytes.byteLength);
      copy.set(photoBytes);
      return copy;
    }

    const chunks: Uint8Array[] = [photoBytes.subarray(0, 2)];
    let offset = 2;

    while (offset < photoBytes.byteLength) {
      if (photoBytes[offset] !== 0xff) {
        chunks.push(photoBytes.subarray(offset));
        break;
      }

      while (offset + 1 < photoBytes.byteLength && photoBytes[offset + 1] === 0xff) {
        offset++;
      }

      if (offset + 1 >= photoBytes.byteLength) {
        chunks.push(photoBytes.subarray(offset));
        break;
      }

      const marker = photoBytes[offset + 1];

      // Fin de imagen (EOI) o inicio del flujo comprimido de píxeles (SOS)
      if (marker === 0xd9 || marker === 0xda) {
        chunks.push(photoBytes.subarray(offset));
        break;
      }

      // Marcadores sin longitud (RST0..RST7, SOI, TEM)
      if ((marker >= 0xd0 && marker <= 0xd8) || marker === 0x01) {
        chunks.push(photoBytes.subarray(offset, offset + 2));
        offset += 2;
        continue;
      }

      if (offset + 4 > photoBytes.byteLength) {
        chunks.push(photoBytes.subarray(offset));
        break;
      }

      const segmentLength = (photoBytes[offset + 2] << 8) | photoBytes[offset + 3];
      if (segmentLength < 2 || offset + 2 + segmentLength > photoBytes.byteLength) {
        chunks.push(photoBytes.subarray(offset));
        break;
      }

      const isMetadataSegment = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;
      if (!isMetadataSegment) {
        chunks.push(photoBytes.subarray(offset, offset + 2 + segmentLength));
      }

      offset += 2 + segmentLength;
    }

    const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0);
    const out = new Uint8Array(totalLength);
    let writePos = 0;
    for (const chunk of chunks) {
      out.set(chunk, writePos);
      writePos += chunk.byteLength;
    }
    return out;
  }

  /**
   * Detecta si los bytes de una foto aún contienen segmentos EXIF/GPS (APP1..APP15) o cabeceras GPS/Exif.
   */
  public static hasExifOrGpsMetadata(photoBytes: Uint8Array): boolean {
    if (photoBytes.byteLength >= 4 && photoBytes[0] === 0xff && photoBytes[1] === 0xd8) {
      let offset = 2;
      while (offset + 3 < photoBytes.byteLength && photoBytes[offset] === 0xff) {
        const marker = photoBytes[offset + 1];
        if (marker === 0xd9 || marker === 0xda) break;
        if ((marker >= 0xd0 && marker <= 0xd8) || marker === 0x01) {
          offset += 2;
          continue;
        }
        const segmentLength = (photoBytes[offset + 2] << 8) | photoBytes[offset + 3];
        if (segmentLength < 2 || offset + 2 + segmentLength > photoBytes.byteLength) break;
        if ((marker >= 0xe1 && marker <= 0xef) || marker === 0xfe) {
          return true;
        }
        offset += 2 + segmentLength;
      }
    }
    const text = new TextDecoder('latin1').decode(photoBytes);
    return text.includes('Exif\0\0') || text.includes('GPSInfo');
  }

  /**
   * Limpia los metadatos (GPS, modelo de celular, fecha) de la foto y calcula el SHA-256
   * sobre los bytes completos del archivo limpio.
   */
  public static async sanitizeAndHashPhoto(
    photo: Uint8Array | ArrayBuffer | string
  ): Promise<{ cleanBytes: Uint8Array<ArrayBuffer>; photoHashHex: string }> {
    const rawBytes = this.toBytes(photo);
    const cleanBytes = this.stripPhotoMetadata(rawBytes);
    const photoHashHex = await this.sha256(cleanBytes);
    return { cleanBytes, photoHashHex };
  }

  /**
   * Calcula el hash SHA-256 sobre los bytes completos de una foto (limpiando antes metadatos EXIF/GPS).
   */
  public static async hashPhoto(photo: Uint8Array | ArrayBuffer | string): Promise<string> {
    const { photoHashHex } = await this.sanitizeAndHashPhoto(photo);
    return photoHashHex;
  }

  /**
   * Serializa un valor a JSON canónico con llaves ordenadas lexicográficamente en todos los niveles.
   */
  public static canonicalizeJson(value: unknown): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return '[' + value.map((item) => this.canonicalizeJson(item)).join(',') + ']';
    }
    const record = value as Record<string, unknown>;
    const sortedKeys = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort();
    const entries = sortedKeys.map(
      (key) => `${JSON.stringify(key)}:${this.canonicalizeJson(record[key])}`
    );
    return '{' + entries.join(',') + '}';
  }

  /**
   * Genera el digest SHA-256 del lote usando JSON canónico (llaves ordenadas)
   * con los campos de `RegisterLotRequest` (sin nombres ni comunidad exacta) y el hash de la foto completa.
   */
  public static async generateCommunityDigest(params: CommunityDigestInput): Promise<string> {
    let resolvedPhotoHash = params.photoHashHex;
    if (!resolvedPhotoHash) {
      if (params.photo !== undefined) {
        resolvedPhotoHash = await this.hashPhoto(params.photo);
      } else if (params.photoBase64 !== undefined) {
        resolvedPhotoHash = await this.hashPhoto(params.photoBase64);
      }
    }

    const canonicalPayload: Record<string, unknown> = {};
    const rawRecord = params as Record<string, unknown>;
    const excludedKeys = new Set([
      'photo',
      'photoBase64',
      'producerName',
      'community',
    ]);

    for (const key of Object.keys(rawRecord)) {
      if (!excludedKeys.has(key) && rawRecord[key] !== undefined) {
        canonicalPayload[key] = rawRecord[key];
      }
    }

    if (resolvedPhotoHash !== undefined) {
      canonicalPayload.photoHashHex = resolvedPhotoHash;
    }

    const canonicalJson = this.canonicalizeJson(canonicalPayload);
    return this.sha256(canonicalJson);
  }

  public static async computeCommunityDigest(params: CommunityDigestInput): Promise<string> {
    return this.generateCommunityDigest(params);
  }
}
