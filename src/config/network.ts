/**
 * Configuración centralizada de red para elegir entre el modo simulado (`simulated`)
 * y Stellar Testnet (`testnet`) en un solo lugar (ADR-004, sección 4; Issue #118).
 *
 * Regla 4 de AGENTS.md: ningún componente de `src/components/` debe importar este módulo
 * directamente; la UI consume únicamente `src/core/chain/`.
 */

import rawTestnetDeployment from '../../contracts/deployments/testnet.json';

export type ChainMode = 'simulated' | 'testnet';

export interface TestnetAccountsConfig {
  admin: string;
  communalTreasury: string;
  micopayAuthority: string;
}

export interface TestnetContractsConfig {
  attestationRegistry: string;
  lotPassport: string;
  perpetualRoyalties: string;
  fairEscrow: string;
}

export interface TestnetDeploymentManifest {
  network?: string;
  networkPassphrase?: string;
  rpcUrl?: string;
  deployedAt?: string;
  commit?: string;
  accounts?: Partial<TestnetAccountsConfig>;
  contracts?: Partial<TestnetContractsConfig>;
}

export interface NetworkConfig {
  mode: ChainMode;
  isSimulated: boolean;
  rpcUrl: string;
  networkPassphrase: string;
  accounts: TestnetAccountsConfig;
  contracts: TestnetContractsConfig;
}

export interface ResolveNetworkConfigOptions {
  env?: Record<string, string | undefined>;
  deployment?: TestnetDeploymentManifest | null;
}

const REQUIRED_ACCOUNT_KEYS: readonly (keyof TestnetAccountsConfig)[] = [
  'admin',
  'communalTreasury',
  'micopayAuthority',
];

const REQUIRED_CONTRACT_KEYS: readonly (keyof TestnetContractsConfig)[] = [
  'attestationRegistry',
  'lotPassport',
  'perpetualRoyalties',
  'fairEscrow',
];

const STELLAR_PUBLIC_KEY_PATTERN = /^G[A-Z2-7]{55}$/;
const SOROBAN_CONTRACT_ID_PATTERN = /^C[A-Z2-7]{55}$/;

function readRuntimeEnv(): Record<string, string | undefined> {
  const combined: Record<string, string | undefined> = {};

  if (typeof process !== 'undefined' && process.env) {
    for (const [key, value] of Object.entries(process.env)) {
      combined[key] = value;
    }
  }

  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
  if (metaEnv && typeof metaEnv === 'object') {
    for (const [key, value] of Object.entries(metaEnv)) {
      if (value !== undefined) {
        combined[key] = String(value);
      }
    }
  }

  return combined;
}

function validateTestnetManifest(
  manifest: TestnetDeploymentManifest | null | undefined,
  rpcUrl: string,
  networkPassphrase: string,
): { accounts: TestnetAccountsConfig; contracts: TestnetContractsConfig } {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error(
      'Configuración de testnet incompleta: no se pudo leer contracts/deployments/testnet.json.',
    );
  }

  if (!rpcUrl || (!rpcUrl.startsWith('https://') && !rpcUrl.startsWith('http://'))) {
    throw new Error(
      'Configuración de testnet incompleta en contracts/deployments/testnet.json: falta una URL de RPC válida ("rpcUrl").',
    );
  }

  if (!networkPassphrase) {
    throw new Error(
      'Configuración de testnet incompleta en contracts/deployments/testnet.json: falta la frase de red ("networkPassphrase").',
    );
  }

  const rawAccounts = manifest.accounts;
  if (!rawAccounts || typeof rawAccounts !== 'object') {
    throw new Error(
      'Configuración de testnet incompleta en contracts/deployments/testnet.json: falta la sección "accounts".',
    );
  }

  for (const key of REQUIRED_ACCOUNT_KEYS) {
    const value = rawAccounts[key]?.trim() ?? '';
    if (!value) {
      throw new Error(
        `Configuración de testnet incompleta en contracts/deployments/testnet.json: falta la cuenta "${key}" en "accounts".`,
      );
    }
    if (!STELLAR_PUBLIC_KEY_PATTERN.test(value)) {
      throw new Error(
        `Configuración de testnet inválida en contracts/deployments/testnet.json: la cuenta "${key}" debe ser una dirección pública Stellar (G... de 56 caracteres).`,
      );
    }
  }

  const rawContracts = manifest.contracts;
  if (!rawContracts || typeof rawContracts !== 'object') {
    throw new Error(
      'Configuración de testnet incompleta en contracts/deployments/testnet.json: falta la sección "contracts".',
    );
  }

  for (const key of REQUIRED_CONTRACT_KEYS) {
    const value = rawContracts[key]?.trim() ?? '';
    if (!value) {
      throw new Error(
        `Configuración de testnet incompleta en contracts/deployments/testnet.json: falta el ID del contrato "${key}" en "contracts".`,
      );
    }
    if (!SOROBAN_CONTRACT_ID_PATTERN.test(value)) {
      throw new Error(
        `Configuración de testnet inválida en contracts/deployments/testnet.json: el contrato "${key}" debe ser un ID de contrato Soroban válido (C... de 56 caracteres).`,
      );
    }
  }

  return {
    accounts: {
      admin: rawAccounts.admin!.trim(),
      communalTreasury: rawAccounts.communalTreasury!.trim(),
      micopayAuthority: rawAccounts.micopayAuthority!.trim(),
    },
    contracts: {
      attestationRegistry: rawContracts.attestationRegistry!.trim(),
      lotPassport: rawContracts.lotPassport!.trim(),
      perpetualRoyalties: rawContracts.perpetualRoyalties!.trim(),
      fairEscrow: rawContracts.fairEscrow!.trim(),
    },
  };
}

/**
 * Resuelve y valida la configuración de red a partir de `VITE_CHAIN_MODE` y `contracts/deployments/testnet.json`.
 * Si `VITE_CHAIN_MODE` no está definida, arranca en modo `'simulated'`.
 */
export function resolveNetworkConfig(options?: ResolveNetworkConfigOptions): NetworkConfig {
  const env = options?.env ?? readRuntimeEnv();
  const rawMode = env.VITE_CHAIN_MODE?.trim();

  const mode: ChainMode = !rawMode
    ? 'simulated'
    : rawMode === 'simulated' || rawMode === 'testnet'
      ? rawMode
      : (() => {
          throw new Error(
            `Modo de red inválido en VITE_CHAIN_MODE: "${rawMode}". Los valores permitidos son "simulated" o "testnet".`,
          );
        })();

  const manifest: TestnetDeploymentManifest | null =
    options && 'deployment' in options
      ? (options.deployment ?? null)
      : (rawTestnetDeployment as TestnetDeploymentManifest);

  const rpcUrl = (env.VITE_STELLAR_RPC_URL?.trim() || manifest?.rpcUrl?.trim()) ?? '';
  const networkPassphrase =
    (env.VITE_STELLAR_NETWORK_PASSPHRASE?.trim() || manifest?.networkPassphrase?.trim()) ?? '';

  if (mode === 'testnet') {
    const validated = validateTestnetManifest(manifest, rpcUrl, networkPassphrase);
    return {
      mode: 'testnet',
      isSimulated: false,
      rpcUrl,
      networkPassphrase,
      accounts: validated.accounts,
      contracts: validated.contracts,
    };
  }

  return {
    mode: 'simulated',
    isSimulated: true,
    rpcUrl,
    networkPassphrase,
    accounts: {
      admin: manifest?.accounts?.admin?.trim() ?? '',
      communalTreasury: manifest?.accounts?.communalTreasury?.trim() ?? '',
      micopayAuthority: manifest?.accounts?.micopayAuthority?.trim() ?? '',
    },
    contracts: {
      attestationRegistry: manifest?.contracts?.attestationRegistry?.trim() ?? '',
      lotPassport: manifest?.contracts?.lotPassport?.trim() ?? '',
      perpetualRoyalties: manifest?.contracts?.perpetualRoyalties?.trim() ?? '',
      fairEscrow: manifest?.contracts?.fairEscrow?.trim() ?? '',
    },
  };
}

export const networkConfig: NetworkConfig = resolveNetworkConfig();
