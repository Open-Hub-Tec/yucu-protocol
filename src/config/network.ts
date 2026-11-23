import testnetDeployment from '../../contracts/deployments/testnet.json';

export type ChainMode = 'simulated' | 'testnet';

export interface NetworkConfig {
  mode: ChainMode;
  rpcUrl: string | null;
  networkPassphrase: string | null;
  contracts: Readonly<Record<string, string>>;
}

type EnvSource = Record<string, string | undefined>;

const REQUIRED_CONTRACT_IDS = [
  'attestationRegistry',
  'lotPassport',
  'perpetualRoyalties',
  'fairEscrow',
] as const;

function currentEnv(): EnvSource {
  const viteEnv = (import.meta as ImportMeta & { env?: EnvSource }).env;
  if (viteEnv && typeof viteEnv === 'object') return viteEnv;
  return typeof process === 'undefined' ? {} : process.env;
}

function readMode(env: EnvSource): ChainMode {
  const rawMode = env.VITE_CHAIN_MODE;
  if (rawMode === undefined || rawMode.trim() === '') return 'simulated';
  const mode = rawMode.trim();
  if (mode === 'simulated' || mode === 'testnet') return mode;
  throw new Error(`Configuración de red no válida: VITE_CHAIN_MODE="${mode}". Usa "simulated" o "testnet".`);
}

function objectAt(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Configuración de red incompleta: falta ${field} en contracts/deployments/testnet.json.`);
  }
  return value as Record<string, unknown>;
}

function textAt(source: Record<string, unknown>, key: string, path = key): string {
  const value = source[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Configuración de red incompleta: falta ${path} en contracts/deployments/testnet.json.`);
  }
  return value.trim();
}

function readTestnetConfig(env: EnvSource, deployment: unknown): NetworkConfig {
  const source = objectAt(deployment, 'testnet.json');
  const contractsSource = objectAt(source.contracts, 'contracts');
  const rpcUrl = env.VITE_TESTNET_RPC_URL?.trim() || textAt(source, 'rpcUrl');
  const networkPassphrase = env.VITE_TESTNET_NETWORK_PASSPHRASE?.trim() || textAt(source, 'networkPassphrase');

  try {
    const url = new URL(rpcUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('protocolo no válido');
  } catch {
    throw new Error('Configuración de red no válida: la URL del RPC de testnet no es válida.');
  }

  const contracts: Record<string, string> = {};
  for (const id of REQUIRED_CONTRACT_IDS) {
    contracts[id] = textAt(contractsSource, id, `contracts.${id}`);
  }

  return { mode: 'testnet', rpcUrl, networkPassphrase, contracts };
}

export function readNetworkConfig(
  env: EnvSource = currentEnv(),
  deployment: unknown = testnetDeployment,
): NetworkConfig {
  const mode = readMode(env);
  if (mode === 'simulated') {
    return { mode, rpcUrl: null, networkPassphrase: null, contracts: {} };
  }
  return readTestnetConfig(env, deployment);
}
