---
name: student-rwa-attestations
description: Guía pedagógica para estudiantes del TecNM Tlaxiaco sobre cómo diseñar y emitir Atestaciones RWA (Activos del Mundo Real), hash canónico SHA-256 y etiquetas Hang-Tag QR para café, miel y textiles de la Mixteca.
---

# 🌾 Skill TecNM: Creación de Atestaciones Físicas y Oráculos de Campo

Esta guía enseña a los estudiantes de Sistemas Computacionales cómo convertir un producto físico agrícola o artesanal en un registro verificable en Stellar Soroban.

> En la cadena va **lo mínimo** ([ADR-004](../../docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), D5): municipio o región (nunca la comunidad exacta), categoría y variedad de una lista cerrada, volumen por rangos, hash de la foto y ningún monto. Nunca nombres de personas.

> Las atestaciones se emiten en **Attest Protocol**, con el índice y las reglas de Yucu ([ADR-005](../../docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md)). La IA prepara un borrador guiado por el manifiesto del esquema y la persona lo confirma y lo firma ([ADR-007](../../docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md)). Ningún oráculo emite una atestación por su cuenta.

---

## 1. La Fórmula del "Community Digest" SHA-256

Para evitar que intermediarios alteren el peso o procedencia de un saco de café, el estudiante debe programar la función de hashing canónico determinista:

```typescript
import crypto from 'crypto';

export function calcularDigestLote(params: {
  folio: string;          // ej. "MIEL-001"
  productorId: string;    // Dirección G… de la productora (nunca su nombre)
  municipio: number;      // Clave del municipio, nunca la comunidad exacta
  rangoVolumen: number;   // Código de rango, ej. 1 = menos de 10 kg
  fotoHash: string;       // SHA-256 de la foto completa del lote
}): string {
  // Orden estricto de campos para garantizar reproducibilidad matemática
  const cargaCanonico = [
    params.folio.toUpperCase().trim(),
    params.productorId.trim(),
    String(params.municipio),
    String(params.rangoVolumen),
    params.fotoHash.toLowerCase(),
  ].join('|');

  return crypto.createHash('sha256').update(cargaCanonico).digest('hex');
}
```

---

## 2. Los 3 Oráculos que Conectan el Campo con Soroban

> **Hoy los tres son de demostración** (`src/core/ai/RaizAIOracles.ts` da puntajes fijos y el EUDR siempre dice "sin deforestación"). Todo resultado simulado lleva `source: 'simulated'` y `<DemoBadge />`. Un oráculo no certifica nada: una certificación la firma una persona validadora (#106 [W13]).

1. **Oráculo de Voz en Tu'un Savi:**
   * Utiliza la API de audio multimodal para transcribir el relato oral del campesino grabado en la parcela.
   * Propone kilos, variedad y municipio (nunca la comunidad exacta); la persona lo escucha, lo corrige y lo firma.
2. **Oráculo Óptico de Calidad SCAA:**
   * Evalúa la fotografía de la muestra sobre fondo blanco o jícara tradicional.
   * Podría clasificar granos con broca, vanos o fermentados y sugerir un puntaje. La calificación SCAA la da una persona catadora, no la IA.
3. **Oráculo Satelital Anti-Deforestación (EUDR):**
   * La idea: cruzar el polígono del cafetal con imágenes de Copernicus Sentinel-2 (ESA). No está implementado.
   * Daría una evidencia para la debida diligencia del reglamento europeo (EUDR), no un certificado. Las coordenadas de la parcela no van a la cadena.

---

## 3. Generación de la Etiqueta Física Hang-Tag QR

El código QR no almacena datos pesados, sino el enlace canónico GS1 Digital Link:
`https://<dominio-de-yucu>/01/<GTIN>/10/MIEL-001` (el dominio y el GTIN todavía no están definidos)

Al escanearse, el enlace consulta el contrato `lot_passport` y muestra el registro del lote con la firma de la productora y la del certificador. Solo prueba algo si el lote está registrado de verdad en testnet (#93 [W3]).
