/**
 * Punto de entrada de los puertos de Stellar / Trustless Work (ADR-003, ADR-004 sección 4; Issue #118).
 * Elige entre la versión simulada y testnet según `src/config/network.ts` en un solo lugar,
 * sin que ningún componente de la UI tenga que cambiar. Mientras una implementación de testnet
 * no exista todavía (#91, #93, #96, #115, #117), usa la versión simulada como respaldo.
 */
import {
  resolveNetworkConfig,
  type ChainMode,
  type NetworkConfig,
  type ResolveNetworkConfigOptions,
} from '../../config/network';
import {
  SimulatedCardWallet,
  SimulatedEscrow,
  SimulatedExternalWallet,
  SimulatedLotRegistry,
  SimulatedWallet,
} from './SimulatedChain';
import type {
  CardWalletPort,
  DeviceWalletPort,
  EscrowPort,
  ExternalWalletPort,
  LotRegistryPort,
} from './ports';

export * from './ports';
export type { ChainMode, NetworkConfig, ResolveNetworkConfigOptions };

export interface TestnetPortProviders {
  wallets?: {
    device?: (network: NetworkConfig) => DeviceWalletPort;
    card?: (network: NetworkConfig) => CardWalletPort;
    external?: (network: NetworkConfig) => ExternalWalletPort;
  };
  lots?: (network: NetworkConfig) => LotRegistryPort;
  escrow?: (network: NetworkConfig) => EscrowPort;
}

export interface CreateChainOptions extends ResolveNetworkConfigOptions {
  testnetProviders?: TestnetPortProviders;
}

export interface Chain {
  mode: ChainMode;
  network: NetworkConfig;
  wallets: {
    /** Teléfono de la artesana, la promotora o el certificador (#91). */
    device: DeviceWalletPort;
    /** Tarjeta QR de la artesana sin celular, leída en el celular de la promotora (#117). */
    card: CardWalletPort;
    /** Billetera propia del comprador, por ejemplo Freighter (#115). */
    external: ExternalWalletPort;
  };
  lots: LotRegistryPort;
  escrow: EscrowPort;
  // La salida a pesos (`payout: PayoutPort`) la agrega #112.
}

export function createChain(options?: CreateChainOptions): Chain {
  const network = resolveNetworkConfig(options);
  const providers = options?.testnetProviders;
  const isTestnet = network.mode === 'testnet';

  return {
    mode: network.mode,
    network,
    wallets: {
      device:
        isTestnet && providers?.wallets?.device
          ? providers.wallets.device(network)
          : new SimulatedWallet(),
      card:
        isTestnet && providers?.wallets?.card
          ? providers.wallets.card(network)
          : new SimulatedCardWallet(),
      external:
        isTestnet && providers?.wallets?.external
          ? providers.wallets.external(network)
          : new SimulatedExternalWallet(),
    },
    lots: isTestnet && providers?.lots ? providers.lots(network) : new SimulatedLotRegistry(),
    escrow: isTestnet && providers?.escrow ? providers.escrow(network) : new SimulatedEscrow(),
  };
}

export const chain: Chain = createChain();
