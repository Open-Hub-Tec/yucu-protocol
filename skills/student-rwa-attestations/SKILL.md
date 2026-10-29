---
name: student-rwa-attestations
description: Guía para estudiantes del TecNM Tlaxiaco sobre cómo convertir un producto físico o una afirmación (origen, consentimiento, entrega, pesaje) en una atestación verificable en Stellar, con Attest Protocol, el índice de Yucu, el motor de voz y texto, el hash canónico SHA-256 y la etiqueta QR.
---

# 🌾 Skill TecNM: Atestaciones del mundo físico por voz y texto

Esta guía enseña cómo una persona de la Mixteca convierte lo que sabe ("este café es de Yosondúa", "doy mi consentimiento", "ya me llegó el pedido") en una prueba que cualquiera puede comprobar en Stellar sin confiar en Yucu.

> **La IA habla, la persona firma, la cadena prueba** ([ADR-007](../../docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md)). La IA transcribe y prepara un borrador; **nunca** firma, nunca emite por su cuenta y nunca certifica. Lee primero [`AGENTS.md`](../../AGENTS.md).

> En la cadena va **lo mínimo** ([ADR-004](../../docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), D5): municipio o región (nunca la comunidad exacta), categoría y variedad de una lista cerrada, volumen por rangos, hash de la foto y ningún monto. Nunca nombres, teléfonos ni coordenadas.

---

## 1. Dónde vive cada prueba

| Prueba | Dónde | Issues |
|---|---|---|
| Pasaporte del lote | Contrato `lot_passport` de Yucu | #92, #93 |
| Origen comunitario, consentimiento, colaboración, entrega, pesaje | **Attest Protocol**, con el índice y las reglas de Yucu ([ADR-005](../../docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md)) | #140, #141, #162, #163 |
| Fotos, descripciones, precios | Base de datos, fuera de la cadena ([`BASE_DE_DATOS.md`](../../docs/arquitectura/BASE_DE_DATOS.md)) | #156 |

Yucu **no** tiene un registro de atestaciones propio: `contracts/attestation_registry` es solo para practicar.

| Esquema | Lo emite | ¿Por voz o texto? |
|---|---|---|
| Origen comunitario | El grupo | Sí; la foto se toma con la cámara |
| Consentimiento | **La artesana**, y solo ella lo revoca | Sí; escucha qué autoriza y dice Sí |
| Colaboración | Una marca | Sí; exige el consentimiento vigente de la artesana |
| Entrega | Comprador o grupo | Sí |
| Tránsito (peso, humedad) | Grupo o promotora | Sí; las cifras se leen en voz alta y se corrigen con el dedo |
| Dictamen de IA | El servicio de IA | No: se muestra siempre como sugerencia, nunca como certificación |

---

## 2. El motor: de la voz (o el texto) a la firma

Cada esquema tiene un **manifiesto** (JSON público). Dice qué preguntar, qué campos lleva, cuáles son públicos, cuáles van solo como hash y cuáles están prohibidos, cómo confirmar y quién firma. El motor sigue el manifiesto, así que un esquema nuevo no necesita código nuevo. La forma final la define #140.

```
1. Habla o escribe        "Tengo 20 kilos de café de Yosondúa"
2. La IA transcribe       puerto de IA (#154); el audio se borra después (ADR-006, D5)
3. El extractor llena     SOLO los campos del manifiesto (#164); lo que no quedó claro
                          se deja vacío y se vuelve a preguntar; lo "forbidden" se descarta
4. La app lo lee en voz   "Entendí: café, de 10 a 25 kg, de Santiago Yosondúa. ¿Es correcto?"
   alta                   Botones grandes Sí / No; corregir con voz o con el dedo (#155)
5. La persona firma       PIN o tarjeta QR: preparar → firmar → enviar (AttestationPort)
```

Reglas para quien programe el extractor o la pantalla:
* Si la IA no está disponible o no entendió, se dice ("No te escuché bien. ¿Lo intentamos otra vez o lo escribes?"). Nunca se inventa una transcripción (ADR-006, D4).
* Siempre se puede escribir en lugar de hablar.
* Español primero; el mixteco está en evaluación (#158).

---

## 3. El hash canónico SHA-256 (#120)

Usa WebCrypto (`crypto.subtle`), que existe en el navegador y en Node 22. Si no hay WebCrypto, **lanza un error**: nunca devuelvas otro cálculo.

```typescript
export async function sha256Hex(data: Uint8Array | string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('WebCrypto no disponible');
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// JSON canónico: llaves ordenadas, solo campos de RegisterLotRequest (sin nombres ni comunidad).
export function canonicalJson(obj: Record<string, string | number>): string {
  return JSON.stringify(Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))));
}
```

* **La foto:** el teléfono quita los metadatos (GPS, modelo, fecha) redibujándola antes de calcular el hash, y el hash se calcula sobre **todos** los bytes del archivo limpio ([`BASE_DE_DATOS.md`](../../docs/arquitectura/BASE_DE_DATOS.md), sección 5).
* **En Attest Protocol** el contenido va como hash **con sal aleatoria**: datos con pocas opciones ("25 kg", un municipio) se adivinan probando todas las combinaciones (ADR-005, D3).
* Comprueba tu función con los vectores oficiales: `sha256("abc")` = `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`.

---

## 4. Lo que hoy es de demostración

`src/core/ai/RaizAIOracles.ts` y `src/core/agents/YucuAgentSwarm.ts` dan puntajes fijos y estados `CERTIFIED`. Son demostraciones: todo resultado simulado lleva `source: 'simulated'` y `<DemoBadge />`, y ningún resultado de IA dice "certificado" (#168). La idea de un "oráculo satelital EUDR" no está en el plan; si algún día existe, será una sugerencia, no un certificado, y las coordenadas de la parcela no van a la cadena.

---

## 5. La etiqueta física con QR

El QR no guarda datos: lleva un enlace al verificador público (#142), por ejemplo
`https://<dominio-de-yucu>/01/<GTIN>/10/MIEL-001` (GS1 Digital Link; el dominio y el GTIN todavía no están definidos).

Al escanearlo, el verificador lee la red directamente: el pasaporte en `lot_passport` y las atestaciones del lote en el índice de Yucu. Muestra quién firmó cada cosa y si sigue vigente. Solo prueba algo si el lote está registrado de verdad en testnet (#93).
