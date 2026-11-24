// Estado compartido del patrocinio (#94). Ver docs/arquitectura/SERVIDOR.md, sección 5,
// y BASE_DE_DATOS.md, secciones 3 y 4 (tablas `cuentas` y `contadores`).
// En Vercel cada copia del servidor tiene su propia memoria: por eso nada de esto vive en una variable
// de las rutas, sino detrás de esta interfaz. Hoy existe la versión en memoria (MemorySponsorStore);
// la de PostgreSQL llega con #156 sin tocar las rutas.

export type AccountRole = "artesana" | "promotora" | "comprador";

/** Fila de la tabla `cuentas`. La escribe #94; la lee #92 (el certificador solo cofirma a estas). */
export interface RegisteredAccount {
  /** Dirección `G…`. Nunca un nombre. */
  address: string;
  role: AccountRole;
  groupId: string | null;
  /** La promotora que firmó el alta, si la hubo. */
  registeredBy: string | null;
  registeredAt: Date;
  /** `false`: deja de patrocinar y de cofirmar, sin borrar el historial. */
  active: boolean;
}

/** Alta de cuenta preparada y todavía sin firmar por la artesana (paso 1 de 2). */
export interface PendingAccountCreation {
  /** Hash (hex) de la transacción que preparó el servidor. La firma no lo cambia. */
  txHash: string;
  newAccount: string;
  promoter: string;
  groupId: string | null;
  expiresAt: Date;
}

export interface SponsorStore {
  readonly kind: "memory" | "postgres";

  getAccount(address: string): Promise<RegisteredAccount | null>;
  /** Da de alta una cuenta. Devuelve `false` si ya existía (no la sobrescribe). */
  registerAccount(account: RegisteredAccount): Promise<boolean>;

  /** ¿Es el escrow de Trustless Work de una compra dada de alta (#96)? */
  isRegisteredEscrow(contractId: string): Promise<boolean>;

  /**
   * Suma `by` al contador `key` y devuelve el total, en una sola operación
   * (BASE_DE_DATOS.md, sección 4: INSERT … ON CONFLICT DO UPDATE … RETURNING).
   */
  incrementCounter(key: string, by: number, expiresAt: Date): Promise<number>;

  savePendingCreation(pending: PendingAccountCreation): Promise<void>;
  /** Consulta sin consumir. `null` si no existe o ya venció. */
  getPendingCreation(txHash: string, now: Date): Promise<PendingAccountCreation | null>;
  /** La consume: solo una llamada la obtiene, aunque lleguen dos al mismo tiempo. */
  takePendingCreation(txHash: string, now: Date): Promise<PendingAccountCreation | null>;
}
