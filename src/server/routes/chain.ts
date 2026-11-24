import { Router, Request, Response } from "express";
import {
  Account,
  Address,
  Asset,
  BASE_FEE,
  FeeBumpTransaction,
  Keypair,
  Operation,
  StrKey,
  Transaction,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { sendError } from "../errors";
import {
  SPONSORED_CONTRACT_FUNCTIONS,
  SPONSORED_ESCROW_FUNCTIONS,
  SponsorConfig,
  loadSponsorConfig,
} from "../sponsorConfig";
import type { SponsorStore } from "../store/sponsorStore";
import { MemorySponsorStore } from "../store/memorySponsorStore";
import { ChainGateway, StellarRpcGateway } from "../stellar/chainGateway";

// Rutas /api/chain/* del patrocinio (#94). Ver docs/arquitectura/SERVIDOR.md.
//
// La plataforma PAGA (fee-bump, CAP-15) y PATROCINA reservas (CAP-33), pero nunca firma por la persona
// (ADR-003, ADR-004). El servidor solo firma con la llave de la cuenta patrocinadora y solo en su papel:
//
//   POST /api/chain/submit            XDR firmado por la persona → fee-bump pagado por la plataforma.
//   POST /api/chain/accounts          Paso 1 del alta: la promotora la pide; devuelve la transacción SIN firmar.
//   POST /api/chain/accounts/confirm  Paso 2 del alta: llega firmada por la artesana; se revisa que sea la
//                                     misma (mismo hash), se agrega la firma patrocinadora y se envía.

/** Registro de eventos. Nunca recibe direcciones, llaves ni datos de personas. */
export type ChainLogger = (event: string, data?: Record<string, string | number>) => void;

export interface ChainRouteDeps {
  store: SponsorStore;
  gateway: ChainGateway;
  config: SponsorConfig;
  logger?: ChainLogger;
  now?: () => Date;
}

/** Tiempo que tiene la promotora para dar la autorización y la artesana para firmar el alta. */
export const AUTH_WINDOW_SECONDS = 300;
export const PENDING_TTL_SECONDS = 600;
/** Un XDR de una sola operación cabe de sobra; evita procesar cuerpos enormes. */
const MAX_XDR_LENGTH = 20_000;

/**
 * Mensaje que firma la promotora (ed25519, UTF-8) para pedir el alta de una cuenta.
 * El navegador lo arma igual y lo firma con su llave; la firma va en base64.
 */
export function accountCreationMessage(newAccount: string, issuedAt: number): string {
  return `yucu:alta-cuenta:${newAccount}:${issuedAt}`;
}

const isAccountId = (v: unknown): v is string => typeof v === "string" && StrKey.isValidEd25519PublicKey(v);

/** Día en UTC (`2026-11-23`): los límites diarios se reinician a medianoche UTC. */
function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function nextUtcMidnight(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

function secondsUntil(now: Date, later: Date): number {
  return Math.max(1, Math.ceil((later.getTime() - now.getTime()) / 1000));
}

function explorerUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

/** XDR de una transacción normal (no fee-bump). `null` si no es válido. */
function parseUserTransaction(raw: unknown, networkPassphrase: string): Transaction | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_XDR_LENGTH) return null;
  try {
    const tx = TransactionBuilder.fromXDR(raw, networkPassphrase);
    return tx instanceof FeeBumpTransaction ? null : tx;
  } catch {
    return null;
  }
}

/** ¿Tiene la transacción una firma válida de `address`? (Cuentas de una sola llave, como las de Yucu.) */
export function hasValidSignature(tx: Transaction, address: string): boolean {
  const kp = Keypair.fromPublicKey(address);
  const hint = kp.signatureHint();
  const hash = tx.hash();
  return tx.signatures.some((s) => s.hint().equals(hint) && kp.verify(hash, s.signature()));
}

/**
 * Comisión base por operación del fee-bump. Igual que en el SDK: la comisión de inclusión de la
 * transacción interna sin la comisión de recursos de Soroban, y nunca menos que BASE_FEE.
 */
function feeBumpBaseFee(inner: Transaction): string {
  let resourceFee = 0n;
  const env = inner.toEnvelope();
  if (env.switch().name === "envelopeTypeTx") {
    const ext = env.v1().tx().ext();
    if (ext.switch() === 1) resourceFee = BigInt(ext.sorobanData().resourceFee().toString());
  }
  const inclusion = (BigInt(inner.fee) - resourceFee) / BigInt(inner.operations.length);
  const min = BigInt(BASE_FEE);
  return (inclusion > min ? inclusion : min).toString();
}

export function createChainRoutes(deps: ChainRouteDeps): Router {
  const { store, gateway, config } = deps;
  const log: ChainLogger = deps.logger ?? ((event, data) => console.warn(`[chain] ${event}`, data ?? {}));
  const now = deps.now ?? (() => new Date());
  const router = Router();

  const sponsorUnavailable = (res: Response) =>
    sendError(res, 503, "Por ahora no podemos pagar el costo de la red. Intente más tarde.", "SPONSOR_UNAVAILABLE");

  /** Lista blanca de lo que se patrocina (corrección de seguridad de #94). */
  async function isSponsoredOperation(op: Operation, source: string): Promise<boolean> {
    if (op.source && op.source !== source) return false;

    if (op.type === "changeTrust") {
      return (
        config.usdcIssuer !== null &&
        op.line instanceof Asset &&
        op.line.getCode() === "USDC" &&
        op.line.getIssuer() === config.usdcIssuer
      );
    }

    if (op.type === "invokeHostFunction") {
      const fn = op.func;
      if (fn.switch().name !== xdr.HostFunctionType.hostFunctionTypeInvokeContract().name) return false;
      const args = fn.invokeContract();
      const contractId = Address.fromScAddress(args.contractAddress()).toString();
      const fnName = args.functionName().toString();
      const allowed = SPONSORED_CONTRACT_FUNCTIONS[contractId];
      if (allowed) return allowed.includes(fnName);
      if (await store.isRegisteredEscrow(contractId)) return SPONSORED_ESCROW_FUNCTIONS.includes(fnName);
      return false;
    }

    return false;
  }

  // ───────────── POST /api/chain/submit: fee-bump patrocinado ─────────────
  router.post("/submit", async (req: Request, res: Response) => {
    const sponsor = config.sponsor;
    if (!sponsor) return sponsorUnavailable(res);

    const inner = parseUserTransaction(req.body?.xdr, config.networkPassphrase);
    if (!inner) return sendError(res, 400, "La transacción no es válida.", "INVALID_XDR");

    if (inner.operations.length !== 1) {
      return sendError(res, 403, "Solo pagamos transacciones de una sola operación.", "NOT_SPONSORED");
    }

    const source = inner.source;
    const account = await store.getAccount(source);
    if (!account || !account.active) {
      return sendError(res, 403, "Esta cuenta no está dada de alta.", "NOT_REGISTERED");
    }

    if (!(await isSponsoredOperation(inner.operations[0], source))) {
      return sendError(res, 403, "Esta operación no la paga Yucu.", "NOT_SPONSORED");
    }

    if (!hasValidSignature(inner, source)) {
      return sendError(res, 400, "La firma no es válida. Vuelva a firmar en su teléfono.", "BAD_SIGNATURE");
    }

    // La transacción interna se envuelve tal cual: no se cambia nada, así su firma sigue siendo válida.
    let feeBump: FeeBumpTransaction;
    try {
      feeBump = TransactionBuilder.buildFeeBumpTransaction(
        sponsor,
        feeBumpBaseFee(inner),
        inner,
        config.networkPassphrase,
      );
    } catch {
      return sendError(res, 400, "La transacción no es válida.", "INVALID_XDR");
    }

    if (Number(inner.fee) > config.maxFee || Number(feeBump.fee) > config.maxFee) {
      return sendError(res, 403, "El costo de esta operación es demasiado alto.", "FEE_TOO_HIGH");
    }

    const t = now();
    const day = dayKey(t);
    const resetAt = nextUtcMidnight(t);
    const keepUntil = new Date(resetAt.getTime() + 24 * 3600 * 1000);

    const used = await store.incrementCounter(`patrocinio:${source}:${day}`, 1, keepUntil);
    if (used > config.maxTxPerDay) {
      res.setHeader("Retry-After", String(secondsUntil(t, resetAt)));
      return sendError(
        res,
        429,
        `Ya usó las ${config.maxTxPerDay} operaciones pagadas de hoy. Intente de nuevo mañana.`,
        "DAILY_LIMIT",
      );
    }

    const spent = await store.incrementCounter(`patrocinio:gasto:${day}`, Number(feeBump.fee), keepUntil);
    if (spent > config.maxFeePerDay) {
      log("sponsor_daily_spend_limit", { day });
      res.setHeader("Retry-After", String(secondsUntil(t, resetAt)));
      return sendError(res, 429, "Por hoy ya no podemos pagar más operaciones. Intente mañana.", "SPONSOR_DAILY_LIMIT");
    }

    feeBump.sign(sponsor);
    try {
      const receipt = await gateway.submit(feeBump);
      return res.json({
        source: "testnet",
        txHash: receipt.txHash,
        ledger: receipt.ledger,
        explorerUrl: explorerUrl(receipt.txHash),
      });
    } catch {
      log("sponsor_submit_failed", { route: "submit" });
      return sendError(res, 502, "La red no aceptó la operación. Intente de nuevo.", "SUBMIT_FAILED");
    }
  });

  // ───────────── POST /api/chain/accounts: paso 1 del alta (promotora) ─────────────
  router.post("/accounts", async (req: Request, res: Response) => {
    const sponsor = config.sponsor;
    if (!sponsor || !config.usdcIssuer) return sponsorUnavailable(res);

    const { newAccount, promoter, issuedAt, signature } = req.body ?? {};
    if (
      !isAccountId(newAccount) ||
      !isAccountId(promoter) ||
      typeof issuedAt !== "number" ||
      !Number.isInteger(issuedAt) ||
      typeof signature !== "string"
    ) {
      return sendError(res, 400, "Faltan datos para abrir la cuenta.", "INVALID_REQUEST");
    }

    const t = now();
    if (Math.abs(t.getTime() / 1000 - issuedAt) > AUTH_WINDOW_SECONDS) {
      return sendError(res, 403, "La autorización ya venció. Vuelva a intentarlo.", "AUTH_EXPIRED");
    }

    let signatureOk = false;
    try {
      signatureOk = Keypair.fromPublicKey(promoter).verify(
        Buffer.from(accountCreationMessage(newAccount, issuedAt), "utf8"),
        Buffer.from(signature, "base64"),
      );
    } catch {
      signatureOk = false;
    }
    if (!signatureOk) {
      return sendError(res, 403, "La autorización de la promotora no es válida.", "BAD_AUTHORIZATION");
    }

    const p = await store.getAccount(promoter);
    if (!p || !p.active || p.role !== "promotora") {
      return sendError(res, 403, "Solo una promotora dada de alta puede abrir cuentas.", "NOT_REGISTERED");
    }

    if (await store.getAccount(newAccount)) {
      return sendError(res, 409, "Esta cuenta ya está dada de alta.", "ALREADY_REGISTERED");
    }

    let sequence: string;
    try {
      if (await gateway.accountExists(newAccount)) {
        return sendError(res, 409, "Esta cuenta ya existe en la red.", "ALREADY_EXISTS");
      }
      sequence = await gateway.loadSequence(sponsor.publicKey());
    } catch {
      log("sponsor_network_unavailable", { route: "accounts" });
      return sendError(res, 502, "No pudimos conectarnos a la red. Intente de nuevo.", "NETWORK_UNAVAILABLE");
    }

    // La cuenta patrocinadora paga la comisión y la reserva de la cuenta y de su trustline de USDC (CAP-33).
    // La artesana es la fuente de ChangeTrust y EndSponsoring: sin su firma, la transacción no vale.
    const tx = new TransactionBuilder(new Account(sponsor.publicKey(), sequence), {
      fee: BASE_FEE,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(Operation.beginSponsoringFutureReserves({ sponsoredId: newAccount }))
      .addOperation(Operation.createAccount({ destination: newAccount, startingBalance: "0" }))
      .addOperation(Operation.changeTrust({ asset: new Asset("USDC", config.usdcIssuer), source: newAccount }))
      .addOperation(Operation.endSponsoringFutureReserves({ source: newAccount }))
      .setTimeout(PENDING_TTL_SECONDS)
      .build();

    await store.savePendingCreation({
      txHash: tx.hash().toString("hex"),
      newAccount,
      promoter,
      groupId: p.groupId,
      expiresAt: new Date(t.getTime() + PENDING_TTL_SECONDS * 1000),
    });

    // UnsignedTransaction (src/core/chain/ports.ts): el servidor todavía no la firma.
    return res.json({
      source: "testnet",
      xdr: tx.toXDR(),
      networkPassphrase: config.networkPassphrase,
      summary: "Abrir su cuenta en Yucu para recibir pagos. Yucu paga el costo de apertura.",
    });
  });

  // ───────────── POST /api/chain/accounts/confirm: paso 2 del alta (artesana) ─────────────
  router.post("/accounts/confirm", async (req: Request, res: Response) => {
    const sponsor = config.sponsor;
    if (!sponsor) return sponsorUnavailable(res);

    const tx = parseUserTransaction(req.body?.xdr, config.networkPassphrase);
    if (!tx) return sendError(res, 400, "La transacción no es válida.", "INVALID_XDR");

    // El hash no incluye las firmas: si coincide, es exactamente la transacción que preparó el servidor.
    const txHash = tx.hash().toString("hex");
    const t = now();
    const pending = await store.getPendingCreation(txHash, t);
    if (!pending) {
      return sendError(
        res,
        404,
        "No encontramos esta alta o ya venció. Pida a su promotora que la prepare de nuevo.",
        "NOT_FOUND",
      );
    }

    if (!hasValidSignature(tx, pending.newAccount)) {
      return sendError(res, 400, "Falta la firma de la dueña de la cuenta.", "BAD_SIGNATURE");
    }

    const day = dayKey(t);
    const resetAt = nextUtcMidnight(t);
    const created = await store.incrementCounter(
      `altas:${day}`,
      1,
      new Date(resetAt.getTime() + 24 * 3600 * 1000),
    );
    if (created > config.maxAccountsPerDay) {
      log("sponsor_daily_accounts_limit", { day });
      res.setHeader("Retry-After", String(secondsUntil(t, resetAt)));
      return sendError(res, 429, "Por hoy ya no podemos abrir más cuentas. Intente mañana.", "DAILY_LIMIT");
    }

    // Se consume una sola vez: si llegan dos confirmaciones, solo una sigue.
    const taken = await store.takePendingCreation(txHash, t);
    if (!taken) {
      return sendError(res, 404, "Esta alta ya se usó o venció.", "NOT_FOUND");
    }

    tx.sign(sponsor);
    try {
      const receipt = await gateway.submit(tx);
      await store.registerAccount({
        address: taken.newAccount,
        role: "artesana",
        groupId: taken.groupId,
        registeredBy: taken.promoter,
        registeredAt: t,
        active: true,
      });
      return res.json({
        source: "testnet",
        txHash: receipt.txHash,
        ledger: receipt.ledger,
        explorerUrl: explorerUrl(receipt.txHash),
      });
    } catch {
      log("sponsor_submit_failed", { route: "accounts/confirm" });
      return sendError(res, 502, "La red no aceptó el alta. Pida a su promotora que la prepare de nuevo.", "SUBMIT_FAILED");
    }
  });

  return router;
}

// ───────────── Conexión por defecto (server.ts) ─────────────

/** Promotoras para la versión en memoria (`SPONSOR_PROMOTERS`, direcciones G… separadas por comas). */
function seedPromoters(env: Record<string, string | undefined>) {
  return (env.SPONSOR_PROMOTERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(isAccountId)
    .map((address) => ({
      address,
      role: "promotora" as const,
      groupId: null,
      registeredBy: null,
      registeredAt: new Date(),
      active: true,
    }));
}

const defaultConfig = loadSponsorConfig();
export const chainStore: SponsorStore = new MemorySponsorStore({ accounts: seedPromoters(process.env) });
export const chainRoutes = createChainRoutes({
  store: chainStore,
  gateway: new StellarRpcGateway(defaultConfig.rpcUrl),
  config: defaultConfig,
});
