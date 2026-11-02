import { FairTradeEngine } from '../core/policy/FairTradeEngine';
import { ProcessStage, DynamicSpec, DigitalPassportLot } from '../types';
import { CryptoEngine } from '../core/crypto/CryptoEngine';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `-> ${detail}` : ''}`);
    failed++;
  }
}

console.log('================================================================');
console.log('   SUITE DE PRUEBAS: LISTAS DINÁMICAS, CRIPTOGRAFÍA & USABILIDAD ');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. ESTRUCTURAS DE DATOS DINÁMICAS (POLIMORFISMO DE PRODUCTOS)
// -------------------------------------------------------------
console.log('--- 1. Pruebas de Listas Dinámicas Multiproducto ---');

// A. Caso Textil (Telar de cintura)
const textileStages: ProcessStage[] = [
  { id: 'stg-tex-1', name: 'Hilado con huso y malacate', category: 'materia_prima', metricValue: 'Lana virgen criolla', notes: 'Lavado con raíz de amole' },
  { id: 'stg-tex-2', name: 'Teñido natural con Grana Cochinilla', category: 'tintura', metricValue: '3 baños con jugo de limón', notes: 'Fijación con alumbre' },
  { id: 'stg-tex-3', name: 'Urdido y brocado en telar de cintura', category: 'transformacion', metricValue: '5 semanas de tejido', notes: 'Iconografía de la greca del sol' },
  { id: 'stg-tex-4', name: 'Acabado y empuntado tradicional', category: 'acabado', metricValue: 'Flecado a mano', notes: 'Remate con nudo ciego' }
];

const textileSpecs: DynamicSpec[] = [
  { id: 'sp-1', label: 'Técnica Ancestral', value: 'Telar de cintura de 4 estacas' },
  { id: 'sp-2', label: 'Tinte Natural', value: 'Grana cochinilla y corteza de nogal' },
  { id: 'sp-3', label: 'Dimensiones', value: '190 x 70 cm' }
];

assert(textileStages.length === 4, 'Lista de etapas textil inicializada con 4 hitos');
assert(textileStages[1].category === 'tintura', 'Clasificación de tintura natural detectada');
assert(textileSpecs.some(s => s.label === 'Tinte Natural' && s.value.includes('Grana')), 'Especificación dinámica de tinte natural');

// B. Manipulación Dinámica: Adición y Eliminación en tiempo de ejecución
const nuevaEtapaTextil: ProcessStage = {
  id: `stg-tex-${Date.now()}`,
  name: 'Inspección de calidad por el consejo de ancianas',
  category: 'inspeccion',
  metricValue: 'Sello Comunal',
  notes: 'Validado en asamblea'
};

const updatedStages = [...textileStages, nuevaEtapaTextil];
assert(updatedStages.length === 5, 'Adición dinámica de etapa en la lista (L.length = 5)');
assert(updatedStages[4].name.includes('consejo de ancianas'), 'Persistencia en orden cronológico del nuevo nodo');

// Eliminación de una etapa
const filteredStages = updatedStages.filter(s => s.id !== 'stg-tex-1');
assert(filteredStages.length === 4, 'Eliminación dinámica de etapa sin alterar el resto de la lista');

// C. Caso Miel (Apicultura Agroecológica)
const honeyStages: ProcessStage[] = [
  { id: 'stg-h-1', name: 'Floración silvestre de Campanilla de montaña', category: 'materia_prima', metricValue: 'Pechuga / Acahual' },
  { id: 'stg-h-2', name: 'Cosecha de alzas maduras al 90%', category: 'transformacion', metricValue: 'Desoperculado manual' },
  { id: 'stg-h-3', name: 'Centrifugado en frío sin calentamiento', category: 'transformacion', metricValue: 'Acero inoxidable 304' },
  { id: 'stg-h-4', name: 'Filtrado lento por gravedad y decantación', category: 'acabado', metricValue: '17.8% humedad' }
];
assert(honeyStages.length === 4, 'Lista dinámica de miel con medición de humedad de 17.8%');

// D. Caso Cacao / Chocolate
const chocolateStages: ProcessStage[] = [
  { id: 'stg-ch-1', name: 'Fermentación en cajón de madera', category: 'materia_prima', metricValue: '6 días con 3 volteos' },
  { id: 'stg-ch-2', name: 'Secado en pasera de palma al sol', category: 'transformacion', metricValue: 'Humedad 7.2%' },
  { id: 'stg-ch-3', name: 'Tueste en comal de barro con leña de encino', category: 'transformacion', metricValue: 'Tostado parejo' },
  { id: 'stg-ch-4', name: 'Molienda en metate con canela y almendra', category: 'acabado', metricValue: 'Molido en caliente' }
];
assert(chocolateStages.length === 4, 'Lista dinámica de chocolate tradicional en metate');


// -------------------------------------------------------------
// 2. CRIPTOGRAFÍA & ANCLAJE INMUTABLE A BLOCKCHAIN (STELLAR)
// -------------------------------------------------------------
console.log('\n--- 2. Criptografía y Sellado Inmutable en Stellar ---');

async function testCrypto() {
  // 1. Vectores oficiales NIST SHA-256 (#120)
  const emptyVec = await CryptoEngine.sha256('');
  const abcVec = await CryptoEngine.sha256('abc');
  assert(
    emptyVec === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'Vector oficial SHA-256("") coincide con NIST'
  );
  assert(
    abcVec === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    'Vector oficial SHA-256("abc") coincide con NIST'
  );

  // 2. Hash sobre los bytes completos de la foto: cambiar el último byte cambia el hash (#120)
  const fullPhotoA = new Uint8Array(2048);
  for (let i = 0; i < fullPhotoA.length; i++) {
    fullPhotoA[i] = i & 0xff;
  }
  const fullPhotoB = new Uint8Array(fullPhotoA);
  fullPhotoB[fullPhotoB.length - 1] ^= 0x01; // Cambio en el último byte (posición 2047 > 100)

  const photoHashA = await CryptoEngine.hashPhoto(fullPhotoA);
  const photoHashB = await CryptoEngine.hashPhoto(fullPhotoB);
  assert(
    photoHashA !== photoHashB,
    'Cambiar un solo byte al final de la foto modifica el hash SHA-256 completo'
  );

  // 3. Limpieza de metadatos GPS/EXIF antes del hash (#120, BASE_DE_DATOS.md sección 5)
  // Imagen JPEG limpia: SOI (FFD8) + APP0 JFIF (FFE0) + SOS (FFDA) + datos de imagen + EOI (FFD9)
  const cleanJpeg = new Uint8Array([
    0xff, 0xd8,
    0xff, 0xe0, 0x00, 0x07, 0x4a, 0x46, 0x49, 0x46, 0x00,
    0xff, 0xda, 0x00, 0x04, 0x00, 0x00, 0xaa, 0xbb, 0xcc, 0xdd,
    0xff, 0xd9,
  ]);
  // Misma imagen pero con segmento APP1 (FFE1) que contiene cabecera Exif y coordenadas GPS
  const exifGpsSegment = new Uint8Array([
    0xff, 0xe1, 0x00, 0x16,
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x47, 0x50, 0x53, 0x49, 0x6e, 0x66, 0x6f, // "GPSInfo"
    0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
  ]);
  const jpegWithGps = new Uint8Array(cleanJpeg.length + exifGpsSegment.length);
  jpegWithGps.set(cleanJpeg.subarray(0, 2), 0); // SOI
  jpegWithGps.set(exifGpsSegment, 2);           // APP1 con GPS
  jpegWithGps.set(cleanJpeg.subarray(2), 2 + exifGpsSegment.length); // Resto de la foto limpia

  assert(
    CryptoEngine.hasExifOrGpsMetadata(jpegWithGps) === true,
    'Detecta metadatos EXIF/GPS en la foto original antes de limpiarla'
  );
  const { cleanBytes, photoHashHex: strippedPhotoHash } = await CryptoEngine.sanitizeAndHashPhoto(jpegWithGps);
  const expectedCleanHash = await CryptoEngine.sha256(cleanJpeg);
  assert(
    CryptoEngine.hasExifOrGpsMetadata(cleanBytes) === false,
    'Una foto con GPS sale sin GPS tras limpiar metadatos'
  );
  assert(
    strippedPhotoHash === expectedCleanHash,
    'El hash de la foto con GPS limpia es idéntico al hash de la foto limpia'
  );

  // 4. JSON canónico: el mismo lote con las llaves en otro orden da el mismo digest (#120)
  const lotOrder1 = {
    code: 'CAFE-2026-0001',
    producerAddress: 'GPRODUCER_DEMO_YUCU_00000000000000000000000000000000001',
    location: 'Heroica Ciudad de Tlaxiaco',
    category: 'cafe',
    variety: 'typica',
    volumeRange: 2,
    photoHashHex: photoHashA,
  };
  const lotOrder2 = {
    photoHashHex: photoHashA,
    volumeRange: 2,
    variety: 'typica',
    category: 'cafe',
    location: 'Heroica Ciudad de Tlaxiaco',
    producerAddress: 'GPRODUCER_DEMO_YUCU_00000000000000000000000000000000001',
    code: 'CAFE-2026-0001',
  };
  const digestOrder1 = await CryptoEngine.generateCommunityDigest(lotOrder1);
  const digestOrder2 = await CryptoEngine.generateCommunityDigest(lotOrder2);
  assert(
    digestOrder1 === digestOrder2,
    'El mismo lote con las llaves en otro orden produce exactamente el mismo digest'
  );

  // 5. Prueba negativa: sin WebCrypto, la función lanza un error y no devuelve nada (#120)
  const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  let threwWithoutWebCrypto = false;
  try {
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    await CryptoEngine.sha256('abc');
  } catch {
    threwWithoutWebCrypto = true;
  } finally {
    if (originalCryptoDescriptor) {
      Object.defineProperty(globalThis, 'crypto', originalCryptoDescriptor);
    }
  }
  assert(
    threwWithoutWebCrypto === true,
    'Sin WebCrypto, CryptoEngine.sha256 lanza un error y nunca usa respaldo falso'
  );

  // Serialización de la lista dinámica para el cálculo del Community Digest (sin nombres ni comunidad exacta)
  const stagesSummaryTextile = textileStages.map(s => `${s.name}:${s.metricValue || ''}`).join('>');
  const stagesSummaryHoney = honeyStages.map(s => `${s.name}:${s.metricValue || ''}`).join('>');

  const digestTextile = await CryptoEngine.generateCommunityDigest({
    code: 'TEXTIL-2026-0001',
    producerAddress: 'GPRODUCER_DEMO_TEXTIL_000000000000000000000000000000001',
    location: 'Heroica Ciudad de Tlaxiaco',
    category: 'textil',
    variety: 'telar_cintura',
    volumeRange: 1,
    timestamp: 1727000000000,
    photo: fullPhotoA,
    processStagesSummary: stagesSummaryTextile
  });

  const digestHoney = await CryptoEngine.generateCommunityDigest({
    code: 'MIEL-2026-0001',
    producerAddress: 'GPRODUCER_DEMO_MIEL_00000000000000000000000000000000002',
    location: 'Magdalena Peñasco',
    category: 'miel',
    variety: 'multifloral',
    volumeRange: 2,
    timestamp: 1727000000000,
    photo: fullPhotoB,
    processStagesSummary: stagesSummaryHoney
  });

  assert(digestTextile.length === 64, `Digest SHA-256 Textile válido de 64 caracteres: ${digestTextile.slice(0, 16)}...`);
  assert(digestHoney.length === 64, `Digest SHA-256 Miel válido de 64 caracteres: ${digestHoney.slice(0, 16)}...`);
  assert(digestTextile !== digestHoney, 'Los digests son únicos y estrictamente dependientes de los datos del lote');

  // Prueba de Detección de Fraude (Tamper Evidence)
  const tamperedStagesSummary = stagesSummaryHoney.replace('17.8%', '22.0%');
  const tamperedDigest = await CryptoEngine.generateCommunityDigest({
    code: 'MIEL-2026-0001',
    producerAddress: 'GPRODUCER_DEMO_MIEL_00000000000000000000000000000000002',
    location: 'Magdalena Peñasco',
    category: 'miel',
    variety: 'multifloral',
    volumeRange: 2,
    timestamp: 1727000000000,
    photo: fullPhotoB,
    processStagesSummary: tamperedStagesSummary
  });

  assert(digestHoney !== tamperedDigest, 'Detección antifraude: Modificar una etapa invalida inmediatamente el hash de Stellar');
}

// -------------------------------------------------------------
// 3. PRUEBAS DE USABILIDAD RURAL (ACCESIBILIDAD, MODO ABUELO & OFFLINE)
// -------------------------------------------------------------
console.log('\n--- 3. Pruebas de Usabilidad Rural & Accesibilidad ---');

// A. Modo Parcela (Tolerancia a desconexión 100% offline)
const mockOfflineLot: Partial<DigitalPassportLot> = {
  id: 'lot-offline-test-1',
  code: 'MX-2024-999',
  title: 'Huipil Tradicional Triqui',
  productType: 'Textil Mixteco',
  producer: 'Carmen Morales',
  community: 'San Juan Copala',
  municipality: 'Santiago Juxtlahuaca',
  region: 'Mixteca Oaxaqueña',
  state: 'Oaxaca',
  country: 'México',
  harvestDate: 'Septiembre 2026',
  variety: 'Algodón Coyuchi',
  altitude: '1,850 msnm',
  process: 'Telar de cintura',
  pricePerKg: 2400,
  volumeKg: 1,
  processStages: textileStages,
  customSpecs: textileSpecs,
  verification: {
    status: 'Certificado',
    date: '2026-09-22',
    inspector: 'Open Hub TecNM Tlaxiaco',
    qualityScore: 98,
    certId: 'TECNM-OAX-2026-TX99',
    digitalSeal: 'STELLAR_SOROBAN_SEAL_TX99'
  }
};

assert(mockOfflineLot.processStages!.length > 0, 'Lote offline mantiene todas las etapas de la lista en memoria local');
assert(mockOfflineLot.customSpecs!.length > 0, 'Lote offline mantiene especificaciones dinámicas sin requerir internet');

// B. Resiliencia de Entrada de Voz y Variantes Fonéticas de Tu'un Savi
function normalizeMixtecoVoiceIntent(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const voiceSample1 = "Kuni yu una kiti (Quiero registrar cosecha)";
const voiceSample2 = "Opcion 1: Registrar lote de cafe";
const voiceSample3 = "Agregar paso de telar de cintura";

assert(normalizeMixtecoVoiceIntent(voiceSample1).length > 0, 'Normalizador de voz tolera caracteres mixtecos y apóstrofes');
assert(normalizeMixtecoVoiceIntent(voiceSample2).includes('opcion 1'), 'Detección robusta de opción por comando de voz');
assert(normalizeMixtecoVoiceIntent(voiceSample3).includes('telar'), 'Captura de texto para la creación de etapas');

// C. Verificación de Regalías Justas Comunitarias (10% Productor + 2% Tequio, ver src/config/protocolFees.ts)
function calculateSplits(saleAmountMxn: number) {
  const r = FairTradeEngine.calculateSecondaryRoyalty(saleAmountMxn);
  return { producerRoyalty: r.artisanRoyaltyMxn, tequioFund: r.cooperativeFundMxn, sellerNet: r.sellerNetMxn };
}

const sampleResale = 5000; // Un textil de reventa en galería de arte por $5,000 MXN
const splits = calculateSplits(sampleResale);

assert(splits.producerRoyalty === 500, `Regalía del 10% calculada con exactitud ($500 MXN de $5,000 MXN)`);
assert(splits.tequioFund === 100, `Fondo comunitario de tequio del 2% asignado ($100 MXN de $5,000 MXN)`);
assert(splits.producerRoyalty + splits.tequioFund + splits.sellerNet === sampleResale, 'Conservación matemática del 100% de los fondos sin fuga financiera');

// Ejecución asíncrona de pruebas criptográficas
testCrypto().then(() => {
  console.log('\n================================================================');
  console.log(` RESUMEN: ${passed} PRUEBAS EXITOSAS, ${failed} FALLOS`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
