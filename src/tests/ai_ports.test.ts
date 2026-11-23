// Pruebas de la #154: la IA detrás de puertos y respuestas honestas.
// Se monta solo el router de src/server/routes/ai.ts en una app de prueba. Nada llama a Google:
// el adaptador de Gemini recibe un cliente falso.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import type { GenerateContentParameters } from "@google/genai";
import { createAIRoutes, AI_MESSAGES, type AIRoutesLogger } from "../server/routes/ai";
import {
  AIError,
  GeminiAIProvider,
  SimulatedAIProvider,
  createAIProvider,
  type AIProvider,
} from "../server/ai";
import type { GenerateContentClient } from "../server/ai/GeminiAIProvider";
import { extractLotByRules, sanitizeLotDraft, describeLotDraft } from "../core/ai/lotFields";
import { HttpAssistant } from "../core/ai/HttpAssistant";
import { SimulatedAssistant } from "../core/ai/SimulatedAssistant";
import { simulatedChatReply } from "../core/ai/simulatedChat";

// ─────────────────────────────── Utilidades ───────────────────────────────

/** Llave falsa: si aparece en una respuesta o en un log, la prueba falla. */
const FAKE_KEY = "AIza-llave-falsa-de-prueba-0000";

class FakeGemini implements GenerateContentClient {
  calls: GenerateContentParameters[] = [];
  constructor(private readonly answer: string | (() => never)) {}
  async generateContent(params: GenerateContentParameters) {
    this.calls.push(params);
    if (typeof this.answer === "function") this.answer();
    return { text: this.answer as string };
  }
}

function recordingLogger() {
  const lines: string[] = [];
  const logger: AIRoutesLogger = { warn: (m) => lines.push(m), error: (m) => lines.push(m) };
  return { logger, lines };
}

async function startApp(provider: AIProvider, logger?: AIRoutesLogger) {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use("/api", createAIRoutes({ provider, logger: logger ?? recordingLogger().logger }));
  const server = http.createServer(app).listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as { port: number };
  return { server, base: `http://127.0.0.1:${port}/api` };
}

const post = (base: string, route: string, body: unknown) =>
  fetch(`${base}${route}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const AUDIO = { audioBase64: "data:audio/webm;codecs=opus;base64,AAAAGkZ0eXBpc29tAAACAGlzb20=", mimeType: "audio/webm;codecs=opus" };
const IMAGE = { imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD=", mimeType: "image/jpeg" };

// ─────────────────────────────── 1. Transcribir sin llave ───────────────────────────────

describe("POST /api/transcribe-audio (#154)", () => {
  test("sin GEMINI_API_KEY responde 503 con un mensaje claro y sin texto inventado", async () => {
    const { server, base } = await startApp(new GeminiAIProvider(undefined));
    try {
      const res = await post(base, "/transcribe-audio", AUDIO);
      assert.equal(res.status, 503);
      const body: Record<string, unknown> = await res.json();
      assert.deepEqual(body, { error: AI_MESSAGES.transcribeUnavailable, code: "AI_NOT_CONFIGURED" });
    } finally {
      server.close();
    }
  });

  test("con el proveedor simulado tampoco inventa una transcripción", async () => {
    const { server, base } = await startApp(new SimulatedAIProvider());
    try {
      const res = await post(base, "/transcribe-audio", AUDIO);
      assert.equal(res.status, 503);
      const body = await res.json();
      assert.equal(body.code, "AI_NOT_CONFIGURED");
      assert.equal(body.transcript, undefined);
    } finally {
      server.close();
    }
  });

  test("con Gemini devuelve lo que se transcribió, sin el prefijo data: ni los codecs", async () => {
    const fake = new FakeGemini("Tengo tres costales de café");
    const { server, base } = await startApp(new GeminiAIProvider(FAKE_KEY, fake));
    try {
      const res = await post(base, "/transcribe-audio", AUDIO);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { transcript: "Tengo tres costales de café", language: null, source: "gemini" });
      const parts = (fake.calls[0].contents as { parts: { inlineData?: { data: string; mimeType: string } }[] }[])[0].parts;
      assert.deepEqual(parts[1].inlineData, { data: "AAAAGkZ0eXBpc29tAAACAGlzb20=", mimeType: "audio/webm" });
    } finally {
      server.close();
    }
  });

  test("si no se entendió, responde 422 con el mensaje de ADR-006 (D4)", async () => {
    const { server, base } = await startApp(new GeminiAIProvider(FAKE_KEY, new FakeGemini("[NO_ENTENDI]")));
    try {
      const res = await post(base, "/transcribe-audio", AUDIO);
      assert.equal(res.status, 422);
      assert.deepEqual(await res.json(), { error: "No te escuché bien. ¿Lo intentamos otra vez o lo escribes?", code: "NOT_UNDERSTOOD" });
    } finally {
      server.close();
    }
  });

  test("sin audio responde 400", async () => {
    const { server, base } = await startApp(new SimulatedAIProvider());
    try {
      const res = await post(base, "/transcribe-audio", {});
      assert.equal(res.status, 400);
      assert.equal((await res.json()).code, "INVALID_AUDIO");
    } finally {
      server.close();
    }
  });
});

// ─────────────────────────────── 2 a 4. Extraer el lote ───────────────────────────────

describe("extractLot (#154)", () => {
  test("llena categoría, municipio y rango con 'unos tres costales de café de Tlaxiaco'", () => {
    const fields = extractLotByRules("Tengo unos tres costales de café de Tlaxiaco");
    assert.deepEqual(fields, { category: "coffee", variety: null, location: "Heroica Ciudad de Tlaxiaco", volumeRange: 3 });
    assert.equal(describeLotDraft(fields), "Entendí: Café, de 50 a 199 kg, de Tlaxiaco. ¿Es correcto?");
  });

  test("un texto sin datos deja todos los campos vacíos", () => {
    assert.deepEqual(extractLotByRules("Buenos días, ¿cómo está?"), { category: null, variety: null, location: null, volumeRange: null });
    assert.deepEqual(extractLotByRules(""), { category: null, variety: null, location: null, volumeRange: null });
  });

  test("lo que no está claro se deja vacío: dos categorías o dos cantidades", () => {
    const fields = extractLotByRules("tengo miel y café, unos 20 kilos o 3 costales");
    assert.equal(fields.category, null);
    assert.equal(fields.volumeRange, null);
    assert.equal(extractLotByRules("tengo tres de café").volumeRange, null); // falta la unidad
  });

  test("acepta valores de la lista cerrada", () => {
    assert.deepEqual(sanitizeLotDraft({ category: "coffee", variety: "typica", location: "Mixteca Alta", volumeRange: 2 }), {
      category: "coffee",
      variety: "typica",
      location: "Mixteca Alta",
      volumeRange: 2,
    });
  });

  test("descarta valores fuera de la lista cerrada", () => {
    assert.deepEqual(sanitizeLotDraft({ category: "aguacate", variety: "hass", location: "Ciudad de México", volumeRange: 9 }), {
      category: null,
      variety: null,
      location: null,
      volumeRange: null,
    });
    // Una variedad que existe, pero de otra categoría, tampoco pasa.
    assert.equal(sanitizeLotDraft({ category: "honey", variety: "typica" }).variety, null);
  });

  test("nunca devuelve el nombre de una persona, aunque venga en el texto", () => {
    const fields = extractLotByRules("Soy Juana Pérez López, de Tlaxiaco, y traigo 20 kilos de miel");
    assert.deepEqual(Object.keys(fields).sort(), ["category", "location", "variety", "volumeRange"]);
    assert.doesNotMatch(JSON.stringify(fields), /juana|p[eé]rez|l[oó]pez/i);
    assert.equal(fields.category, "honey");
    assert.equal(fields.volumeRange, 2);
  });

  test("con Gemini, la salida del modelo se valida: sin nombres, sin campos extra, sin valores inventados", async () => {
    const fake = new FakeGemini(
      JSON.stringify({ category: "coffee", variety: "geisha", location: "Juana Pérez", volumeRange: 3, producerName: "Juana Pérez", phone: "9531234567" }),
    );
    const { server, base } = await startApp(new GeminiAIProvider(FAKE_KEY, fake));
    try {
      const res = await post(base, "/extract-lot", { text: "Soy Juana Pérez, tengo 3 costales de café" });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.deepEqual(body, { fields: { category: "coffee", variety: null, location: null, volumeRange: 3 }, source: "gemini" });
      assert.doesNotMatch(JSON.stringify(body), /juana|953/i);
    } finally {
      server.close();
    }
  });

  test("la ruta con el proveedor simulado marca source 'simulated'", async () => {
    const { server, base } = await startApp(new SimulatedAIProvider());
    try {
      const res = await post(base, "/extract-lot", { text: "unos tres costales de café de Tlaxiaco" });
      const body = await res.json();
      assert.equal(body.source, "simulated");
      assert.equal(body.fields.category, "coffee");
      const bad = await post(base, "/extract-lot", { text: 123 });
      assert.equal(bad.status, 400);
    } finally {
      server.close();
    }
  });
});

// ─────────────────────────────── 5. AI_PROVIDER=simulated no llama a Google ───────────────────────────────

describe("AI_PROVIDER (#154)", () => {
  test("simulated elige el proveedor simulado aunque haya llave; gemini elige Gemini", () => {
    const silent = { warn: () => {} };
    assert.ok(createAIProvider({ AI_PROVIDER: "simulated", GEMINI_API_KEY: FAKE_KEY }, silent) instanceof SimulatedAIProvider);
    assert.ok(createAIProvider({ AI_PROVIDER: "gemini", GEMINI_API_KEY: FAKE_KEY }, silent) instanceof GeminiAIProvider);
    assert.ok(createAIProvider({ GEMINI_API_KEY: FAKE_KEY }, silent) instanceof GeminiAIProvider);
    assert.ok(createAIProvider({}, silent) instanceof SimulatedAIProvider);
  });

  test("un valor desconocido usa el simulado y avisa sin imprimir la llave", () => {
    const warnings: string[] = [];
    const provider = createAIProvider({ AI_PROVIDER: "openai", GEMINI_API_KEY: FAKE_KEY }, { warn: (m) => warnings.push(m) });
    assert.ok(provider instanceof SimulatedAIProvider);
    assert.equal(warnings.length, 1);
    assert.doesNotMatch(warnings.join(" "), new RegExp(FAKE_KEY));
  });

  test("con AI_PROVIDER=simulated ninguna ruta sale a la red", async () => {
    const provider = createAIProvider({ AI_PROVIDER: "simulated", GEMINI_API_KEY: FAKE_KEY }, { warn: () => {} });
    const { server, base } = await startApp(provider);
    const realFetch = globalThis.fetch;
    const outside: string[] = [];
    globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
      if (url.hostname !== "127.0.0.1") outside.push(url.hostname);
      return realFetch(input, init);
    }) as typeof fetch;
    try {
      await post(base, "/chat", { message: "quiero registrar mi café" });
      await post(base, "/transcribe-audio", AUDIO);
      await post(base, "/analyze-image", IMAGE);
      await post(base, "/extract-lot", { text: "tres costales de café" });
      assert.deepEqual(outside, []);
    } finally {
      globalThis.fetch = realFetch;
      server.close();
    }
  });
});

// ─────────────────────────────── Conversar y fotos ───────────────────────────────

describe("POST /api/chat y /api/analyze-image (#154)", () => {
  test("el chat simulado lleva source 'simulated' y no afirma precios, saldos ni certificaciones", async () => {
    const { server, base } = await startApp(new SimulatedAIProvider());
    try {
      for (const message of ["¿cuánto tengo de saldo?", "quiero registrar pulque", "qué hace esta app", "evaluar mi foto", "hola"]) {
        const res = await post(base, "/chat", { message });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.source, "simulated");
        assert.ok(body.reply.length > 0);
        assert.doesNotMatch(body.reply, /\$\s?\d|certificad|dictamen oficial|aprobad|verificad/i);
      }
    } finally {
      server.close();
    }
  });

  test("con Gemini, los botones con acciones fuera de la lista se descartan", async () => {
    const fake = new FakeGemini(
      JSON.stringify({
        reply: "Con gusto.",
        options: [
          { title: "☕ Registrar café", subtitle: "Paso a paso", action: "registrar_cafe" },
          { title: "💸 Transferir dinero", subtitle: "Ahora", action: "transferir_dinero" },
        ],
      }),
    );
    const { server, base } = await startApp(new GeminiAIProvider(FAKE_KEY, fake));
    try {
      const res = await post(base, "/chat", { message: "café", history: [{ sender: "bot", text: "Hola" }] });
      const body = await res.json();
      assert.equal(body.source, "gemini");
      assert.deepEqual(body.options.map((o: { action: string }) => o.action), ["registrar_cafe"]);
      const contents = fake.calls[0].contents as { role: string }[];
      assert.deepEqual(contents.map((c) => c.role), ["model", "user"]);
    } finally {
      server.close();
    }
  });

  test("si Gemini falla, el chat responde 503 sin respuesta inventada", async () => {
    const fake = new FakeGemini(() => {
      throw new Error("boom");
    });
    const { server, base } = await startApp(new GeminiAIProvider(FAKE_KEY, fake));
    try {
      const res = await post(base, "/chat", { message: "hola" });
      assert.equal(res.status, 503);
      assert.deepEqual(await res.json(), { error: AI_MESSAGES.chatUnavailable, code: "AI_UNAVAILABLE" });
      assert.equal((await post(base, "/chat", {})).status, 400);
    } finally {
      server.close();
    }
  });

  test("la foto con Gemini es una sugerencia: sin calificaciones, humedad ni normas", async () => {
    const fake = new FakeGemini(
      JSON.stringify({ detectedCategory: "coffee", detectedItem: "Granos de café", analysis: "Se ven granos de café.", calidadScore: 99, humedadEstimada: "11.4%" }),
    );
    const { server, base } = await startApp(new GeminiAIProvider(FAKE_KEY, fake));
    try {
      const res = await post(base, "/analyze-image", { ...IMAGE, product: "Café" });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.detectedCategory, "coffee");
      assert.equal(body.calidadScore, undefined);
      assert.equal(body.humedadEstimada, undefined);
      assert.match(body.disclaimer, /no es un dictamen/i);
    } finally {
      server.close();
    }
  });

  test("sin IA, la foto responde 503 y no hay diagnóstico de respaldo", async () => {
    const { server, base } = await startApp(new SimulatedAIProvider());
    try {
      const res = await post(base, "/analyze-image", IMAGE);
      assert.equal(res.status, 503);
      const body = await res.json();
      assert.deepEqual(Object.keys(body).sort(), ["code", "error"]);
    } finally {
      server.close();
    }
  });
});

// ─────────────────────────────── Secretos y logs ───────────────────────────────

describe("Secretos (#154)", () => {
  test("si el proveedor falla con la llave en su mensaje, no aparece en la respuesta ni en los logs", async () => {
    const fake = new FakeGemini(() => {
      throw new Error(`API key not valid: ${FAKE_KEY}`);
    });
    const { logger, lines } = recordingLogger();
    const { server, base } = await startApp(new GeminiAIProvider(FAKE_KEY, fake), logger);
    try {
      const res = await post(base, "/transcribe-audio", AUDIO);
      const text = await res.text();
      assert.equal(res.status, 503);
      assert.doesNotMatch(text, new RegExp(FAKE_KEY));
      assert.ok(lines.length > 0);
      assert.doesNotMatch(lines.join("\n"), new RegExp(FAKE_KEY));
    } finally {
      server.close();
    }
  });

  test("un error inesperado responde 500 sin su mensaje", async () => {
    const broken: AIProvider = Object.assign(new SimulatedAIProvider(), {
      chat: async () => {
        throw new TypeError(`fallo con ${FAKE_KEY}`);
      },
    });
    const { logger, lines } = recordingLogger();
    const { server, base } = await startApp(broken, logger);
    try {
      const res = await post(base, "/chat", { message: "hola" });
      assert.equal(res.status, 500);
      assert.deepEqual(await res.json(), { error: AI_MESSAGES.unexpected });
      assert.doesNotMatch(lines.join("\n"), new RegExp(FAKE_KEY));
    } finally {
      server.close();
    }
  });

  test("AIError nunca lleva texto del proveedor", () => {
    assert.equal(new AIError("unavailable").message, "AIError: unavailable");
  });
});

// ─────────────────────────────── Puerto del teléfono ───────────────────────────────

describe("AssistantPort (#154)", () => {
  test("HttpAssistant pasa el mensaje honesto del servidor", async () => {
    const fakeFetch = async () =>
      new Response(JSON.stringify({ error: AI_MESSAGES.notUnderstood, code: "NOT_UNDERSTOOD" }), { status: 422 });
    const result = await new HttpAssistant("", fakeFetch).transcribe("AAAA", "audio/webm");
    assert.deepEqual(result, { ok: false, error: AI_MESSAGES.notUnderstood, code: "NOT_UNDERSTOOD" });
  });

  test("HttpAssistant sin red devuelve ok: false, nunca una respuesta inventada", async () => {
    const offline = async (): Promise<Response> => {
      throw new TypeError("Failed to fetch");
    };
    const result = await new HttpAssistant("", offline).chat("hola");
    assert.equal(result.ok, false);
    assert.equal(result.code, "NETWORK");
  });

  test("HttpAssistant con éxito devuelve los datos y su source", async () => {
    let sent: { url: string; body: unknown } | null = null;
    const fakeFetch = async (url: string, init?: RequestInit) => {
      sent = { url, body: JSON.parse(String(init?.body)) };
      return new Response(JSON.stringify(simulatedChatReply("hola")), { status: 200 });
    };
    const result = await new HttpAssistant("", fakeFetch).chat("hola", [{ role: "assistant", text: "Buenas" }]);
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.source, "simulated");
    assert.deepEqual(sent, { url: "/api/chat", body: { message: "hola", history: [{ sender: "bot", text: "Buenas" }] } });
  });

  test("SimulatedAssistant no transcribe ni revisa fotos, y lo dice", async () => {
    const sim = new SimulatedAssistant();
    const audio = await sim.transcribe();
    const image = await sim.analyzeImage();
    assert.equal(audio.ok, false);
    assert.equal(image.ok, false);
    const lot = await sim.extractLot("tres costales de café de Tlaxiaco");
    assert.equal(lot.ok && lot.source, "simulated");
  });
});

// ─────────────────────────────── 6 y 7. Búsqueda en el código ───────────────────────────────

const ROOT = process.cwd();

function listFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("Búsqueda en el código (#154)", () => {
  let files: string[] = [];
  before(() => {
    files = [path.join(ROOT, "server.ts"), ...listFiles(path.join(ROOT, "src")).filter((f) => !f.includes(`${path.sep}tests${path.sep}`))];
  });
  after(() => {
    files = [];
  });

  test("no quedan las frases inventadas", () => {
    const forbidden = [
      /reporte de voz verificado/i,
      /verified voice report/i,
      /aprobaci[oó]n comun(al|itaria)/i,
      /community approval/i,
      /pesaje certificado/i,
      /certified weighing/i,
    ];
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      for (const phrase of forbidden) {
        assert.doesNotMatch(text, phrase, `${path.relative(ROOT, file)} contiene ${phrase}`);
      }
    }
  });

  test("ninguna pantalla llama a las rutas de IA: solo el puerto", () => {
    const routes = /\/api\/(chat|transcribe-audio|analyze-image|extract-lot)\b/;
    const outsidePort = files.filter((f) => !f.includes(`${path.sep}server${path.sep}`) && !f.endsWith("server.ts"));
    for (const file of outsidePort) {
      assert.doesNotMatch(fs.readFileSync(file, "utf8"), routes, `${path.relative(ROOT, file)} llama a una ruta de IA`);
    }
    assert.ok(outsidePort.some((f) => f.endsWith(path.join("core", "ai", "HttpAssistant.ts"))));
  });
});
