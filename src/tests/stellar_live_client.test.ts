/**
 * Suite de Pruebas: Cliente Oficial @stellar/stellar-sdk & Soroban Live Client (#105)
 * Valida:
 * - Consulta de red y conversión ScVal
 * - Ausencia total de funciones que generen o deriven llaves de usuario
 * - Fee-bump del lado del servidor sin recibir llaves secretas por parámetro
 * - Aislamiento del bundle UI: ningún archivo importado por src/App.tsx o src/components/ importa @stellar/stellar-sdk
 */

import fs from 'node:fs';
import path from 'node:path';
import { StellarLiveClient, STELLAR_TESTNET_CONFIG } from '../core/blockchain/StellarLiveClient';

console.log('================================================================');
console.log('   PRUEBAS: CLIENTE OFICIAL STELLAR & SOROBAN (@stellar/stellar-sdk) ');
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

function collectReachableImports(entryFiles: string[], srcRoot: string): Set<string> {
  const visited = new Set<string>();
  const queue = [...entryFiles];
  const importRegex = /(?:import|export)\s+(?:[^'"]*from\s+)?['"]([^'"]+)['"]/g;

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current || visited.has(current) || !fs.existsSync(current)) continue;
    visited.add(current);

    const content = fs.readFileSync(current, 'utf-8');
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(content)) !== null) {
      const spec = match[1];
      if (!spec.startsWith('.')) continue;

      const baseResolved = path.resolve(path.dirname(current), spec);
      const candidates = [
        baseResolved,
        `${baseResolved}.ts`,
        `${baseResolved}.tsx`,
        path.join(baseResolved, 'index.ts'),
        path.join(baseResolved, 'index.tsx'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile() && candidate.startsWith(srcRoot)) {
          queue.push(candidate);
          break;
        }
      }
    }
  }
  return visited;
}

async function runTests() {
  console.log('\n📍 1. CONSULTA DE RED Y LEDGER HORIZON / SOROBAN');
  const ledgerInfo = await client.getLatestLedger();
  assert(ledgerInfo.protocolVersion === 22, 'Versión de protocolo Stellar 22 verificada');
  assert(ledgerInfo.latestLedger > 1000000, `Número de ledger activo reportado: ${ledgerInfo.latestLedger}`);
  assert(ledgerInfo.status === 'ONLINE', 'Estado del nodo Soroban reportado como ONLINE');
  assert(
    ledgerInfo.source === 'testnet' || ledgerInfo.source === 'simulated',
    `Origen explícito reportado: ${ledgerInfo.source}`
  );

  console.log('\n📍 2. REGLA NO CUSTODIAL: SIN GENERACIÓN NI DERIVACIÓN DE LLAVES (#105)');
  const prototypeMethods = Object.getOwnPropertyNames(StellarLiveClient.prototype);
  assert(
    !prototypeMethods.some((name) => name.toLowerCase().includes('keypair')),
    'StellarLiveClient no expone métodos para generar ni derivar pares de llaves'
  );
  assert(
    client.buildSponsoredFeeBump.length === 1,
    'buildSponsoredFeeBump solo recibe el XDR firmado (1 parámetro) y ninguna llave secreta'
  );

  // Prueba negativa: sin STELLAR_SPONSOR_SECRET en .env, buildSponsoredFeeBump rechaza la operación
  const prevSponsorSecret = process.env.STELLAR_SPONSOR_SECRET;
  delete process.env.STELLAR_SPONSOR_SECRET;
  let threwMissingEnv = false;
  try {
    client.buildSponsoredFeeBump('AAAA');
  } catch {
    threwMissingEnv = true;
  } finally {
    if (prevSponsorSecret !== undefined) {
      process.env.STELLAR_SPONSOR_SECRET = prevSponsorSecret;
    }
  }
  assert(
    threwMissingEnv === true,
    'buildSponsoredFeeBump falla de forma segura cuando STELLAR_SPONSOR_SECRET no está configurada'
  );

  console.log('\n📍 3. SERIALIZACIÓN XDR Y CONVERSIÓN DE TIPOS SCVAL');
  const symbolVal = client.toScVal('SCAA_85', 'symbol');
  assert(symbolVal !== undefined, 'Conversión exitosa de string a ScVal Symbol');
  assert(client.fromScVal(symbolVal) === 'SCAA_85', 'Conversión inversa de ScVal a valor nativo');

  const amountVal = client.toScVal(15000, 'i128');
  assert(amountVal !== undefined, 'Conversión exitosa de entero a ScVal i128');

  console.log('\n📍 4. SIMULACIÓN DE LLAMADA A CONTRATO EN SOROBAN WASM');
  const simResult = await client.simulateContractInvocation({
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    functionName: 'verify_attestation',
    args: [symbolVal],
  });
  assert(simResult.simulated === true && simResult.source === 'simulated', 'Simulación marcada con source: simulated');
  assert(simResult.gasFeeXLM === '0.00005', 'Tarifa calculada de gas Soroban: 0.00005 XLM');

  console.log('\n📍 5. AISLAMIENTO DEL BUNDLE DE UI SIN @stellar/stellar-sdk (#105)');
  const srcRoot = path.resolve(process.cwd(), 'src');
  const componentsDir = path.join(srcRoot, 'components');
  const componentFiles = fs
    .readdirSync(componentsDir)
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
    .map((f) => path.join(componentsDir, f));
  const entryPoints = [path.join(srcRoot, 'App.tsx'), ...componentFiles];
  const reachableUiFiles = collectReachableImports(entryPoints, srcRoot);

  for (const filePath of reachableUiFiles) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const importsStellarSdk = /from\s+['"]@stellar\/stellar-sdk['"]/.test(fileContent);
    assert(
      !importsStellarSdk,
      `El archivo alcanzable desde la UI no importa @stellar/stellar-sdk: ${path.relative(srcRoot, filePath)}`
    );
  }

  console.log('\n================================================================');
  console.log('   AUDITORÍA STELLAR SDK COMPLETADA CON ÉXITO: 0 FALLOS');
  console.log('================================================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Error durante la ejecución del test:', err);
  process.exit(1);
});
