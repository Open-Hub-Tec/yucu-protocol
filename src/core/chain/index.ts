/**
 * Punto de entrada de los puertos de Stellar / Trustless Work (ADR-003).
 * Hoy todo es de demostración. Cuando exista una implementación real, se elige aquí según la
 * configuración (#118), y ningún componente de la UI tiene que cambiar.
 */
import {
  SimulatedAttestations,
  SimulatedCardWallet,
  SimulatedEscrow,
  SimulatedExternalWallet,
  SimulatedLotRegistry,
  SimulatedPayout,
  SimulatedWallet,
} from './SimulatedChain';
import type {
  AttestationPort,
  CardWalletPort,
  DeviceWalletPort,
  EscrowPort,
  ExternalWalletPort,
  LotRegistryPort,
  PayoutPort,
} from './ports';
import { FreighterWallet, type FreighterApi } from './wallet/FreighterWallet';

export * from './ports';
export * from './wallet';

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
  /** Atestaciones en Attest Protocol + índice de Yucu (ADR-005 D9, #141). */
  attestations: AttestationPort;
  /** Salida a pesos desde la cuenta de la artesana (#112). */
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
  attestations: new SimulatedAttestations(),
  payout: new SimulatedPayout(),
};

/**
 * Permite elegir la billetera del comprador para el flujo de compra (#115).
 * Por ejemplo: setBuyerWallet(new FreighterWallet()).
 */
export function setBuyerWallet(wallet: ExternalWalletPort): void {
  chain.wallets.external = wallet;
}

/**
 * Activa Freighter como la billetera externa del comprador (#115).
 */
export function useFreighterBuyerWallet(api?: FreighterApi): FreighterWallet {
  const wallet = new FreighterWallet(api);
  chain.wallets.external = wallet;
  return wallet;
}
