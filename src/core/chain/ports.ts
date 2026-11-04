/**
 * Puertos de la arquitectura no custodial (docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md).
 *
 * La interfaz de usuario SOLO usa estos puertos. Nunca importa @stellar/stellar-sdk ni llama a
 * Trustless Work directamente. Patrón de toda operación: preparar -> firmar en el teléfono -> enviar.
 *
 * Implementaciones:
 *  - SimulatedChain (demostración, ya existe): marca todo con source 'simulated'.
 *  - Implementaciones reales: las construyen los estudiantes en las issues de la Wave.
 */

/** De dónde viene un resultado. Si es 'simulated', la UI debe mostrar <DemoBadge />. */
export type ChainSource = 'testnet' | 'simulated';

/** Comprobante de una transacción enviada a la red (o simulada). */
export interface ChainReceipt {
  source: ChainSource;
  txHash: string;
  ledger: number;
  /** Enlace al explorador (stellar.expert) o null si es simulado. */
  explorerUrl: string | null;
}

/** Transacción preparada SIN firmar (XDR en base64) que el usuario firmará en su dispositivo. */
export interface UnsignedTransaction {
  xdr: string;
  networkPassphrase: string;
  /** Texto en lenguaje sencillo de lo que la persona está a punto de firmar. */
  summary: string;
}

// ─────────────────────────────── Billeteras ───────────────────────────────

/**
 * Tipo de billetera. La UI elige sus textos según esto: la artesana nunca ve "billetera",
 * direcciones ni llaves (ADR-004, D1); el comprador sí usa su propia billetera (D7).
 */
export type WalletKind = 'device' | 'card' | 'external';

/**
 * Billetera del teléfono (#91): la de la artesana, la promotora o el certificador.
 * La llave privada vive SOLO en el dispositivo, cifrada con el PIN de la persona.
 * Ningún método devuelve ni envía la llave secreta.
 */
export interface DeviceWalletPort {
  readonly kind: 'device';
  /** ¿Ya hay una cuenta creada en este dispositivo? */
  hasAccount(): Promise<boolean>;
  /** Crea la cuenta en el dispositivo y devuelve su dirección pública (G...). */
  createAccount(pin: string): Promise<{ address: string; recoveryCard: string }>;
  /** Dirección pública de la cuenta del dispositivo, o null si no hay. */
  getAddress(): Promise<string | null>;
  /**
   * Firma una transacción preparada. Pide el PIN; la llave nunca sale del dispositivo.
   * Si la operación es de un contrato Soroban, firma la autorización (auth entry) de esta cuenta;
   * si además la cuenta es la que envía, firma el sobre completo.
   */
  sign(tx: UnsignedTransaction, pin: string): Promise<string>;
  /**
   * Recupera la cuenta en un teléfono nuevo con la tarjeta de recuperación en papel y un PIN nuevo.
   * Falla si la tarjeta no es válida. La tarjeta nunca se envía al servidor.
   */
  restoreAccount(recoveryCard: string, newPin: string): Promise<{ address: string }>;
}

/**
 * Tarjeta QR (#117), para la artesana sin celular propio (ADR-004, D4). Su llave va en su tarjeta,
 * cifrada con un PIN de 6 dígitos. El celular de la promotora escanea la tarjeta, descifra la llave
 * en memoria, firma y la borra. Nada de la tarjeta ni de la llave queda guardado en ese celular.
 */
export interface CardWalletPort {
  readonly kind: 'card';
  /** Crea la cuenta y devuelve el contenido del QR de la tarjeta. La tarjeta impresa no lleva nombre. */
  createCard(pin: string): Promise<{ address: string; cardData: string }>;
  /** Dirección pública de la tarjeta, sin descifrar la llave (para preparar la transacción). */
  getAddress(cardData: string): Promise<string>;
  /** Descifra en memoria con el PIN, firma y descarta la llave. Falla con un PIN o una tarjeta inválidos. */
  sign(tx: UnsignedTransaction, pin: string, cardData: string): Promise<string>;
}

/**
 * Billetera propia del comprador (#115), por ejemplo Freighter (ADR-004, D7).
 * Yucu nunca ve su llave: la billetera muestra su propia pantalla de confirmación.
 */
export interface ExternalWalletPort {
  readonly kind: 'external';
  /** ¿Está instalada la billetera? */
  isAvailable(): Promise<boolean>;
  /** Pide permiso a la persona y devuelve su dirección pública. */
  connect(): Promise<{ address: string }>;
  getAddress(): Promise<string | null>;
  /** Falla si la persona cancela o si la billetera está en otra red que `tx.networkPassphrase`. */
  sign(tx: UnsignedTransaction): Promise<string>;
}

export type WalletPort = DeviceWalletPort | CardWalletPort | ExternalWalletPort;

// ─────────────────────────────── Registro de lotes (lot_passport) ───────────────────────────────

/** Lo mínimo en la cadena (ADR-004, D5): sin nombres, sin comunidad exacta y sin montos. */
export interface RegisterLotRequest {
  code: string;
  /** Dirección pública de la productora (de su billetera), nunca su nombre. */
  producerAddress: string;
  /** Municipio o región, nunca la comunidad exacta ni un domicilio. */
  location: string;
  /** De la lista cerrada que define el contrato (#110), no texto libre. */
  category: string;
  /** De la lista cerrada que define el contrato (#110), no texto libre. */
  variety: string;
  /** Código del rango de volumen (por ejemplo, 1 = menos de 10 kg). Los rangos los define #110. */
  volumeRange: number;
  /** SHA-256 en hexadecimal de la foto del producto (CryptoEngine). */
  photoHashHex: string;
}

export interface LotRecord {
  code: string;
  producerAddress: string;
  location: string;
  category: string;
  variety: string;
  volumeRange: number;
  /** Permite comprobar que la foto que muestra la tienda es la que se registró. */
  photoHashHex: string;
  /** `false` si nunca se certificó o si se revocó la certificación (#110). */
  certified: boolean;
  registeredAt: number;
}

/**
 * `register_lot` exige DOS firmas: la del nodo certificador (rol `certifier` del contrato) y la del productor.
 * Flujo (ADR-003, D6; issues #92 y #94): el servidor prepara la transacción y firma SOLO la
 * autorización del nodo certificador -> la cuenta fuente es la del productor, que firma el sobre en
 * su teléfono -> `submit` lo envía (el servidor puede envolverlo en un fee-bump sin modificarlo).
 * La llave del nodo certificador es de la plataforma (no de una persona) y vive solo en el `.env`
 * del servidor (`STELLAR_CERTIFIER_SECRET`). El servidor nunca firma por el productor.
 */
export interface LotRegistryPort {
  prepareRegisterLot(req: RegisterLotRequest): Promise<UnsignedTransaction>;
  submit(signedXdr: string): Promise<ChainReceipt>;
  getLot(code: string): Promise<(LotRecord & { source: ChainSource }) | null>;
}

// ─────────────────────────────── Escrow (Trustless Work) ───────────────────────────────

export interface EscrowMilestone {
  description: string;
  /** Porcentaje del monto total que libera este hito. Los hitos deben sumar 100. */
  percent: number;
  /** Cuenta que recibe este hito: la artesana (ADR-004 D8). */
  receiverAddress: string;
}

/** Roles del escrow (ADR-004 D8). Ninguno lo ocupa una cuenta del grupo que reciba dinero. */
export interface CreateEscrowRequest {
  orderId: string;
  /** El comprador: fondea y aprueba los hitos. */
  buyerAddress: string;
  /** El grupo o la promotora: marca un hito como "enviado". No recibe dinero. */
  serviceProviderAddress: string;
  /** Quien libera cada hito aprobado: la artesana. Solo puede liberar hacia la receptora del hito. */
  releaseSignerAddress: string;
  /** Entidad constituida que cobra la comisión de plataforma, encima del precio (ADR-004 D11). */
  platformAddress: string;
  /** Comisión de plataforma en porcentaje; sale de src/config/protocolFees.ts. */
  platformFeePercent: number;
  /** Quien resuelve una disputa: un tercero, nunca la plataforma (#103). */
  disputeResolverAddress: string;
  /** Monto total que se reparte entre los hitos, en unidades del activo. */
  amount: number;
  /** Activo de Stellar: el código y su emisor, p. ej. USDC de testnet. */
  asset: { code: string; issuer: string };
  /** De 1 a N hitos, según la plantilla (por defecto, uno solo de 100 %). */
  milestones: EscrowMilestone[];
}

export type MilestoneStatus = 'pending' | 'done' | 'approved' | 'released' | 'disputed' | 'resolved';

export interface MilestoneState {
  status: MilestoneStatus;
  /** Momento (ms) en que se marcó "enviado": la app cuenta desde aquí el plazo para abrir disputa. */
  doneAt?: number;
}

/** Comprobante de la creación de un escrow: incluye su ID, que solo se conoce después de enviarla. */
export interface EscrowCreatedReceipt extends ChainReceipt {
  /** ID del contrato de escrow (en Trustless Work, el `contractId`). Se usa en las demás operaciones. */
  escrowId: string;
}

export interface EscrowPort {
  prepareCreate(req: CreateEscrowRequest): Promise<UnsignedTransaction>;
  /** Envía la creación firmada y devuelve el ID del escrow. */
  submitCreate(signedXdr: string): Promise<EscrowCreatedReceipt>;
  prepareFund(escrowId: string, buyerAddress: string): Promise<UnsignedTransaction>;
  /** El grupo o la promotora marca el hito como "enviado". */
  prepareMarkMilestoneDone(escrowId: string, milestoneIndex: number, serviceProviderAddress: string): Promise<UnsignedTransaction>;
  prepareApproveMilestone(escrowId: string, milestoneIndex: number, approverAddress: string): Promise<UnsignedTransaction>;
  /** La artesana libera un hito ya aprobado hacia su propia cuenta. */
  prepareRelease(escrowId: string, milestoneIndex: number, releaseSignerAddress: string): Promise<UnsignedTransaction>;
  /** Abre una disputa sobre un hito. Congela ese hito hasta que se resuelva. */
  prepareDispute(escrowId: string, milestoneIndex: number, signerAddress: string): Promise<UnsignedTransaction>;
  /**
   * Resuelve la disputa de un hito: `receiverPercent` (0 a 100) va a la receptora y el resto regresa
   * al comprador. Solo lo firma el `disputeResolverAddress` del escrow.
   */
  prepareResolveDispute(escrowId: string, milestoneIndex: number, resolverAddress: string, receiverPercent: number): Promise<UnsignedTransaction>;
  /** Envía cualquier operación firmada que no sea la creación. */
  submit(signedXdr: string): Promise<ChainReceipt>;
  /** Estado de cada hito, en el mismo orden en que se crearon. */
  getStatus(escrowId: string): Promise<{ milestones: MilestoneState[]; source: ChainSource }>;
}

// ─────────────────────────────── Salida a pesos (PayoutPort) ───────────────────────────────

export type PayoutStatus = 'pending' | 'ready' | 'collected' | 'expired' | 'refunded';

export interface PayoutQuote {
  amountUsdc: number;
  /** Tipo de cambio estimado en pesos mexicanos por 1 USDC. */
  exchangeRateMxn: number;
  /** Comisión de retiro en pesos (ADR-004, D9 y D11: la plataforma no cobra comisión de socio). */
  feeMxn: number;
  /** Monto neto en pesos mexicanos que recibe la artesana en mano. */
  netAmountMxn: number;
  source: ChainSource;
}

/**
 * Solicitud de retiro en efectivo en tienda (ADR-004, D9).
 * Sale de la cuenta de la artesana (`producerAddress`) hacia una tienda elegida (`storeId`).
 * Nunca lleva su nombre ni su llave secreta.
 */
export interface CashoutRequest {
  /** Dirección pública de la cuenta de la artesana (G...), nunca su nombre. */
  producerAddress: string;
  /** Monto a retirar en USDC (debe ser mayor que 0). */
  amountUsdc: number;
  /** Identificador de la tienda elegida donde se cobrará el efectivo. */
  storeId: string;
  /**
   * Tipo de billetera con la que firma la artesana (#117, Corrección 2).
   * Con `'card'`, solo se aceptan retiros presenciales cuyo código venza en 15 minutos o menos.
   */
  walletKind: WalletKind;
  /**
   * Vigencia del código de cobro en minutos (por defecto 15 minutos, como el QR de MicoPay).
   * Con `walletKind: 'card'`, un código que dure más de 15 minutos (p. ej. 24 a 72 h) se rechaza.
   */
  expiresInMinutes?: number;
}

/** Comprobante del retiro enviado: incluye el código o QR de cobro y su vencimiento. */
export interface CashoutReceipt extends ChainReceipt {
  payoutId: string;
  /** Código o contenido del QR de cobro para mostrar en la tienda. */
  cashoutCode: string;
  /** Monto neto en pesos que recibe la artesana. */
  netAmountMxn: number;
  /** Momento (ms) en que vence el código; si no se cobra antes, el dinero regresa a su cuenta. */
  expiresAt: number;
}

export interface PayoutState {
  payoutId: string;
  status: PayoutStatus;
  netAmountMxn: number;
  expiresAt: number;
  source: ChainSource;
}

export interface PayoutPort {
  /** Cuántos pesos recibiría la artesana (neto, con comisiones) por `amountUsdc`. */
  quote(amountUsdc: number): Promise<PayoutQuote>;
  /**
   * Prepara el retiro desde la cuenta de la artesana hacia una tienda elegida (nunca lleva su nombre).
   * Ella lo firma con su PIN. Devuelve un `UnsignedTransaction`.
   */
  prepareCashout(req: CashoutRequest): Promise<UnsignedTransaction>;
  /** Envía el retiro firmado y devuelve el comprobante con el código o QR de cobro y su vencimiento. */
  submit(signedXdr: string): Promise<CashoutReceipt>;
  /** Estado del retiro (`pending` / `ready` / `collected` / `expired` / `refunded`) con `source`. */
  getStatus(id: string): Promise<PayoutState>;
}
