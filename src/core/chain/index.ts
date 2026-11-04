/**
 * Punto de entrada de los puertos de Stellar / Trustless Work (ADR-003).
 * Hoy todo es de demostración. Cuando exista una implementación real, se elige aquí según la
 * configuración (#118), y ningún componente de la UI tiene que cambiar.
 */
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
  /** Salida a pesos desde la cuenta de la artesana (#112, ADR-004 D9). */
  payout: PayoutPort;
}

export const chain: Chain = {
  wallets: {
    device: new SimulatedWallet(),
    card: new SimulatedCardWallet(),
    external: new SimulatedExternalWallet(),
  },
  lots: new SimulatedLotRegistry(),
  escrow: new SimulatedEscrow(),
  payout: new SimulatedPayout(),
};
