import { FeeBumpTransaction, Transaction, rpc } from "@stellar/stellar-sdk";

/**
 * Lo que las rutas de /api/chain necesitan de la red. Las pruebas usan una versión falsa:
 * el CI no llama a Stellar (docs/arquitectura/SERVIDOR.md, sección 7).
 */
export interface ChainGateway {
  /** Número de secuencia actual de una cuenta. Falla si la cuenta no existe. */
  loadSequence(address: string): Promise<string>;
  accountExists(address: string): Promise<boolean>;
  /** Envía y espera la confirmación. Falla si la red la rechaza. */
  submit(tx: Transaction | FeeBumpTransaction): Promise<{ txHash: string; ledger: number }>;
}

export class SubmitError extends Error {}

/** Versión real: Stellar RPC de testnet. */
export class StellarRpcGateway implements ChainGateway {
  private server: rpc.Server;

  constructor(rpcUrl: string, private readonly pollAttempts = 15, private readonly pollMs = 1000) {
    this.server = new rpc.Server(rpcUrl);
  }

  async loadSequence(address: string): Promise<string> {
    const account = await this.server.getAccount(address);
    return account.sequenceNumber();
  }

  async accountExists(address: string): Promise<boolean> {
    try {
      await this.server.getAccount(address);
      return true;
    } catch (err) {
      if (err instanceof Error && /not found/i.test(err.message)) return false;
      throw err;
    }
  }

  async submit(tx: Transaction | FeeBumpTransaction): Promise<{ txHash: string; ledger: number }> {
    const sent = await this.server.sendTransaction(tx);
    if (sent.status !== "PENDING" && sent.status !== "DUPLICATE") {
      throw new SubmitError(`sendTransaction: ${sent.status}`);
    }
    for (let i = 0; i < this.pollAttempts; i++) {
      const res = await this.server.getTransaction(sent.hash);
      if (res.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        return { txHash: sent.hash, ledger: res.ledger };
      }
      if (res.status === rpc.Api.GetTransactionStatus.FAILED) {
        throw new SubmitError("La transacción falló en la red.");
      }
      await new Promise((r) => setTimeout(r, this.pollMs));
    }
    throw new SubmitError("La red no confirmó la transacción a tiempo.");
  }
}
