// Pruebas de la #106: las rutas /api/v1/* ya no inventan verificaciones ni certificaciones.
// Se monta solo el router de src/server/routes/legacy.ts en una app de prueba: no llama a servicios externos.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import { legacyRoutes, normalizeLotCode } from "../server/routes/legacy";

let server: http.Server;
let base = "";

before(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1", legacyRoutes);
  server = http.createServer(app).listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as { port: number };
  base = `http://127.0.0.1:${port}/api/v1`;
});

after(() => {
  server.close();
});

const post = (path: string, body: unknown) =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// Un hash de 64 caracteres hexadecimales, con o sin 0x, como los que se inventaban antes.
const FAKE_HASH = /\b(0x)?[a-f0-9]{64}\b/i;

describe("Código de lote (#106)", () => {
  test("acepta un código válido y lo pasa a mayúsculas", () => {
    assert.equal(normalizeLotCode(" mx-2024-884 "), "MX-2024-884");
  });

  test("rechaza códigos inválidos o que no son texto", () => {
    assert.equal(normalizeLotCode("ABCDEFGH"), null); // antes bastaba con tener más de 6 caracteres
    assert.equal(normalizeLotCode(""), null);
    assert.equal(normalizeLotCode(12345678), null);
    assert.equal(normalizeLotCode(undefined), null);
  });
});

describe("POST /api/v1/attestations/verify (#106)", () => {
  test("con un código válido responde 501 y no dice que algo está verificado", async () => {
    const res = await post("/attestations/verify", { lotCode: "MX-2024-884" });
    assert.equal(res.status, 501);
    const body = await res.json();
    assert.equal(body.code, "NOT_IMPLEMENTED");
    assert.equal(typeof body.error, "string");
    assert.equal(body.verified, undefined);
    const text = JSON.stringify(body);
    assert.doesNotMatch(text, FAKE_HASH);
    assert.doesNotMatch(text, /certified|ledger/i);
  });

  test("con un código inválido responde 400", async () => {
    const res = await post("/attestations/verify", { lotCode: "ABCDEFGH" });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, "INVALID_LOT_CODE");
  });

  test("sin código responde 400 (ya no usa un lote de ejemplo)", async () => {
    const res = await post("/attestations/verify", {});
    assert.equal(res.status, 400);
  });
});

describe("POST /api/v1/attestations/issue (#106)", () => {
  test("responde 501 y no inventa UID, hash ni ledger", async () => {
    const res = await post("/attestations/issue", { lotCode: "MX-2024-884" });
    assert.equal(res.status, 501);
    const body = await res.json();
    assert.equal(body.code, "NOT_IMPLEMENTED");
    assert.equal(body.attestationUid, undefined);
    assert.equal(body.ledgerTransaction, undefined);
    assert.doesNotMatch(JSON.stringify(body), FAKE_HASH);
  });

  test("con un código inválido responde 400", async () => {
    const res = await post("/attestations/issue", { lotCode: "lote" });
    assert.equal(res.status, 400);
  });
});

describe("GET /api/v1/lots/:code/passport (#106)", () => {
  test("devuelve datos de demostración marcados como simulados", async () => {
    const res = await fetch(`${base}/lots/MX-2024-884/passport`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.source, "simulated");
    assert.equal(body.lotCode, "MX-2024-884");
  });

  test("no trae credencial verificable, firma, hash ni nombre de persona", async () => {
    const res = await fetch(`${base}/lots/MX-2024-884/passport`);
    const body = await res.json();
    const text = JSON.stringify(body);
    assert.equal(body.proof, undefined);
    assert.doesNotMatch(text, /VerifiableCredential/);
    assert.doesNotMatch(text, /producerName/);
    assert.doesNotMatch(text, FAKE_HASH);
  });

  test("con un código inválido responde 400", async () => {
    const res = await fetch(`${base}/lots/no-es-un-lote/passport`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, "INVALID_LOT_CODE");
  });
});

describe("GET /api/v1/protocol/spec (#106)", () => {
  test("se marca como simulada porque trae direcciones de ejemplo", async () => {
    const res = await fetch(`${base}/protocol/spec`);
    const body = await res.json();
    assert.equal(body.source, "simulated");
    assert.doesNotMatch(body.version, /production/);
  });
});
