/**
 * Punto de entrada de los puertos de Stellar / Trustless Work (ADR-003).
 * Hoy todo es de demostración. Cuando exista una implementación real, se elige aquí según la
 * configuración (#118), y ningún componente de la UI tiene que cambiar.
 */
import { readNetworkConfig } from '../../config/network';
import type { NetworkConfig } from '../../config/network';
import {
  SimulatedCardWallet,
  SimulatedEscrow,
  SimulatedExternalWallet,
  SimulatedLotRegistry,
  SimulatedPayout,
  SimulatedWallet,
} from './SimulatedChain';
import type { CardWalletPort, DeviceWalletPort, EscrowPort, ExternalWalletPort, LotRegistryPort, PayoutPort } from './ports';

export * from './ports';

export interface Chain {
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
  /** Salida a pesos desde la cuenta de la artesana (#112). */
  payout: PayoutPort;
}

type Ports = {
  device: DeviceWalletPort;
  card: CardWalletPort;
  external: ExternalWalletPort;
  lots: LotRegistryPort;
  escrow: EscrowPort;
  payout: PayoutPort;
};

type PortFactories = { [K in keyof Ports]: () => Ports[K] };

const simulatedPortFactories: PortFactories = {
  device: () => new SimulatedWallet(),
  card: () => new SimulatedCardWallet(),
  external: () => new SimulatedExternalWallet(),
  lots: () => new SimulatedLotRegistry(),
  escrow: () => new SimulatedEscrow(),
  payout: () => new SimulatedPayout(),
};

const testnetPortFactories: Partial<PortFactories> = {};

export function createChain(config: NetworkConfig): Chain {
  const port = <K extends keyof Ports>(name: K): Ports[K] => {
    const factory = config.mode === 'testnet' ? testnetPortFactories[name] : undefined;
    return (factory ?? simulatedPortFactories[name])();
  };

  return {
    wallets: {
      device: port('device'),
      card: port('card'),
      external: port('external'),
    },
    lots: port('lots'),
    escrow: port('escrow'),
    payout: port('payout'),
  };
}

export const chain: Chain = createChain(readNetworkConfig());
