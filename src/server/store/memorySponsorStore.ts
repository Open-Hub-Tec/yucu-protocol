import type { PendingAccountCreation, RegisteredAccount, SponsorStore } from "./sponsorStore";

/**
 * Versión EN MEMORIA de SponsorStore: para las pruebas y para trabajar mientras no existe la base (#156).
 * No sirve en Vercel: cada copia del servidor contaría por su lado. El servidor avisa al arrancar si la usa.
 */
export class MemorySponsorStore implements SponsorStore {
  readonly kind = "memory" as const;
  private accounts = new Map<string, RegisteredAccount>();
  private escrows = new Set<string>();
  private counters = new Map<string, { count: number; expiresAt: Date }>();
  private pending = new Map<string, PendingAccountCreation>();

  constructor(seed: { accounts?: RegisteredAccount[]; escrows?: string[] } = {}) {
    for (const a of seed.accounts ?? []) this.accounts.set(a.address, { ...a });
    for (const e of seed.escrows ?? []) this.escrows.add(e);
  }

  async getAccount(address: string): Promise<RegisteredAccount | null> {
    const a = this.accounts.get(address);
    return a ? { ...a } : null;
  }

  async registerAccount(account: RegisteredAccount): Promise<boolean> {
    if (this.accounts.has(account.address)) return false;
    this.accounts.set(account.address, { ...account });
    return true;
  }

  async isRegisteredEscrow(contractId: string): Promise<boolean> {
    return this.escrows.has(contractId);
  }

  /** Para #96 y las pruebas: da de alta el escrow de una compra. */
  addEscrow(contractId: string): void {
    this.escrows.add(contractId);
  }

  async incrementCounter(key: string, by: number, expiresAt: Date): Promise<number> {
    // Leer y escribir sin `await` entre medio: en una sola copia del servidor es atómico.
    const now = Date.now();
    const current = this.counters.get(key);
    const base = current && current.expiresAt.getTime() > now ? current.count : 0;
    const count = base + by;
    this.counters.set(key, { count, expiresAt });
    return count;
  }

  async savePendingCreation(p: PendingAccountCreation): Promise<void> {
    this.pending.set(p.txHash, { ...p });
  }

  async getPendingCreation(txHash: string, now: Date): Promise<PendingAccountCreation | null> {
    const p = this.pending.get(txHash);
    if (!p || p.expiresAt.getTime() <= now.getTime()) return null;
    return { ...p };
  }

  async takePendingCreation(txHash: string, now: Date): Promise<PendingAccountCreation | null> {
    const p = this.pending.get(txHash);
    this.pending.delete(txHash);
    if (!p || p.expiresAt.getTime() <= now.getTime()) return null;
    return p;
  }
}
