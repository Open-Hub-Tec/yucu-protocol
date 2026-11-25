/**
 * Yucu Core - Motor Criptográfico de Integridad
 * Calcula identificadores únicos y hashes SHA-256 reales e inmutables (WebCrypto)
 * para fotos, audios testimoniales, lotes y dictámenes técnicos.
 */

import { RegisterLotRequest } from '../chain/ports';

export class CryptoEngine {
  /**
   * Calcula el hash SHA-256 de una secuencia de bytes (Uint8Array, ArrayBuffer) o cadena de texto
   * utilizando WebCrypto (crypto.subtle), disponible en el navegador y en Node.js 22+.
   *
   * Si WebCrypto no está disponible, lanza un error de forma inmediata.
   * Nunca devuelve cálculos de respaldo (fallback) polinomiales o aproximados.
   */
  public static async sha256(data: Uint8Array | ArrayBuffer | string): Promise<string> {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
      throw new Error('WebCrypto no disponible');
    }

    let bytes: Uint8Array;
    if (typeof data === 'string') {
      bytes = new TextEncoder().encode(data);
    } else if (data instanceof ArrayBuffer) {
      bytes = new Uint8Array(data);
    } else if (data instanceof Uint8Array) {
      bytes = data;
    } else {
      throw new TypeError('Formato de datos no soportado para SHA-256');
    }

    const hashBuffer = await subtle.digest('SHA-256', bytes as unknown as BufferSource);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Alias para mantener compatibilidad hacia atrás con llamadas existentes a computeSha256.
   */
  public static async computeSha256(data: Uint8Array | ArrayBuffer | string): Promise<string> {
    return this.sha256(data);
  }

  /**
   * Calcula el hash SHA-256 sobre la totalidad de los bytes del archivo de la fotografía.
   * Cumple con la regla de calcular el hash sobre el contenido completo del archivo.
   */
  public static async hashPhoto(photoData: Uint8Array | ArrayBuffer | string): Promise<string> {
    return this.sha256(photoData);
  }

  /**
   * Serializa un objeto en formato JSON canónico (llaves ordenadas lexicográficamente).
   * Garantiza que dos objetos con los mismos campos pero en distinto orden produzcan
   * exactamente la misma cadena serializada y, por ende, el mismo digest.
   */
  public static canonicalJson(obj: Record<string, unknown>): string {
    const sortedEntries = Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(Object.fromEntries(sortedEntries));
  }

  /**
   * Genera el digest de lote a partir de un RegisterLotRequest utilizando JSON canónico
   * (con llaves ordenadas) y el hash de la foto.
   * No incluye nombres de personas ni comunidad exacta (ADR-004, D5).
   */
  public static async generateLotDigest(lot: RegisterLotRequest): Promise<string> {
    const lotFields: Record<string, string | number> = {
      code: lot.code,
      producerAddress: lot.producerAddress,
      location: lot.location,
      category: lot.category,
      variety: lot.variety,
      volumeRange: lot.volumeRange,
      photoHashHex: lot.photoHashHex,
    };
    const canonical = this.canonicalJson(lotFields);
    return this.sha256(canonical);
  }

  /**
   * Genera el Digest de Comunidad/Lote.
   * Si se le pasa un RegisterLotRequest completo, delega en generateLotDigest.
   * Si se le pasan parámetros libres, omite cualquier nombre personal (producerName)
   * o comunidad exacta, y serializa canónicamente sobre los bytes completos.
   */
  public static async generateCommunityDigest(params: RegisterLotRequest | {
    code?: string;
    producerAddress?: string;
    location?: string;
    category?: string;
    variety?: string;
    volumeRange?: number;
    photoHashHex?: string;
    timestamp?: number;
    audioBase64?: string;
    photoBase64?: string;
    processStagesSummary?: string;
    producerName?: string;
    community?: string;
  }): Promise<string> {
    if ('producerAddress' in params && 'photoHashHex' in params && 'volumeRange' in params) {
      return this.generateLotDigest(params as RegisterLotRequest);
    }

    const cleanParams: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) {
      if (k === 'producerName' || k === 'community') continue;
      if (v !== undefined) cleanParams[k] = v;
    }
    const canonical = this.canonicalJson(cleanParams);
    return this.sha256(canonical);
  }

  public static async computeCommunityDigest(
    params: Parameters<typeof CryptoEngine.generateCommunityDigest>[0]
  ): Promise<string> {
    return this.generateCommunityDigest(params);
  }
}
