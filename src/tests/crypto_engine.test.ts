/**
 * Pruebas unitarias de CryptoEngine (Issue #120)
 *
 * Criterios de aceptación:
 * 1. Vectores oficiales NIST: sha256("") y sha256("abc").
 * 2. Cambiar un byte al final de la foto cambia el hash (hash completo).
 * 3. Sin WebCrypto disponible, lanza un error y no devuelve nada.
 * 4. El mismo lote con sus llaves en orden diferente da el mismo digest (JSON canónico).
 * 5. Soporte para Uint8Array, ArrayBuffer y string.
 */

import { CryptoEngine } from '../core/crypto/CryptoEngine';
import { RegisterLotRequest } from '../core/chain/ports';

let failures = 0;

function check(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failures++;
  }
}

async function run() {
  console.log('\n================================================================');
  console.log('   SUITE: CRYPTOENGINE (SHA-256 REAL, WEB-CRYPTO & CANONICAL)   ');
  console.log('================================================================');

  // 1. Vectores oficiales NIST SHA-256
  console.log('\n📍 1. VECTORES OFICIALES NIST SHA-256');
  const emptyHash = await CryptoEngine.sha256('');
  check(
    emptyHash === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'sha256("") coincide con el vector oficial NIST'
  );

  const abcHash = await CryptoEngine.sha256('abc');
  check(
    abcHash === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    'sha256("abc") coincide con el vector oficial NIST'
  );

  // 2. Soporte para tipos de datos binarios (Uint8Array y ArrayBuffer)
  console.log('\n📍 2. TIPOS DE ENTRADA BINARIOS (Uint8Array, ArrayBuffer)');
  const abcBytes = new TextEncoder().encode('abc');
  const abcFromUint8 = await CryptoEngine.sha256(abcBytes);
  check(abcFromUint8 === abcHash, 'sha256(Uint8Array) coincide con sha256(string)');

  const rawBuffer = new ArrayBuffer(3);
  new Uint8Array(rawBuffer).set([0x61, 0x62, 0x63]);
  const abcFromArrayBuffer = await CryptoEngine.sha256(rawBuffer);
  check(abcFromArrayBuffer === abcHash, 'sha256(ArrayBuffer) coincide con sha256(string)');

  // 3. Hash de la foto completa: cambiar un byte al final altera el hash
  console.log('\n📍 3. INTEGRIDAD COMPLETA DE FOTOGRAFÍA (Sin truncar bytes)');
  const photoSize = 1024;
  const photoData1 = new Uint8Array(photoSize);
  for (let i = 0; i < photoSize; i++) {
    photoData1[i] = i % 256;
  }
  const photoData2 = new Uint8Array(photoData1);
  // Modificar exactamente el ÚLTIMO byte
  photoData2[photoSize - 1] = (photoData2[photoSize - 1] + 1) % 256;

  const photoHash1 = await CryptoEngine.hashPhoto(photoData1);
  const photoHash2 = await CryptoEngine.hashPhoto(photoData2);
  check(photoHash1.length === 64, 'Hash de foto tiene longitud de 64 caracteres hex');
  check(photoHash2.length === 64, 'Hash de foto modificada tiene longitud de 64 caracteres hex');
  check(photoHash1 !== photoHash2, 'Cambiar un solo byte al final de la foto cambia el hash');

  // 4. Comportamiento sin WebCrypto: debe lanzar un error y no devolver nada falso
  console.log('\n📍 4. AUSENCIA DE WEBCRYPTO (Sin fallbacks falsos)');
  const originalCrypto = globalThis.crypto;
  try {
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    let threwExpectedError = false;
    let returnedValue: string | null = null;
    try {
      returnedValue = await CryptoEngine.sha256('test');
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'WebCrypto no disponible') {
        threwExpectedError = true;
      }
    }
    check(
      threwExpectedError && returnedValue === null,
      'Sin WebCrypto disponible, lanza Error("WebCrypto no disponible") y no devuelve nada'
    );
  } finally {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
      writable: true,
    });
  }

  // 5. JSON Canónico y Digest de Lote
  console.log('\n📍 5. JSON CANÓNICO Y DIGEST DE LOTE (RegisterLotRequest)');
  const sampleLot1: RegisterLotRequest = {
    code: 'MX-2024-OAX-001',
    producerAddress: 'GARTISAN1TEXTILE7777777777777777777777777777777777777777777',
    location: 'Heroica Ciudad de Tlaxiaco',
    category: 'textile',
    variety: 'Telar de cintura',
    volumeRange: 1,
    photoHashHex: photoHash1,
  };

  // Mismo lote pero con las llaves insertadas en orden completamente distinto
  const sampleLot2: RegisterLotRequest = {
    photoHashHex: photoHash1,
    variety: 'Telar de cintura',
    location: 'Heroica Ciudad de Tlaxiaco',
    volumeRange: 1,
    category: 'textile',
    code: 'MX-2024-OAX-001',
    producerAddress: 'GARTISAN1TEXTILE7777777777777777777777777777777777777777777',
  };

  const digest1 = await CryptoEngine.generateLotDigest(sampleLot1);
  const digest2 = await CryptoEngine.generateLotDigest(sampleLot2);
  check(
    digest1 === digest2,
    'El mismo lote con sus llaves en un orden diferente da exactamente el mismo digest'
  );

  // Alterar un campo debe generar un digest distinto
  const alteredLot: RegisterLotRequest = {
    ...sampleLot1,
    volumeRange: 2,
  };
  const digestAltered = await CryptoEngine.generateLotDigest(alteredLot);
  check(digest1 !== digestAltered, 'Modificar un campo del lote genera un digest distinto');

  // Privacidad: el digest canónico no incluye nombres ni comunidad exacta
  const canonicalString = CryptoEngine.canonicalJson(sampleLot1 as unknown as Record<string, unknown>);
  check(!canonicalString.includes('producerName'), 'El JSON canónico no contiene producerName');
  check(!canonicalString.includes('community'), 'El JSON canónico no contiene el campo community');

  console.log('\n================================================================');
  console.log(`   RESULTADO: ${failures === 0 ? 'TODAS LAS PRUEBAS PASARON' : `${failures} FALLOS`}`);
  console.log('================================================================');

  if (failures > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Error fatal en suite de pruebas:', err);
  process.exit(1);
});
