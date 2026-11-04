/**
 * Automated Tests:
 * Yucu Infrastructure Protocol & AI Oracles
 * 
 * 1. AIVoiceOracle (Tu'un Savi / Spanish normalization)
 * 2. AIQualityOracle (SCAA Specialty Coffee & Artisan Textiles)
 * 3. AIEUDRSatelliteOracle (EU Deforestation Regulation compliance)
 * 4. AISettlementSolver (Optimal path payment routing)
 * 5. RaizProtocolSDK (Client initialization and metrics)
 */

import { RaizAIOracles } from '../core/ai/RaizAIOracles';
import { RaizProtocolSDK } from '../core/sdk/RaizProtocolSDK';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runOracleAndProtocolSuite() {
  console.log('================================================================');
  console.log('   SUITE: RAÍZ INFRASTRUCTURE PROTOCOL & AI ORACLES             ');
  console.log('================================================================');

  // 1. Voice Oracle Test
  console.log('\n📍 1. ORÁCULO DE VOZ Y DIALECTO INDÍGENA (Tu\'un Savi / Español)');
  const voiceResultMixtec = await RaizAIOracles.parseAcousticVoiceInput('Kuni yu kiti 120 kilos café en la loma de San Pedro');
  assert(voiceResultMixtec.source === 'simulated', 'Marca origen simulado en AIVoiceOracle');
  assert(voiceResultMixtec.detectedLanguage === 'tuun_savi', 'Detecta idioma mixteco Tu\'un Savi');
  assert(voiceResultMixtec.extractedFields.productType === 'coffee', 'Extrae producto café');
  assert(voiceResultMixtec.extractedFields.quantity === 120, 'Extrae cantidad numérica 120 kg');
  assert(voiceResultMixtec.payloadDigest.length === 64, 'Genera digest SHA-256 canónico para Stellar');

  const voiceResultTextile = await RaizAIOracles.parseAcousticVoiceInput('Quiero registrar 2 rebozos de telar de cintura con grana cochinilla');
  assert(voiceResultTextile.extractedFields.productType === 'textile', 'Identifica dominio textil de telar');
  assert(voiceResultTextile.extractedFields.community === 'San Pablo Tijaltepec', 'Asigna comunidad artesanal');

  // 2. AI Quality Oracle Test
  console.log('\n📍 2. ORÁCULO DE CALIDAD RWA (Visión Computacional & SCAA)');
  const coffeeQuality = await RaizAIOracles.evaluateLotQuality({
    productType: 'coffee',
    sampleMetrics: { moistureInput: 11.2, defectRatio: 0.02 },
  });
  assert(coffeeQuality.source === 'simulated', 'Marca origen simulado en AIQualityOracle');
  assert(coffeeQuality.overallScore > 85, 'Puntaje de café supera 85 puntos SCAA (Especialidad)');
  assert(coffeeQuality.tier === 'Specialty Q-Grade (Export)', 'Clasificación exportable');
  assert(coffeeQuality.exportReady === true, 'Bandera exportReady activada');
  assert(coffeeQuality.attestationHash.length === 64, 'Hash de atestación criptográfica generado');

  const textileQuality = await RaizAIOracles.evaluateLotQuality({ productType: 'textile' });
  assert(textileQuality.tier === 'Master Artisan Heritage', 'Clasificación de patrimonio artesanal maestro');
  assert(textileQuality.metrics.naturalDyeDetected === true, 'Detección de tintes naturales verificada');

  // 3. EUDR Satellite Oracle Test
  console.log('\n📍 3. ORÁCULO SATELITAL ANTI-DEFORESTACIÓN (EUDR Unión Europea)');
  const eudrReport = await RaizAIOracles.verifyEUDRCompliance({
    community: 'Heroica Ciudad de Tlaxiaco',
    latitude: 17.268,
    longitude: -97.681,
  });
  assert(eudrReport.source === 'simulated', 'Marca origen simulado en AIEUDRSatelliteOracle');
  assert(eudrReport.forestCoverLossDetected === false, 'Cero deforestación detectada desde 2020');
  assert(eudrReport.satelliteDataAttestation.eudrComplianceCertified === true, 'Certificado de exportación EUDR emitido');
  assert(eudrReport.complianceId.startsWith('EUDR-MX-OAX-'), 'Identificador de conformidad formateado');

  // 4. AI Settlement Solver Test
  console.log('\n📍 4. SOLVER AUTÓNOMO DE RUTA DE LIQUIDACIÓN HÍBRIDA');
  const routeMexicoSPEI = RaizAIOracles.solveOptimalSettlement({
    amountUSDC: 500,
    destinationCountry: 'MX',
    preferredCashOut: 'banking_spei',
  });
  assert(routeMexicoSPEI.targetRail === 'ETHERFUSE_SPEI', 'Rutea a Etherfuse Banxico SPEI');
  assert(routeMexicoSPEI.gasSponsorship.gasFeeXLM === 0, 'Tarifa de gas 100% patrocinada para el productor');
  assert(routeMexicoSPEI.estimatedNetReceived === 9250, 'Conversión neta exacta a 18.50 MXN/USDC ($9,250 MXN)');

  const routeMexicoCash = RaizAIOracles.solveOptimalSettlement({
    amountUSDC: 200,
    destinationCountry: 'MX',
    preferredCashOut: 'cash_parcel',
  });
  assert(routeMexicoCash.targetRail === 'MICOPAY_CASH', 'Rutea a efectivo MicoPay en parcela con transportistas locales');

  // 5. Universal SDK Test
  console.log('\n📍 5. SDK UNIVERSAL DEL YUCU PROTOCOL (@yucu-protocol/sdk)');
  const sdk = new RaizProtocolSDK({ network: 'stellar-mainnet' });
  const metrics = sdk.getMetrics();
  assert(metrics.aiOraclesOnline === 4, '4 oráculos de IA activos en la infraestructura');
  assert(metrics.totalTokenizedRWAKg > 40000, 'Volumen de RWA registrado');
  assert(metrics.supportedFiatRails.length === 4, '4 rieles fiduciarios soportados (MX, BO, BR)');
  const sdkHash = await sdk.crypto.sha256('abc');
  assert(sdkHash === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'SDK crypto.sha256 usa SHA-256 real');

  console.log('================================================================');
  console.log('   RESULTADO: TODAS LAS PRUEBAS DE INFRAESTRUCTURA & IA APROBADAS');
  console.log('================================================================\n');
}

runOracleAndProtocolSuite();
