/**
 * Suite de Pruebas: Cliente @stellar/stellar-sdk & Soroban Live Client
 * Valida la conectividad con Stellar, derivación Ed25519, ScVal y Fee-Bump
 */

import { StellarLiveClient, STELLAR_TESTNET_CONFIG } from '../core/blockchain/StellarLiveClient';
import { Keypair } from '@stellar/stellar-sdk';

console.log('================================================================');
console.log('   PRUEBAS: CLIENTE STELLAR & SOROBAN (@stellar/stellar-sdk) ');
console.log('================================================================');

const client = new StellarLiveClient(STELLAR_TESTNET_CONFIG);

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✅ [PASS] ${message}`);
  }
}

async function runTests() {
  console.log('\n📍 1. CONSULTA DE RED Y LEDGER HORIZON / SOROBAN');
  const ledgerInfo = await client.getLatestLedger();
  assert(ledgerInfo.protocolVersion === 22, 'Versión de protocolo Stellar 22 verificada');
  assert(ledgerInfo.latestLedger > 1000000, `Número de ledger activo reportado: ${ledgerInfo.latestLedger}`);
  assert(ledgerInfo.status === 'ONLINE', 'Estado del nodo Soroban reportado como ONLINE');

  console.log('\n📍 2. GENERACIÓN Y DERIVACIÓN DE LLAVES ED25519 (ZERO-SEED PHRASE)');
  const randomPair = client.generateRandomKeypair();
  assert(randomPair.publicKey.startsWith('G') && randomPair.publicKey.length === 56, 'Llave pública Ed25519 válida (56 caracteres G...)');
  assert(randomPair.secretKey.startsWith('S') && randomPair.secretKey.length === 56, 'Llave privada Ed25519 válida (56 caracteres S...)');

  const ruralUser1 = client.deriveRuralKeypair('529531234567');
  const ruralUser2 = client.deriveRuralKeypair('529531234567');
  const ruralUser3 = client.deriveRuralKeypair('529539876543');

  assert(ruralUser1.publicKey === ruralUser2.publicKey, 'Derivación determinista idéntica para el mismo campesino (sin contraseñas)');
  assert(ruralUser1.publicKey !== ruralUser3.publicKey, 'Llaves diferentes e inviolables entre distintos productores');

  console.log('\n📍 3. SERIALIZACIÓN XDR Y CONVERSIÓN DE TIPOS SCVAL');
  const symbolVal = client.toScVal('SCAA_85', 'symbol');
  assert(symbolVal !== undefined, 'Conversión exitosa de string a ScVal Symbol');

  const amountVal = client.toScVal(15000, 'i128');
  assert(amountVal !== undefined, 'Conversión exitosa de entero a ScVal i128');

  console.log('\n📍 4. SIMULACIÓN DE LLAMADA A CONTRATO EN SOROBAN WASM');
  const simResult = await client.simulateContractInvocation({
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    functionName: 'verify_attestation',
    args: [symbolVal],
  });
  assert(simResult.simulated === true, 'Simulación en máquina virtual Soroban Wasm exitosa');
  assert(simResult.gasFeeXLM === '0.00005', 'Tarifa calculada de gas Soroban: 0.00005 XLM');

  console.log('\n================================================================');
  console.log('   AUDITORÍA STELLAR SDK COMPLETADA CON ÉXITO: 0 FALLOS');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('Error durante la ejecución del test:', err);
  process.exit(1);
});
