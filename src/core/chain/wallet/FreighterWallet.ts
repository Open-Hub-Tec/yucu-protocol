/**
 * Implementación de ExternalWalletPort para la billetera del navegador Freighter (ADR-003, ADR-004 D7, Issue #115).
 *
 * El comprador firma transacciones desde su propia billetera (Freighter).
 * Ninguna llave privada pasa por la aplicación ni por el servidor (no custodial).
 */
import * as freighterModule from '@stellar/freighter-api';
import type { ExternalWalletPort, UnsignedTransaction } from '../ports';

/** Interfaz desacoplada de la API de Freighter para permitir inyección de dependencias y pruebas unitarias */
export interface FreighterApi {
  isConnected(): Promise<boolean | { isConnected: boolean; error?: unknown }>;
  requestAccess?(): Promise<{ address: string; error?: unknown }>;
  getAddress(): Promise<{ address: string; error?: unknown }>;
  getNetworkDetails?(): Promise<{
    network?: string;
    networkUrl?: string;
    networkPassphrase?: string;
    error?: unknown;
  }>;
  getNetwork?(): Promise<string | { network: string; error?: unknown }>;
  signTransaction(
    transactionXdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
    }
  ): Promise<string | { signedTxXdr: string; signerAddress?: string; error?: unknown }>;
}

function getFreighterModule(): Record<string, unknown> {
  const mod = freighterModule as unknown as { default?: Record<string, unknown> };
  return (mod.default ?? mod) as Record<string, unknown>;
}

const defaultFreighterApi: FreighterApi = {
  async isConnected() {
    const api = getFreighterModule();
    if (typeof api.isConnected === 'function') {
      return (api.isConnected as () => Promise<boolean | { isConnected: boolean; error?: unknown }>)();
    }
    return false;
  },
  async requestAccess() {
    const api = getFreighterModule();
    if (typeof api.requestAccess === 'function') {
      return (api.requestAccess as () => Promise<{ address: string; error?: unknown }>)();
    }
    return { address: '' };
  },
  async getAddress() {
    const api = getFreighterModule();
    if (typeof api.getAddress === 'function') {
      return (api.getAddress as () => Promise<{ address: string; error?: unknown }>)();
    }
    return { address: '' };
  },
  async getNetworkDetails() {
    const api = getFreighterModule();
    if (typeof api.getNetworkDetails === 'function') {
      return (api.getNetworkDetails as () => Promise<{
        network?: string;
        networkUrl?: string;
        networkPassphrase?: string;
        error?: unknown;
      }>)();
    }
    return { networkPassphrase: '' };
  },
  async getNetwork() {
    const api = getFreighterModule();
    if (typeof api.getNetwork === 'function') {
      return (api.getNetwork as () => Promise<string | { network: string; error?: unknown }>)();
    }
    return '';
  },
  async signTransaction(transactionXdr: string, opts?: { networkPassphrase?: string; address?: string }) {
    const api = getFreighterModule();
    if (typeof api.signTransaction === 'function') {
      return (api.signTransaction as (xdr: string, options?: { networkPassphrase?: string; address?: string }) => Promise<string | { signedTxXdr: string; signerAddress?: string; error?: unknown }>)(
        transactionXdr,
        opts
      );
    }
    return { signedTxXdr: '' };
  },
};

export class FreighterWallet implements ExternalWalletPort {
  readonly kind = 'external' as const;
  private connected = false;
  private cachedAddress: string | null = null;
  private readonly api: FreighterApi;

  constructor(api: FreighterApi = defaultFreighterApi) {
    this.api = api;
  }

  /**
   * ¿Está instalada la extensión Freighter en el navegador?
   */
  async isAvailable(): Promise<boolean> {
    try {
      const res = await this.api.isConnected();
      if (typeof res === 'boolean') {
        return res;
      }
      if (res && typeof res === 'object' && 'isConnected' in res) {
        return Boolean(res.isConnected);
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Conecta con la billetera Freighter solicitando autorización a la persona.
   * Si la billetera no está instalada o el usuario cancela, lanza un error explicativo.
   */
  async connect(): Promise<{ address: string }> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('No encontramos tu billetera. Instálala y vuelve a intentar.');
    }

    let address = '';
    try {
      if (typeof this.api.requestAccess === 'function') {
        const res = await this.api.requestAccess();
        if (res.error || !res.address) {
          throw new Error('Cancelaste la conexión con tu billetera.');
        }
        address = res.address;
      } else {
        const res = await this.api.getAddress();
        if (res.error || !res.address) {
          throw new Error('Cancelaste la conexión con tu billetera.');
        }
        address = res.address;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('No encontramos')) {
        throw err;
      }
      throw new Error('Cancelaste la conexión con tu billetera.');
    }

    this.connected = true;
    this.cachedAddress = address;
    return { address };
  }

  /**
   * Obtiene la dirección pública de la cuenta conectada, o null si aún no se conecta.
   */
  async getAddress(): Promise<string | null> {
    return this.connected ? this.cachedAddress : null;
  }

  /**
   * Firma una transacción preparada (XDR) mediante Freighter.
   * Requiere que la billetera esté previamente conectada y en la red correcta.
   */
  async sign(tx: UnsignedTransaction): Promise<string> {
    if (!this.connected || !this.cachedAddress) {
      throw new Error('Primero conecta tu billetera.');
    }

    // Validación de red: rechazar si la billetera está en otra red
    await this.validateNetwork(tx.networkPassphrase);

    let signedXdr = '';
    try {
      const res = await this.api.signTransaction(tx.xdr, {
        networkPassphrase: tx.networkPassphrase,
        address: this.cachedAddress,
      });

      if (typeof res === 'string') {
        signedXdr = res;
      } else if (res && typeof res === 'object') {
        if (res.error) {
          const errorMsg =
            typeof res.error === 'object' && res.error !== null && 'message' in res.error
              ? String((res.error as { message: unknown }).message)
              : String(res.error);
          if (errorMsg.toLowerCase().includes('network')) {
            throw new Error('Tu billetera está en otra red. Cámbiala a la red de pruebas.');
          }
          throw new Error('Cancelaste la firma. No se envió nada.');
        }
        signedXdr = res.signedTxXdr || '';
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('otra red')) {
        throw err;
      }
      throw new Error('Cancelaste la firma. No se envió nada.');
    }

    if (!signedXdr) {
      throw new Error('Cancelaste la firma. No se envió nada.');
    }

    return signedXdr;
  }

  private async validateNetwork(expectedPassphrase: string): Promise<void> {
    if (typeof this.api.getNetworkDetails === 'function') {
      try {
        const details = await this.api.getNetworkDetails();
        if (details && !details.error && details.networkPassphrase) {
          if (details.networkPassphrase !== expectedPassphrase) {
            throw new Error('Tu billetera está en otra red. Cámbiala a la red de pruebas.');
          }
          return;
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('otra red')) {
          throw err;
        }
      }
    }

    if (typeof this.api.getNetwork === 'function') {
      try {
        const net = await this.api.getNetwork();
        const netName = typeof net === 'string' ? net : (net as { network?: string })?.network;
        if (netName && expectedPassphrase.toLowerCase().includes('test') && netName.toUpperCase() !== 'TESTNET') {
          throw new Error('Tu billetera está en otra red. Cámbiala a la red de pruebas.');
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('otra red')) {
          throw err;
        }
      }
    }
  }
}
