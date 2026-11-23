import { readFileSync, readdirSync } from 'node:fs';
import testnetDeployment from '../../contracts/deployments/testnet.json';
import { readNetworkConfig } from '../config/network';
import {
  SimulatedCardWallet,
  SimulatedEscrow,
  SimulatedExternalWallet,
  SimulatedLotRegistry,
  SimulatedPayout,
  SimulatedWallet,
} from '../core/chain/SimulatedChain';

let failures = 0;
function check(cond: boolean, msg: string) {
  console.log(`${cond ? '  ✅ PASS' : '  ❌ FAIL'}: ${msg}`);
  if (!cond) failures++;
}

function errorFrom(fn: () => unknown): Error | null {
  try {
    fn();
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

type MutableDeployment = {
  rpcUrl?: string;
  networkPassphrase?: string;
  contracts: Record<string, string | undefined>;
};

function copyDeployment(): MutableDeployment {
  return structuredClone(testnetDeployment) as unknown as MutableDeployment;
}

async function run() {
  console.log('\n🌐 CONFIGURACIÓN DE RED (#118)');
  delete process.env.VITE_CHAIN_MODE;
  const { chain, createChain } = await import('../core/chain');

  const simulated = readNetworkConfig({});
  check(simulated.mode === 'simulated', 'Sin configuración, el modo es simulated');
  check(simulated.rpcUrl === null && simulated.networkPassphrase === null, 'El modo simulado no usa RPC ni passphrase');
  check(readNetworkConfig({ VITE_CHAIN_MODE: '' }).mode === 'simulated', 'Una variable vacía también usa simulated');
  check(readNetworkConfig({}, {}).mode === 'simulated', 'El modo simulado no necesita el JSON de testnet');

  const missingMode = errorFrom(() => readNetworkConfig({ VITE_CHAIN_MODE: 'mainnet' }));
  check(missingMode !== null && missingMode.message.includes('VITE_CHAIN_MODE'), 'Se rechaza un modo de red no previsto');

  const testnetEnv = {
    VITE_CHAIN_MODE: 'testnet',
    VITE_TESTNET_RPC_URL: 'https://rpc.de.prueba.test',
    VITE_TESTNET_NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
  };
  const testnet = readNetworkConfig(testnetEnv);
  check(testnet.mode === 'testnet', 'El modo testnet se lee de VITE_CHAIN_MODE');
  check(testnet.rpcUrl === testnetEnv.VITE_TESTNET_RPC_URL, 'Se lee la URL del RPC de testnet');
  check(testnet.networkPassphrase === testnetEnv.VITE_TESTNET_NETWORK_PASSPHRASE, 'Se lee la passphrase de testnet');
  check(testnet.contracts.lotPassport === testnetDeployment.contracts.lotPassport, 'El ID de lot_passport se toma del JSON de despliegue');
  check(testnet.contracts.fairEscrow === testnetDeployment.contracts.fairEscrow, 'El ID del escrow se toma del JSON de despliegue');

  const fromJson = readNetworkConfig({ VITE_CHAIN_MODE: 'testnet' });
  check(fromJson.rpcUrl === testnetDeployment.rpcUrl, 'Sin variable de RPC se usa la del JSON de despliegue');
  check(fromJson.networkPassphrase === testnetDeployment.networkPassphrase, 'Sin variable de passphrase se usa la del JSON');

  const badRpc = errorFrom(() => readNetworkConfig({ VITE_CHAIN_MODE: 'testnet', VITE_TESTNET_RPC_URL: 'rpc-invalido' }));
  check(badRpc !== null && badRpc.message.includes('RPC'), 'Se rechaza una URL de RPC inválida');

  const incompleteContracts = copyDeployment();
  delete incompleteContracts.contracts.lotPassport;
  const missingContract = errorFrom(() => readNetworkConfig({ VITE_CHAIN_MODE: 'testnet' }, incompleteContracts));
  check(missingContract !== null && missingContract.message.includes('contracts.lotPassport'), 'Un JSON sin ID de lot_passport da un error claro');

  const incompleteRpc = copyDeployment();
  delete incompleteRpc.rpcUrl;
  const missingRpc = errorFrom(() => readNetworkConfig({ VITE_CHAIN_MODE: 'testnet' }, incompleteRpc));
  check(missingRpc !== null && missingRpc.message.includes('rpcUrl'), 'Un JSON sin RPC da un error claro');

  const noContracts = copyDeployment() as unknown as Record<string, unknown>;
  delete noContracts.contracts;
  const missingContracts = errorFrom(() => readNetworkConfig({ VITE_CHAIN_MODE: 'testnet' }, noContracts));
  check(missingContracts !== null && missingContracts.message.includes('contracts'), 'Un JSON sin contratos da un error claro');

  const defaultChain = createChain(readNetworkConfig({}));
  check(defaultChain.wallets.device instanceof SimulatedWallet, 'El puerto device usa la versión simulada por defecto');
  check(defaultChain.wallets.card instanceof SimulatedCardWallet, 'El puerto card usa la versión simulada por defecto');
  check(defaultChain.wallets.external instanceof SimulatedExternalWallet, 'El puerto external usa la versión simulada por defecto');
  check(defaultChain.lots instanceof SimulatedLotRegistry, 'El registro de lotes usa la versión simulada por defecto');
  check(defaultChain.escrow instanceof SimulatedEscrow, 'El escrow usa la versión simulada por defecto');
  check(defaultChain.payout instanceof SimulatedPayout, 'El retiro usa la versión simulada por defecto');
  check(chain.wallets.device instanceof SimulatedWallet, 'La instancia global de la app arranca en modo simulado');

  const fallbackChain = createChain(readNetworkConfig({ VITE_CHAIN_MODE: 'testnet' }));
  check(fallbackChain.wallets.device instanceof SimulatedWallet, 'Sin adaptador de testnet, device cae al simulado');
  check(fallbackChain.lots instanceof SimulatedLotRegistry, 'Sin adaptador de testnet, lotes cae al simulado');
  check(fallbackChain.escrow instanceof SimulatedEscrow, 'Sin adaptador de testnet, escrow cae al simulado');
  check(fallbackChain.payout instanceof SimulatedPayout, 'Sin adaptador de testnet, payout cae al simulado');

  const componentsDir = new URL('../components/', import.meta.url);
  const uiFiles = readdirSync(componentsDir)
    .filter((name) => name.endsWith('.ts') || name.endsWith('.tsx'))
    .map((name) => new URL(name, componentsDir));
  uiFiles.push(new URL('../App.tsx', import.meta.url));
  uiFiles.push(new URL('../main.tsx', import.meta.url));
  const configReaders = uiFiles.filter((file) => {
    const content = readFileSync(file, 'utf8');
    return content.includes('VITE_CHAIN_MODE') || content.includes('config/network');
  });
  check(configReaders.length === 0, 'Ningún componente lee la configuración de red directamente');

  if (failures > 0) {
    console.error(`\n${failures} prueba(s) fallaron`);
    process.exit(1);
  }
  console.log('\n  Configuración de red: 0 fallos');
}
run();
