// Pruebas de la #94: fee-bump patrocinado y alta de cuentas con reserva patrocinada.
// Se monta solo el router de src/server/routes/chain.ts con un almacén en memoria y una red falsa:
// no se llama a Stellar. Las llaves se generan al momento con Keypair.random(); no hay llaves reales.
import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import express from "express";
import {
  Account,
  Asset,
  FeeBumpTransaction,
  Keypair,
  Networks,
  Operation,
  StrKey,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { accountCreationMessage, createChainRoutes, hasValidSignature } from "../server/routes/chain";
import { MemorySponsorStore } from "../server/store/memorySponsorStore";
import type { ChainGateway } from "../server/stellar/chainGateway";
import { SPONSOR_DEFAULTS, SponsorConfig, TESTNET_CONTRACTS, loadSponsorConfig } from "../server/sponsorConfig";

const PASSPHRASE = Networks.TESTNET;

class FakeGateway implements ChainGateway {
  submitted: (Transaction | FeeBumpTransaction)[] = [];
  existing = new Set<string>();
  failSubmit = false;
  async loadSequence(): Promise<string> {
    return "100";
  }
  async accountExists(address: string): Promise<boolean> {
    return this.existing.has(address);
  }
  async submit(tx: Transaction | FeeBumpTransaction) {
    if (this.failSubmit) throw new Error("rechazada");
    this.submitted.push(tx);
    return { txHash: tx.hash().toString("hex"), ledger: 1234 };
  }
}

let sponsor: Keypair;
let usdcIssuer: Keypair;
let artisan: Keypair;
let promoter: Keypair;
let store: MemorySponsorStore;
let gateway: FakeGateway;
let logs: { event: string; data?: Record<string, string | number> }[];
let server: http.Server;
let base = "";

function config(overrides: Partial<SponsorConfig> = {}): SponsorConfig {
  return {
    sponsor,
    networkPassphrase: PASSPHRASE,
    rpcUrl: "http://127.0.0.1:1",
    usdcIssuer: usdcIssuer.publicKey(),
    maxFee: 100_000,
    maxTxPerDay: 10,
    maxAccountsPerDay: 20,
    maxFeePerDay: 10_000_000,
    ...overrides,
  };
}

async function start(cfg: SponsorConfig) {
  const app = express();
  app.use(express.json());
  app.use(
    "/api/chain",
    createChainRoutes({ store, gateway, config: cfg, logger: (event, data) => logs.push({ event, data }) }),
  );
  server = http.createServer(app).listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as { port: number };
  base = `http://127.0.0.1:${port}/api/chain`;
}

beforeEach(async () => {
  sponsor = Keypair.random();
  usdcIssuer = Keypair.random();
  artisan = Keypair.random();
  promoter = Keypair.random();
  store = new MemorySponsorStore({
    accounts: [
      { address: artisan.publicKey(), role: "artesana", groupId: "grupo-1", registeredBy: null, registeredAt: new Date(), active: true },
      { address: promoter.publicKey(), role: "promotora", groupId: "grupo-1", registeredBy: null, registeredAt: new Date(), active: true },
    ],
  });
  gateway = new FakeGateway();
  logs = [];
  await start(config());
});

afterEach(() => {
  server.close();
});

async function restart(cfg: SponsorConfig) {
  server.close();
  await start(cfg);
}

const post = (p: string, body: unknown) =>
  fetch(`${base}${p}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/** Transacción de la persona: una operación, firmada por `signer` (por defecto, la artesana). */
function userTx(opts: { ops?: ReturnType<typeof Operation.invokeContractFunction>[]; fee?: string; signer?: Keypair; source?: Keypair } = {}) {
  const source = opts.source ?? artisan;
  const builder = new TransactionBuilder(new Account(source.publicKey(), "41"), {
    fee: opts.fee ?? "1000",
    networkPassphrase: PASSPHRASE,
  });
  const ops = opts.ops ?? [
    Operation.invokeContractFunction({ contract: TESTNET_CONTRACTS.lotPassport, function: "register_lot", args: [] }),
  ];
  for (const op of ops) builder.addOperation(op);
  const tx = builder.setTimeout(300).build();
  tx.sign(opts.signer ?? source);
  return tx;
}

const randomContract = () => StrKey.encodeContract(randomBytes(32));

// ───────────────────────────── POST /submit ─────────────────────────────

describe("POST /api/chain/submit (#94)", () => {
  test("envuelve la transacción en un fee-bump pagado por la patrocinadora sin modificarla", async () => {
    const tx = userTx();
    const res = await post("/submit", { xdr: tx.toXDR() });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.source, "testnet");
    assert.equal(body.ledger, 1234);

    assert.equal(gateway.submitted.length, 1);
    const sent = gateway.submitted[0];
    assert.ok(sent instanceof FeeBumpTransaction);
    assert.equal(sent.feeSource, sponsor.publicKey());
    // La transacción interna es idéntica, byte por byte: la firma de la persona sigue siendo válida.
    assert.equal(sent.innerTransaction.toXDR(), tx.toXDR());
    assert.ok(hasValidSignature(sent.innerTransaction, artisan.publicKey()));
    // El servidor solo firma el envoltorio, con la llave de la plataforma.
    assert.equal(sent.signatures.length, 1);
    assert.ok(sponsor.verify(sent.hash(), sent.signatures[0].signature()));
  });

  test("rechaza una firma inválida", async () => {
    const tx = userTx({ signer: Keypair.random() });
    const res = await post("/submit", { xdr: tx.toXDR() });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).code, "BAD_SIGNATURE");
    assert.equal(gateway.submitted.length, 0);
  });

  test("rechaza una transacción sin firma", async () => {
    const tx = userTx();
    tx.signatures.splice(0);
    const res = await post("/submit", { xdr: tx.toXDR() });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).code, "BAD_SIGNATURE");
  });

  test("rechaza dos operaciones", async () => {
    const op = Operation.invokeContractFunction({ contract: TESTNET_CONTRACTS.lotPassport, function: "register_lot", args: [] });
    const res = await post("/submit", { xdr: userTx({ ops: [op, op] }).toXDR() });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, "NOT_SPONSORED");
  });

  test("rechaza un contrato fuera de la lista blanca", async () => {
    const op = Operation.invokeContractFunction({ contract: randomContract(), function: "register_lot", args: [] });
    const res = await post("/submit", { xdr: userTx({ ops: [op] }).toXDR() });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, "NOT_SPONSORED");
  });

  test("rechaza una función que no es del flujo de la persona", async () => {
    const op = Operation.invokeContractFunction({ contract: TESTNET_CONTRACTS.lotPassport, function: "set_certifier", args: [] });
    const res = await post("/submit", { xdr: userTx({ ops: [op] }).toXDR() });
    assert.equal(res.status, 403);
  });

  test("patrocina el escrow de una compra dada de alta, solo con funciones de su flujo", async () => {
    const escrow = randomContract();
    store.addEscrow(escrow);
    const ok = Operation.invokeContractFunction({ contract: escrow, function: "approve_milestone", args: [] });
    assert.equal((await post("/submit", { xdr: userTx({ ops: [ok] }).toXDR() })).status, 200);
    const bad = Operation.invokeContractFunction({ contract: escrow, function: "update_escrow", args: [] });
    assert.equal((await post("/submit", { xdr: userTx({ ops: [bad] }).toXDR() })).status, 403);
  });

  test("patrocina changeTrust al USDC configurado y rechaza otro activo", async () => {
    const tx = (asset: Asset) => {
      const t = new TransactionBuilder(new Account(artisan.publicKey(), "41"), { fee: "100", networkPassphrase: PASSPHRASE })
        .addOperation(Operation.changeTrust({ asset }))
        .setTimeout(300)
        .build();
      t.sign(artisan);
      return t.toXDR();
    };
    assert.equal((await post("/submit", { xdr: tx(new Asset("USDC", usdcIssuer.publicKey())) })).status, 200);
    assert.equal((await post("/submit", { xdr: tx(new Asset("USDC", Keypair.random().publicKey())) })).status, 403);
  });

  test("rechaza una comisión mayor a SPONSOR_MAX_FEE", async () => {
    const res = await post("/submit", { xdr: userTx({ fee: "500000" }).toXDR() });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, "FEE_TOO_HIGH");
    assert.equal(gateway.submitted.length, 0);
  });

  test("rechaza una cuenta que no está dada de alta", async () => {
    const stranger = Keypair.random();
    const res = await post("/submit", { xdr: userTx({ source: stranger }).toXDR() });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, "NOT_REGISTERED");
  });

  test("rechaza XDR inválido", async () => {
    const res = await post("/submit", { xdr: "no-es-xdr" });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).code, "INVALID_XDR");
  });

  test("límite por cuenta y por día: la siguiente responde 429 con Retry-After", async () => {
    await restart(config({ maxTxPerDay: 2 }));
    assert.equal((await post("/submit", { xdr: userTx().toXDR() })).status, 200);
    assert.equal((await post("/submit", { xdr: userTx().toXDR() })).status, 200);
    const res = await post("/submit", { xdr: userTx().toXDR() });
    assert.equal(res.status, 429);
    assert.ok(Number(res.headers.get("retry-after")) > 0);
    const body = await res.json();
    assert.equal(body.code, "DAILY_LIMIT");
    assert.match(body.error, /2 operaciones/);
    assert.equal(gateway.submitted.length, 2);
  });

  test("límite de gasto diario: 429 y se registra sin datos de la persona", async () => {
    // Cada fee-bump de prueba cuesta 2000 stroops (1000 por operación × 2): caben dos, la tercera no.
    await restart(config({ maxFeePerDay: 4500 }));
    assert.equal((await post("/submit", { xdr: userTx().toXDR() })).status, 200);
    assert.equal((await post("/submit", { xdr: userTx().toXDR() })).status, 200);
    const res = await post("/submit", { xdr: userTx().toXDR() });
    assert.equal(res.status, 429);
    assert.equal((await res.json()).code, "SPONSOR_DAILY_LIMIT");
    assert.ok(logs.some((l) => l.event === "sponsor_daily_spend_limit"));
    const logged = JSON.stringify(logs);
    assert.ok(!logged.includes(artisan.publicKey()));
    assert.ok(!logged.includes(sponsor.secret()));
  });

  test("sin la llave patrocinadora responde 503", async () => {
    await restart(config({ sponsor: null }));
    const res = await post("/submit", { xdr: userTx().toXDR() });
    assert.equal(res.status, 503);
    assert.equal((await res.json()).code, "SPONSOR_UNAVAILABLE");
  });
});

// ───────────────────────────── Alta de cuenta en dos pasos ─────────────────────────────

function promoterRequest(newAccount: string, signer: Keypair = promoter, issuedAt = Math.floor(Date.now() / 1000)) {
  const signature = signer.sign(Buffer.from(accountCreationMessage(newAccount, issuedAt), "utf8")).toString("base64");
  return { newAccount, promoter: promoter.publicKey(), issuedAt, signature };
}

describe("POST /api/chain/accounts y /accounts/confirm (#94)", () => {
  test("paso 1: la promotora pide el alta y recibe la transacción SIN firmar", async () => {
    const newcomer = Keypair.random();
    const res = await post("/accounts", promoterRequest(newcomer.publicKey()));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.networkPassphrase, PASSPHRASE);
    assert.equal(typeof body.summary, "string");
    const tx = TransactionBuilder.fromXDR(body.xdr, PASSPHRASE) as Transaction;
    assert.equal(tx.signatures.length, 0);
    assert.equal(tx.source, sponsor.publicKey());
    assert.deepEqual(
      tx.operations.map((o) => o.type),
      ["beginSponsoringFutureReserves", "createAccount", "changeTrust", "endSponsoringFutureReserves"],
    );
    assert.equal(tx.operations[2].source, newcomer.publicKey());
    assert.equal(tx.operations[3].source, newcomer.publicKey());
  });

  test("paso 2: con la firma de la artesana se agrega la patrocinadora, se envía y queda dada de alta", async () => {
    const newcomer = Keypair.random();
    const prepared = await (await post("/accounts", promoterRequest(newcomer.publicKey()))).json();
    const tx = TransactionBuilder.fromXDR(prepared.xdr, PASSPHRASE) as Transaction;
    tx.sign(newcomer); // en su teléfono

    const res = await post("/accounts/confirm", { xdr: tx.toXDR() });
    assert.equal(res.status, 200);
    const sent = gateway.submitted[0] as Transaction;
    assert.equal(sent.signatures.length, 2);
    assert.ok(hasValidSignature(sent, newcomer.publicKey()));
    assert.ok(hasValidSignature(sent, sponsor.publicKey()));

    const registered = await store.getAccount(newcomer.publicKey());
    assert.equal(registered?.role, "artesana");
    assert.equal(registered?.groupId, "grupo-1");
    assert.equal(registered?.registeredBy, promoter.publicKey());

    // No se puede usar dos veces.
    assert.equal((await post("/accounts/confirm", { xdr: tx.toXDR() })).status, 404);
  });

  test("paso 2 rechaza una transacción distinta a la preparada", async () => {
    const newcomer = Keypair.random();
    await post("/accounts", promoterRequest(newcomer.publicKey()));
    const other = new TransactionBuilder(new Account(sponsor.publicKey(), "100"), { fee: "100", networkPassphrase: PASSPHRASE })
      .addOperation(Operation.createAccount({ destination: Keypair.random().publicKey(), startingBalance: "100" }))
      .setTimeout(300)
      .build();
    other.sign(newcomer);
    const res = await post("/accounts/confirm", { xdr: other.toXDR() });
    assert.equal(res.status, 404);
    assert.equal(gateway.submitted.length, 0);
  });

  test("paso 2 rechaza la transacción sin la firma de la artesana", async () => {
    const newcomer = Keypair.random();
    const prepared = await (await post("/accounts", promoterRequest(newcomer.publicKey()))).json();
    const tx = TransactionBuilder.fromXDR(prepared.xdr, PASSPHRASE) as Transaction;
    tx.sign(Keypair.random());
    const res = await post("/accounts/confirm", { xdr: tx.toXDR() });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).code, "BAD_SIGNATURE");
    assert.equal(gateway.submitted.length, 0);
  });

  test("rechaza la autorización firmada por alguien que no es la promotora", async () => {
    const res = await post("/accounts", promoterRequest(Keypair.random().publicKey(), Keypair.random()));
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, "BAD_AUTHORIZATION");
  });

  test("rechaza una autorización vencida", async () => {
    const old = Math.floor(Date.now() / 1000) - 3600;
    const res = await post("/accounts", promoterRequest(Keypair.random().publicKey(), promoter, old));
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, "AUTH_EXPIRED");
  });

  test("solo una promotora dada de alta puede abrir cuentas", async () => {
    // La artesana está dada de alta, pero no es promotora.
    const newAccount = Keypair.random().publicKey();
    const issuedAt = Math.floor(Date.now() / 1000);
    const signature = artisan.sign(Buffer.from(accountCreationMessage(newAccount, issuedAt), "utf8")).toString("base64");
    const res = await post("/accounts", { newAccount, promoter: artisan.publicKey(), issuedAt, signature });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, "NOT_REGISTERED");
  });

  test("rechaza una cuenta que ya existe", async () => {
    assert.equal((await post("/accounts", promoterRequest(artisan.publicKey()))).status, 409);
    const onChain = Keypair.random().publicKey();
    gateway.existing.add(onChain);
    assert.equal((await post("/accounts", promoterRequest(onChain))).status, 409);
  });

  test("límite global de altas por día: 429", async () => {
    await restart(config({ maxAccountsPerDay: 1 }));
    for (const expected of [200, 429]) {
      const newcomer = Keypair.random();
      const prepared = await (await post("/accounts", promoterRequest(newcomer.publicKey()))).json();
      const tx = TransactionBuilder.fromXDR(prepared.xdr, PASSPHRASE) as Transaction;
      tx.sign(newcomer);
      assert.equal((await post("/accounts/confirm", { xdr: tx.toXDR() })).status, expected);
    }
  });
});

// ───────────────────────────── Configuración y almacén ─────────────────────────────

describe("Configuración del patrocinio (#94)", () => {
  test("SPONSOR_MAX_TX_PER_DAY vale 10 por defecto y se puede cambiar", () => {
    assert.equal(loadSponsorConfig({}).maxTxPerDay, 10);
    assert.equal(SPONSOR_DEFAULTS.maxTxPerDay, 10);
    assert.equal(loadSponsorConfig({ SPONSOR_MAX_TX_PER_DAY: "3" }).maxTxPerDay, 3);
    assert.equal(loadSponsorConfig({ SPONSOR_MAX_TX_PER_DAY: "abc" }).maxTxPerDay, 10);
  });

  test("sin STELLAR_SPONSOR_SECRET o con una llave inválida, el patrocinio queda desactivado", () => {
    assert.equal(loadSponsorConfig({}).sponsor, null);
    assert.equal(loadSponsorConfig({ STELLAR_SPONSOR_SECRET: "no-es-llave" }).sponsor, null);
  });

  test("los contratos de la lista blanca coinciden con contracts/deployments/testnet.json", () => {
    const file = path.join(process.cwd(), "contracts", "deployments", "testnet.json");
    const deployed = JSON.parse(fs.readFileSync(file, "utf8")).contracts;
    assert.equal(TESTNET_CONTRACTS.lotPassport, deployed.lotPassport);
    assert.equal(TESTNET_CONTRACTS.perpetualRoyalties, deployed.perpetualRoyalties);
  });

  test(".env.example tiene las variables del patrocinio sin valores", () => {
    const env = fs.readFileSync(path.join(process.cwd(), ".env.example"), "utf8");
    for (const name of ["STELLAR_SPONSOR_SECRET", "SPONSOR_MAX_TX_PER_DAY", "SPONSOR_MAX_FEE", "SPONSOR_MAX_ACCOUNTS_PER_DAY"]) {
      assert.match(env, new RegExp(`^${name}=""$`, "m"));
    }
  });
});

describe("MemorySponsorStore (#94)", () => {
  test("dos incrementos al mismo tiempo dan totales distintos", async () => {
    const s = new MemorySponsorStore();
    const later = new Date(Date.now() + 60_000);
    const results = await Promise.all([s.incrementCounter("k", 1, later), s.incrementCounter("k", 1, later)]);
    assert.deepEqual(results.sort(), [1, 2]);
  });

  test("un alta pendiente solo se consume una vez", async () => {
    const s = new MemorySponsorStore();
    const now = new Date();
    await s.savePendingCreation({ txHash: "h", newAccount: "G", promoter: "P", groupId: null, expiresAt: new Date(now.getTime() + 1000) });
    const [a, b] = await Promise.all([s.takePendingCreation("h", now), s.takePendingCreation("h", now)]);
    assert.ok((a === null) !== (b === null));
  });
});
