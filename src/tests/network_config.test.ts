import fs from 'node:fs';
import path from 'node:path';
import { resolveNetworkConfig, type TestnetDeploymentManifest } from '../config/network';
import { chain, createChain, type LotRegistryPort } from '../core/chain';

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string): void {
  if (condition) {
    console.log(`  ✅ [CORRECTO] ${description}`);
    passed++;
  } else {
    console.error(`  ❌ [FALLO] ${description}`);
    failed++;
  }
}

function assertThrows(fn: () => unknown, expectedSubstring: string, description: string): void {
  try {
    fn();
    console.error(`  ❌ [FALLO] ${description} (no lanzó error)`);
    failed++;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes(expectedSubstring)) {
      console.log(`  ✅ [CORRECTO] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FALLO] ${description} (mensaje inesperado: ${msg})`);
      failed++;
    }
  }
}

async function runTests(): Promise<void> {
  console.log('================================================================================');
  console.log('   PRUEBAS: CONFIGURACIÓN DE RED SIMULADO / TESTNET (#118)                      ');
  console.log('================================================================================\n');

  const deploymentPath = path.resolve(process.cwd(), 'contracts/deployments/testnet.json');
  const rawDeploymentJson = JSON.parse(
    fs.readFileSync(deploymentPath, 'utf-8'),
  ) as Required<TestnetDeploymentManifest>;

  console.log('📍 1. MODO POR DEFECTO (SIMULATED)');
  const defaultCfg = resolveNetworkConfig({ env: {} });
  assert(
    defaultCfg.mode === 'simulated' && defaultCfg.isSimulated === true,
    'Sin VITE_CHAIN_MODE, resolveNetworkConfig arranca en modo "simulated"',
  );
  assert(
    chain.mode === 'simulated' && chain.network.isSimulated === true,
    'La instancia por defecto de chain arranca en modo "simulated"',
  );

  const explicitSim = resolveNetworkConfig({ env: { VITE_CHAIN_MODE: 'simulated' } });
  assert(
    explicitSim.mode === 'simulated' && explicitSim.isSimulated === true,
    'VITE_CHAIN_MODE="simulated" activa modo simulado',
  );

  console.log('\n📍 2. MODO TESTNET LEÍDO DESDE contracts/deployments/testnet.json');
  const testnetCfg = resolveNetworkConfig({ env: { VITE_CHAIN_MODE: 'testnet' } });
  assert(
    testnetCfg.mode === 'testnet' && testnetCfg.isSimulated === false,
    'VITE_CHAIN_MODE="testnet" activa modo testnet (isSimulated: false)',
  );
  assert(
    testnetCfg.rpcUrl === rawDeploymentJson.rpcUrl &&
      testnetCfg.networkPassphrase === rawDeploymentJson.networkPassphrase,
    'Lee rpcUrl y networkPassphrase directamente de contracts/deployments/testnet.json',
  );
  assert(
    testnetCfg.contracts.lotPassport === rawDeploymentJson.contracts.lotPassport &&
      testnetCfg.contracts.perpetualRoyalties === rawDeploymentJson.contracts.perpetualRoyalties &&
      testnetCfg.contracts.fairEscrow === rawDeploymentJson.contracts.fairEscrow &&
      testnetCfg.contracts.attestationRegistry === rawDeploymentJson.contracts.attestationRegistry,
    'Lee todos los IDs de contratos directamente de contracts/deployments/testnet.json',
  );
  assert(
    testnetCfg.accounts.admin === rawDeploymentJson.accounts.admin &&
      testnetCfg.accounts.communalTreasury === rawDeploymentJson.accounts.communalTreasury &&
      testnetCfg.accounts.micopayAuthority === rawDeploymentJson.accounts.micopayAuthority,
    'Lee las cuentas desplegadas desde contracts/deployments/testnet.json',
  );

  console.log('\n📍 3. SELECCIÓN DE PUERTOS EN createChain (CON RESPALDO SIMULADO)');
  const fallbackTestnetChain = createChain({ env: { VITE_CHAIN_MODE: 'testnet' } });
  const fallbackLot = await fallbackTestnetChain.lots.getLot('MX-2026-001');
  assert(
    fallbackTestnetChain.mode === 'testnet' && fallbackLot === null,
    'En modo testnet sin implementación específica aún, createChain usa el puerto simulado como respaldo funcional',
  );

  let customLotsCalled = false;
  const customLotsPort: LotRegistryPort = {
    prepareRegisterLot: async () => ({
      xdr: 'AAAA',
      networkPassphrase: testnetCfg.networkPassphrase,
      summary: 'Registro en testnet',
    }),
    submit: async () => ({
      txHash: 'a'.repeat(64),
      ledger: 12345,
      source: 'testnet',
      explorerUrl: 'https://stellar.expert/explorer/testnet/tx/' + 'a'.repeat(64),
    }),
    getLot: async (code: string) => {
      customLotsCalled = true;
      return {
        code,
        producerAddress: testnetCfg.accounts.admin,
        location: 'Tlaxiaco',
        category: 'cafe',
        variety: 'typica',
        volumeRange: 1,
        photoHashHex: 'b'.repeat(64),
        certified: true,
        registeredAt: 1730000000,
        source: 'testnet',
      };
    },
  };

  const injectedTestnetChain = createChain({
    env: { VITE_CHAIN_MODE: 'testnet' },
    testnetProviders: {
      lots: () => customLotsPort,
    },
  });
  const lotFromTestnet = await injectedTestnetChain.lots.getLot('YUCU-0001');
  assert(
    customLotsCalled && lotFromTestnet?.source === 'testnet',
    'En modo testnet con proveedor de puerto disponible, createChain elige la implementación de testnet',
  );

  console.log('\n📍 4. PRUEBAS NEGATIVAS: CONFIGURACIÓN INVÁLIDA O INCOMPLETA RECHAZADA');
  assertThrows(
    () => resolveNetworkConfig({ env: { VITE_CHAIN_MODE: 'mainnet' } }),
    'Modo de red inválido en VITE_CHAIN_MODE',
    'Rechaza un valor inválido en VITE_CHAIN_MODE ("mainnet") con error claro',
  );

  assertThrows(
    () =>
      resolveNetworkConfig({
        env: { VITE_CHAIN_MODE: 'testnet' },
        deployment: { ...rawDeploymentJson, rpcUrl: '' },
      }),
    'falta una URL de RPC válida',
    'Rechaza modo testnet cuando falta rpcUrl en testnet.json',
  );

  assertThrows(
    () =>
      resolveNetworkConfig({
        env: { VITE_CHAIN_MODE: 'testnet' },
        deployment: { ...rawDeploymentJson, networkPassphrase: '' },
      }),
    'falta la frase de red',
    'Rechaza modo testnet cuando falta networkPassphrase en testnet.json',
  );

  assertThrows(
    () =>
      resolveNetworkConfig({
        env: { VITE_CHAIN_MODE: 'testnet' },
        deployment: {
          ...rawDeploymentJson,
          contracts: {
            ...rawDeploymentJson.contracts,
            lotPassport: '',
          },
        },
      }),
    'falta el ID del contrato "lotPassport"',
    'Rechaza modo testnet cuando falta un contrato en testnet.json ("lotPassport")',
  );

  assertThrows(
    () =>
      resolveNetworkConfig({
        env: { VITE_CHAIN_MODE: 'testnet' },
        deployment: {
          ...rawDeploymentJson,
          contracts: {
            ...rawDeploymentJson.contracts,
            fairEscrow: 'CONTRATO_MAL_FORMADO',
          },
        },
      }),
    'el contrato "fairEscrow" debe ser un ID de contrato Soroban válido',
    'Rechaza modo testnet cuando un ID de contrato no tiene formato C... de 56 caracteres',
  );

  assertThrows(
    () =>
      resolveNetworkConfig({
        env: { VITE_CHAIN_MODE: 'testnet' },
        deployment: {
          ...rawDeploymentJson,
          accounts: {
            ...rawDeploymentJson.accounts,
            admin: '',
          },
        },
      }),
    'falta la cuenta "admin"',
    'Rechaza modo testnet cuando falta una cuenta requerida en testnet.json ("admin")',
  );

  console.log('\n📍 5. AISLAMIENTO DE LA UI (REGLA 4 DE AGENTS.MD)');
  const componentsDir = path.resolve(process.cwd(), 'src/components');
  const componentFiles = fs
    .readdirSync(componentsDir)
    .filter((name) => name.endsWith('.ts') || name.endsWith('.tsx'));
  const directImports = componentFiles.filter((file) => {
    const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
    return content.includes('config/network');
  });
  assert(
    directImports.length === 0,
    'Ningún archivo de src/components/ importa src/config/network directamente',
  );

  console.log('\n--------------------------------------------------------------------------------');
  console.log(`TOTAL PRUEBAS: ${passed + failed} | APROBADAS: ${passed} | FALLIDAS: ${failed}`);
  console.log('--------------------------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
