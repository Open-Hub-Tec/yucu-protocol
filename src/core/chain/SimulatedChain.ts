/**
 * Implementación de DEMOSTRACIÓN de los puertos de src/core/chain/ports.ts.
 *
 * Es el ÚNICO lugar del proyecto donde se permite inventar un hash o un número de ledger.
 * Todo lo que devuelve lleva source: 'simulated' para que la UI muestre <DemoBadge />.
 * No toca la red, no guarda llaves y no mueve dinero.
 */
import type {
  CardWalletPort,
  CashoutReceipt,
  CashoutRequest,
  ChainReceipt,
  CreateEscrowRequest,
  DeviceWalletPort,
  EscrowCreatedReceipt,
  EscrowPort,
  ExternalWalletPort,
  LotRecord,
  MilestoneState,
  MilestoneStatus,
  LotRegistryPort,
  PayoutPort,
  PayoutQuote,
  PayoutState,
  RegisterLotRequest,
  UnsignedTransaction,
} from './ports';

const DEMO_PASSPHRASE = 'Yucu Demo ; sin red';
const DEMO_ADDRESS = 'GDEMOYUCUSIMULADANOEXISTEENLARED0000000000000000000000000';
const DEMO_RECOVERY_CARD = 'TARJETA DE DEMOSTRACIÓN: no protege ninguna cuenta real.';
const DEMO_CARD_ADDRESS = 'GDEMOYUCUTARJETAQRSIMULADANOEXISTE00000000000000000000000';
const DEMO_BUYER_ADDRESS = 'GDEMOYUCUCOMPRADORSIMULADONOEXISTE0000000000000000000000';

function randomHex(bytes: number): string {
  return Array.from({ length: bytes }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
}

function demoTx(summary: string, payload: unknown): UnsignedTransaction {
  return { xdr: btoa(unescape(encodeURIComponent(JSON.stringify(payload)))), networkPassphrase: DEMO_PASSPHRASE, summary };
}

function demoReceipt(): ChainReceipt {
  return { source: 'simulated', txHash: randomHex(32), ledger: 52_490_000 + Math.floor(Math.random() * 10_000), explorerUrl: null };
}

export class SimulatedWallet implements DeviceWalletPort {
  readonly kind = 'device' as const;
  private created = false;
  async hasAccount() {
    return this.created;
  }
  async createAccount(_pin: string) {
    this.created = true;
    return { address: DEMO_ADDRESS, recoveryCard: DEMO_RECOVERY_CARD };
  }
  async getAddress() {
    return this.created ? DEMO_ADDRESS : null;
  }
  async sign(tx: UnsignedTransaction, _pin: string) {
    return tx.xdr;
  }
  async restoreAccount(recoveryCard: string, _newPin: string) {
    if (recoveryCard.trim() !== DEMO_RECOVERY_CARD) {
      throw new Error('La tarjeta de recuperación no es válida.');
    }
    this.created = true;
    return { address: DEMO_ADDRESS };
  }
}

/** Tarjeta QR de demostración: no cifra nada. Una tarjeta solo vale en la instancia que la creó. */
export class SimulatedCardWallet implements CardWalletPort {
  readonly kind = 'card' as const;
  private readonly pins = new Map<string, string>();

  async createCard(pin: string) {
    if (!/^\d{6}$/.test(pin)) throw new Error('El PIN de la tarjeta debe tener 6 números.');
    const cardData = `TARJETA-DEMO-${randomHex(8)}`;
    this.pins.set(cardData, pin);
    return { address: DEMO_CARD_ADDRESS, cardData };
  }
  async getAddress(cardData: string) {
    if (!this.pins.has(cardData)) throw new Error('No se pudo leer la tarjeta. Revisa que sea la tuya y que no esté dañada.');
    return DEMO_CARD_ADDRESS;
  }
  async sign(tx: UnsignedTransaction, pin: string, cardData: string) {
    const expected = this.pins.get(cardData);
    if (expected === undefined) throw new Error('No se pudo leer la tarjeta. Revisa que sea la tuya y que no esté dañada.');
    if (pin !== expected) throw new Error('El PIN no es correcto.');
    return tx.xdr;
  }
}

/** Billetera del comprador de demostración. Las opciones simulan que no está instalada o que la persona cancela. */
export class SimulatedExternalWallet implements ExternalWalletPort {
  readonly kind = 'external' as const;
  private connected = false;

  constructor(private readonly options: { installed?: boolean; approves?: boolean; networkPassphrase?: string } = {}) {}

  async isAvailable() {
    return this.options.installed ?? true;
  }
  async connect() {
    if (!(await this.isAvailable())) throw new Error('No encontramos tu billetera. Instálala y vuelve a intentar.');
    if (this.options.approves === false) throw new Error('Cancelaste la conexión con tu billetera.');
    this.connected = true;
    return { address: DEMO_BUYER_ADDRESS };
  }
  async getAddress() {
    return this.connected ? DEMO_BUYER_ADDRESS : null;
  }
  async sign(tx: UnsignedTransaction) {
    if (!this.connected) throw new Error('Primero conecta tu billetera.');
    if ((this.options.networkPassphrase ?? DEMO_PASSPHRASE) !== tx.networkPassphrase) {
      throw new Error('Tu billetera está en otra red. Cámbiala a la red de pruebas.');
    }
    if (this.options.approves === false) throw new Error('Cancelaste la firma. No se envió nada.');
    return tx.xdr;
  }
}

export class SimulatedLotRegistry implements LotRegistryPort {
  private readonly lots = new Map<string, LotRecord>();

  async prepareRegisterLot(req: RegisterLotRequest) {
    if (!Number.isInteger(req.volumeRange) || req.volumeRange < 1) {
      throw new Error('El rango de volumen debe ser un código de la lista (1, 2, 3…).');
    }
    return demoTx(`Registrar el lote ${req.code} de ${req.category} (${req.variety}).`, { op: 'register_lot', req });
  }
  async submit(signedXdr: string) {
    const { req } = JSON.parse(decodeURIComponent(escape(atob(signedXdr)))) as { req: RegisterLotRequest };
    this.lots.set(req.code, {
      code: req.code,
      producerAddress: req.producerAddress,
      location: req.location,
      category: req.category,
      variety: req.variety,
      volumeRange: req.volumeRange,
      photoHashHex: req.photoHashHex,
      certified: false,
      registeredAt: Date.now(),
    });
    return demoReceipt();
  }
  async getLot(code: string) {
    const lot = this.lots.get(code);
    return lot ? { ...lot, source: 'simulated' as const } : null;
  }
}

export class SimulatedEscrow implements EscrowPort {
  private readonly escrows = new Map<string, MilestoneState[]>();

  private prepare(escrowId: string, index: number, next: MilestoneStatus, summary: string) {
    const milestones = this.escrows.get(escrowId);
    if (milestones && (index < 0 || index >= milestones.length)) {
      return Promise.reject(new Error(`El pago protegido no tiene un hito ${index + 1}.`));
    }
    return Promise.resolve(demoTx(summary, { escrowId, index, next }));
  }
  prepareCreate(req: CreateEscrowRequest) {
    const totalPercent = req.milestones.reduce((sum, m) => sum + m.percent, 0);
    if (req.milestones.length === 0 || totalPercent !== 100 || req.milestones.some((m) => m.percent <= 0)) {
      return Promise.reject(new Error('Los hitos del pago protegido deben ser mayores que 0 y sumar 100%.'));
    }
    const summary = `Crear un pago protegido de ${req.amount} ${req.asset.code} con ${req.milestones.length} ${req.milestones.length === 1 ? 'hito' : 'hitos'}.`;
    return Promise.resolve(demoTx(summary, { escrowId: req.orderId, count: req.milestones.length }));
  }
  async submitCreate(signedXdr: string): Promise<EscrowCreatedReceipt> {
    const { escrowId, count } = JSON.parse(decodeURIComponent(escape(atob(signedXdr)))) as { escrowId: string; count: number };
    this.escrows.set(escrowId, Array.from({ length: count }, () => ({ status: 'pending' as const })));
    return { ...demoReceipt(), escrowId };
  }
  prepareFund(escrowId: string, _buyerAddress: string) {
    return Promise.resolve(demoTx('Depositar el pago en el escrow.', { escrowId, index: -1, next: 'pending' }));
  }
  prepareMarkMilestoneDone(escrowId: string, milestoneIndex: number, _serviceProviderAddress: string) {
    return this.prepare(escrowId, milestoneIndex, 'done', `Marcar el hito ${milestoneIndex + 1} como enviado.`);
  }
  prepareApproveMilestone(escrowId: string, milestoneIndex: number, _approverAddress: string) {
    return this.prepare(escrowId, milestoneIndex, 'approved', `Aprobar el hito ${milestoneIndex + 1}.`);
  }
  prepareRelease(escrowId: string, milestoneIndex: number, _releaseSignerAddress: string) {
    if (this.escrows.get(escrowId)?.[milestoneIndex]?.status !== 'approved') {
      return Promise.reject(new Error('Solo se puede recibir un hito que el comprador ya aprobó.'));
    }
    return this.prepare(escrowId, milestoneIndex, 'released', `Recibir el pago del hito ${milestoneIndex + 1}.`);
  }
  prepareDispute(escrowId: string, milestoneIndex: number, _signerAddress: string) {
    return this.prepare(escrowId, milestoneIndex, 'disputed', `Abrir una disputa del hito ${milestoneIndex + 1}. Queda congelado hasta que se resuelva.`);
  }
  prepareResolveDispute(escrowId: string, milestoneIndex: number, _resolverAddress: string, receiverPercent: number) {
    if (!Number.isFinite(receiverPercent) || receiverPercent < 0 || receiverPercent > 100) {
      return Promise.reject(new Error('El porcentaje para la artesana debe estar entre 0 y 100.'));
    }
    return this.prepare(escrowId, milestoneIndex, 'resolved', `Resolver la disputa: ${receiverPercent}% a la artesana y ${100 - receiverPercent}% de regreso al comprador.`);
  }
  async submit(signedXdr: string) {
    const { escrowId, index, next } = JSON.parse(decodeURIComponent(escape(atob(signedXdr)))) as { escrowId: string; index: number; next: MilestoneStatus };
    const milestones = this.escrows.get(escrowId);
    if (milestones && index >= 0) milestones[index] = { ...milestones[index], status: next, ...(next === 'done' ? { doneAt: Date.now() } : {}) };
    return demoReceipt();
  }
  async getStatus(escrowId: string) {
    return { milestones: (this.escrows.get(escrowId) ?? []).map((m) => ({ ...m })), source: 'simulated' as const };
  }
}

interface SimulatedCashout {
  expiresAt: number;
  collectedAt: number | null;
  refundedAt: number | null;
}

/**
 * Salida a pesos de demostración (#112). No toca la red ni mueve dinero.
 * La tasa de cambio es inventada, como todo lo demás de esta clase, y lleva source: 'simulated'.
 */
export class SimulatedPayout implements PayoutPort {
  /** Tasa de demostración: solo sirve para construir la UI antes de los proveedores reales. */
  private static readonly DEMO_PESOS_PER_USDC = 17.5;
  /** La devolución simulada tarda unos minutos en completarse después de vencer el código. */
  private static readonly DEMO_REFUND_DELAY_MS = 5 * 60_000;

  private readonly cashouts = new Map<string, SimulatedCashout>();
  private readonly now: () => number;

  constructor(options: { now?: () => number } = {}) {
    this.now = options.now ?? (() => Date.now());
  }

  private validate(req: CashoutRequest) {
    if (!Number.isFinite(req.amountUsdc) || req.amountUsdc <= 0) {
      throw new Error('El monto del retiro debe ser mayor que cero.');
    }
    if (!Number.isFinite(req.expiresInMinutes) || req.expiresInMinutes <= 0) {
      throw new Error('El código de cobro debe durar más de cero minutos.');
    }
    if (req.walletKind === 'card' && req.expiresInMinutes > 15) {
      throw new Error('Con la tarjeta QR, el código de cobro debe durar 15 minutos o menos.');
    }
  }

  async quote(amountUsdc: number): Promise<PayoutQuote> {
    if (!Number.isFinite(amountUsdc) || amountUsdc <= 0) {
      throw new Error('El monto del retiro debe ser mayor que cero.');
    }
    const amountPesos = Math.round(amountUsdc * SimulatedPayout.DEMO_PESOS_PER_USDC * 100) / 100;
    return { amountPesos, source: 'simulated' };
  }

  async prepareCashout(req: CashoutRequest) {
    this.validate(req);
    return demoTx(
      `Retirar ${req.amountUsdc} USDC en pesos en la tienda ${req.agentCode}.`,
      { req },
    );
  }

  async submit(signedXdr: string): Promise<CashoutReceipt> {
    const { req } = JSON.parse(decodeURIComponent(escape(atob(signedXdr)))) as { req: CashoutRequest };
    this.validate(req);
    const cashoutId = `RETIRO-${randomHex(6)}`;
    const code = randomHex(8).toUpperCase();
    const expiresAt = this.now() + req.expiresInMinutes * 60_000;
    this.cashouts.set(cashoutId, { expiresAt, collectedAt: null, refundedAt: null });
    return { ...demoReceipt(), cashoutId, code, expiresAt };
  }

  async getStatus(cashoutId: string): Promise<PayoutState> {
    const cashout = this.cashouts.get(cashoutId);
    if (!cashout) throw new Error('No encontramos ese retiro.');
    const now = this.now();
    if (cashout.collectedAt !== null) {
      return { status: 'collected', expiresAt: cashout.expiresAt, source: 'simulated' };
    }
    if (now >= cashout.expiresAt) {
      if (cashout.refundedAt === null) {
        cashout.refundedAt = cashout.expiresAt + SimulatedPayout.DEMO_REFUND_DELAY_MS;
      }
      const status = now >= cashout.refundedAt ? 'refunded' : 'expired';
      return { status, expiresAt: cashout.expiresAt, source: 'simulated' };
    }
    return { status: 'ready', expiresAt: cashout.expiresAt, source: 'simulated' };
  }

  /** Solo para la demostración: la tienda confirma que pagó el efectivo. */
  markCollected(cashoutId: string, at: number = this.now()) {
    const cashout = this.cashouts.get(cashoutId);
    if (!cashout) throw new Error('No encontramos ese retiro.');
    if (at > cashout.expiresAt) {
      throw new Error('El código ya venció; el dinero regresó a la cuenta de la artesana.');
    }
    cashout.collectedAt = at;
  }
}
