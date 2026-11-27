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
import type { JsonValue } from '../attestations/ids';

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

// ─────────────────────────────── Atestaciones (Attest Protocol, ADR-005) ───────────────────────────────

/**
 * Campos del esquema (ADR-005 D4). Solo datos cerrados o hashes: nunca nombres, teléfonos,
 * direcciones ni texto libre. El manifiesto del esquema dice qué campos se permiten.
 */
export type AttestationContent = Record<string, JsonValue>;

/** Datos que la persona quiere atestuar. El puerto nunca recibe llaves privadas. */
export interface AttestRequest {
  /** Esquema registrado (p. ej. 'origen-comunitario', 'consentimiento'). */
  schemaId: string;
  /** Dirección pública de quien emite (G...), nunca su nombre. */
  issuer: string;
  /** Código del lote o de la pieza; con él se calcula `subject_ref` (ADR-005 D3). */
  lotCode: string;
  /** Contenido permitido por el manifiesto del esquema, sin datos personales. */
  content: AttestationContent;
  /** Momento (ms) en que deja de valer. Opcional; al preparar debe ser futuro. */
  expiresAt?: number;
  /** UID de la atestación que respalda esta (ADR-005 D6: colaboración → consentimiento). */
  refUid?: string;
  /** Cuenta pública de la persona de la que se habla, para la lista ByRecipient (D2). */
  recipient?: string;
}

/**
 * Lo único que se lee de la red: hashes y estado. El contenido en claro y la sal viven solo en la
 * memoria del simulador; la implementación real los guarda fuera de la cadena.
 */
export interface AttestationRecord {
  /** ID de la atestación. Lo calcula Attest Protocol en la red; en demo lo deriva el simulador. */
  uid: string;
  schemaId: string;
  issuer: string;
  /** sha256('lot:' + código), 'item:', 'addr:' o 'sale:' según corresponda. */
  subjectRef: string;
  /** Texto `yucu:1:<subjectRef>:<hash con sal>[:<refUid>]` de ADR-005 D3. Solo hashes. */
  value: string;
  refUid?: string;
  recipient?: string;
  issuedAt: number;
  /** `null` cuando la atestación no vence. */
  expiresAt: number | null;
  revoked: boolean;
  /** Siempre `false` en la simulación: no hay renta ni TTL que archiven entradas. */
  archived: boolean;
  source: ChainSource;
}

export interface AttestationList {
  items: AttestationRecord[];
  source: ChainSource;
}

/** Atestaciones en Attest Protocol + índice de Yucu (ADR-005 D9). preparar → firmar → enviar. */
export interface AttestationPort {
  prepareAttest(req: AttestRequest): Promise<UnsignedTransaction>;
  prepareRevoke(attestationId: string, revokerAddress: string): Promise<UnsignedTransaction>;
  /** Envía la emisión firmada y devuelve el ID que calculó el contrato. */
  submitAttest(signedXdr: string): Promise<ChainReceipt & { attestationId: string }>;
  /** Envía cualquier otra operación firmada (hoy, solo revocaciones). */
  submit(signedXdr: string): Promise<ChainReceipt>;
  /**
   * Lee el estado desde la red. Con `expected`, comprueba también esquema y sujeto.
   * Si la atestación apunta a otra con `ref_uid`, esa también debe seguir vigente (D6).
   */
  verify(attestationId: string, expected?: { schemaId: string; subjectRef: string }): Promise<{
    valid: boolean;
    revoked: boolean;
    expired: boolean;
    archived: boolean;
    source: ChainSource;
  }>;
  /** Lista BySubject en orden de emisión. `start` es el índice inicial y `limit` el máximo de items. */
  listForLot(lotCode: string, start?: number, limit?: number): Promise<AttestationList>;
  /** Lista ByAttester para el historial de la consola (ADR-005 D2). */
  listForIssuer(issuerAddress: string, start?: number, limit?: number): Promise<AttestationList>;
  /** Lista ByRecipient: lo que se dice de una cuenta pública. */
  listForRecipient(address: string, start?: number, limit?: number): Promise<AttestationList>;
  schemaStats(schemaId: string): Promise<{ total: number; revoked: number; source: ChainSource }>;
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

// ─────────────────────────────── Salida a pesos (ADR-004, D9) ───────────────────────────────

export type PayoutStatus = 'pending' | 'ready' | 'collected' | 'expired' | 'refunded';

/**
 * Pesos que la artesana recibiría por su retiro. La simulación no cobra comisión porque todavía
 * no se conoce la del proveedor (ADR-004 D9).
 */
export interface PayoutQuote {
  amountPesos: number;
  source: ChainSource;
}

/**
 * Retiro en efectivo o por SPEI. Sale de la cuenta de la artesana y lo firma ella (#112).
 * `walletKind: 'card'` exige un código de cobro de 15 minutos o menos, como el QR de MicoPay:
 * si nadie lo cobra, el dinero regresa a su cuenta.
 */
export interface CashoutRequest {
  /** Dirección pública de la artesana (G...), nunca su nombre. */
  producerAddress: string;
  /** Monto en USDC que sale de su propia cuenta. */
  amountUsdc: number;
  /** Cómo firma: teléfono, tarjeta QR o billetera externa (el mismo `kind` de WalletPort). */
  walletKind: WalletKind;
  /** Código del agente o tienda donde cobra. No lleva el nombre de ninguna persona. */
  agentCode: string;
  /** Minutos que vale el código de cobro. Con 'card' no puede pasar de 15. */
  expiresInMinutes: number;
}

/** Comprobante del retiro: el código/QR que se muestra en la tienda y cuándo vence. */
export interface CashoutReceipt extends ChainReceipt {
  cashoutId: string;
  code: string;
  /** Momento (ms) en que vence el código de cobro. */
  expiresAt: number;
}

export interface PayoutState {
  status: PayoutStatus;
  /** Momento (ms) en que vence el código de cobro. */
  expiresAt: number;
  source: ChainSource;
}

/**
 * Salida a pesos desde la cuenta de la artesana, detrás de un proveedor (MicoPay para efectivo,
 * Etherfuse para SPEI; ADR-004 D9). Mismo patrón: preparar -> firmar en el teléfono -> enviar.
 * Ningún método recibe ni devuelve llaves secretas ni nombres de personas.
 */
export interface PayoutPort {
  /** Pesos netos que recibiría la artesana por `amountUsdc`. */
  quote(amountUsdc: number): Promise<PayoutQuote>;
  /** Prepara el retiro desde la cuenta de la artesana hacia la tienda elegida. */
  prepareCashout(req: CashoutRequest): Promise<UnsignedTransaction>;
  /** Envía el retiro firmado y devuelve el código/QR y su vencimiento. */
  submit(signedXdr: string): Promise<CashoutReceipt>;
  /** Estado del retiro: pendiente, listo, cobrado, vencido o devuelto. */
  getStatus(cashoutId: string): Promise<PayoutState>;
}
