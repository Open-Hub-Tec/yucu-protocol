/**
 * Test Suite: Enjambre de Agentes Especializados & Nuevos Tipos de Atestación (DPP, IP, IoT)
 */

import { PROTOCOL_FEES } from '../config/protocolFees';
import { YucuAgentSwarm } from '../core/agents/YucuAgentSwarm';
import { raizProtocol } from '../core/sdk/RaizProtocolSDK';

console.log('================================================================');
console.log('   SUITE: ENJAMBRE DE AGENTES YUCU & NUEVAS ATESTACIONES RWA    ');
console.log('================================================================');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✅ [PASS] ${message}`);
  }
}

async function runTests() {
  console.log('\n📍 1. AGENTE DE PASAPORTE DIGITAL EUROPEO (DPP) & INSETTING DE CARBONO');
  const dppResult = await YucuAgentSwarm.runDPPCircularityAgent({
    lotCode: 'YUC-2026-881',
    agroforestryType: 'shade_grown_traditional',
    productionVolumeKg: 1000,
  });
  assert(dppResult.status === 'CERTIFIED', 'Certificación DPP emitida');
  assert(dppResult.schemaId === '0x05_DPP_CIRCULARITY', 'Esquema correcto 0x05_DPP_CIRCULARITY');
  assert(dppResult.attestationDigest.includes('2400kg'), 'Captura de carbono calculada: 2,400 kg CO2e secuestrados');
  assert(dppResult.standardsCompliance.includes('EU Ecodesign for Sustainable Products (ESPR)'), 'Conformidad con norma ESPR 2026');

  console.log('\n📍 2. AGENTE DE SALVAGUARDA DE PATRIMONIO CULTURAL INDÍGENA & REGALÍAS');
  const ipResult = await YucuAgentSwarm.runIndigenousIPGuardianAgent({
    artisanCommunity: 'San Pablo Tijaltepec',
    weaveTechnique: 'Pepinado Ancestral en Telar de Cintura',
    collectiveConsentVerified: true,
  });
  assert(ipResult.status === 'CERTIFIED', 'Escudo de propiedad colectiva comunitaria emitido');
  assert(ipResult.schemaId === '0x06_INDIGENOUS_IP', 'Esquema correcto 0x06_INDIGENOUS_IP');
  assert(ipResult.evidenceSummary.includes(`${PROTOCOL_FEES.artisanResaleRoyaltyPct}% creador + ${PROTOCOL_FEES.resaleTequioPct}% Tequio`), 'Regalía perpetua comunal programada');

  console.log('\n📍 3. AGENTE DE RESOLUCIÓN FINANCIERA MULTILATERAL');
  const settlementResult = await YucuAgentSwarm.runSettlementSolverAgent({
    amountUSDC: 500,
    destinationCountry: 'MX',
    settlementRail: 'spei',
  });
  assert(settlementResult.status === 'CERTIFIED', 'Ruta de liquidación fiduciaria resuelta');
  assert(settlementResult.standardsCompliance.includes('Banxico SPEI Regulation'), 'Riel regulado Banxico SPEI');

  console.log('\n📍 4. CATÁLOGO EXPANDIDO DE ESQUEMAS EN SDK (@yucu-protocol/sdk)');
  const schemas = raizProtocol.attestations.getSchemas();
  assert(schemas.length === 8, `8 esquemas canónicos disponibles en SDK (reportados: ${schemas.length})`);
  assert(schemas.some((s) => s.uid === '0x05_DPP'), 'Esquema 0x05_DPP presente en SDK');
  assert(schemas.some((s) => s.uid === '0x06_INDIP'), 'Esquema 0x06_INDIP presente en SDK');
  assert(schemas.some((s) => s.uid === '0x07_IOT'), 'Esquema 0x07_IOT presente en SDK');
  assert(schemas.some((s) => s.uid === '0x08_USMCA'), 'Esquema 0x08_USMCA presente en SDK');

  console.log('\n================================================================');
  console.log('   AUDITORÍA ENJAMBRE DE AGENTES: 100% PRUEBAS EXITOSAS (0 FALLOS)');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('Error en pruebas de agentes:', err);
  process.exit(1);
});
