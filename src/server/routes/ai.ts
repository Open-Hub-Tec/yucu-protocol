import { Router, Request, Response } from "express";
import type { ChatMessage } from "../../core/ai/types";
import { AIError, createAIProvider, type AIProvider, type MediaInput } from "../ai";
import { sendError } from "../errors";

// Rutas de IA (/api/chat, /api/analyze-image, /api/transcribe-audio, /api/extract-lot). #154.
// Usan solo los puertos de src/server/ai; el proveedor se elige con AI_PROVIDER.
// Ver docs/arquitectura/SERVIDOR.md, secciones 2, 4 y 6.

export interface AIRoutesLogger {
  warn(message: string): void;
  error(message: string): void;
}

export interface AIRoutesOptions {
  /** Proveedor a usar. Si no se da, se elige con `createAIProvider()` en la primera petición. */
  provider?: AIProvider;
  logger?: AIRoutesLogger;
}

/** Mensajes que se muestran tal cual a la persona (ADR-006, D4). */
export const AI_MESSAGES = {
  notUnderstood: "No te escuché bien. ¿Lo intentamos otra vez o lo escribes?",
  transcribeUnavailable: "Ahora no puedo escuchar audios. ¿Lo intentamos más tarde o lo escribes?",
  chatUnavailable: "El asistente no está disponible ahorita. Puede usar los botones del menú.",
  imageUnavailable: "Ahora no puedo revisar la foto. Puede seguir sin la revisión.",
  extractUnavailable: "No pude leer los datos del lote. Puede llenarlos con el dedo.",
  unexpected: "Algo salió mal. Intente de nuevo.",
} as const;

const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY = 6;

/** Quita el prefijo `data:...;base64,` y los parámetros del tipo (`;codecs=opus`). */
function toMedia(base64: unknown, mimeType: unknown, fallbackMime: string, kind: "audio" | "image"): MediaInput | null {
  if (typeof base64 !== "string" || !base64.trim()) return null;
  const data = base64.includes(",") ? base64.slice(base64.indexOf(",") + 1) : base64;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(data)) return null;
  const mime = typeof mimeType === "string" ? mimeType.split(";")[0].trim().toLowerCase() : "";
  return { base64: data, mimeType: mime.startsWith(`${kind}/`) ? mime : fallbackMime };
}

function toHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];
  const messages: ChatMessage[] = [];
  for (const h of history.slice(-MAX_HISTORY)) {
    if (!h || typeof h !== "object") continue;
    const { sender, text } = h as { sender?: unknown; text?: unknown };
    if (typeof text !== "string" || !text.trim()) continue;
    if (sender === "user") messages.push({ role: "user", text: text.slice(0, MAX_MESSAGE_CHARS) });
    else if (sender === "bot") messages.push({ role: "assistant", text: text.slice(0, MAX_MESSAGE_CHARS) });
  }
  return messages;
}

export function createAIRoutes(options: AIRoutesOptions = {}): Router {
  const router = Router();
  const logger: AIRoutesLogger = options.logger ?? console;
  let provider = options.provider ?? null;
  const getProvider = () => (provider ??= createAIProvider(process.env, logger));

  /** Convierte una falla en una respuesta honesta. Nunca registra ni devuelve el mensaje del proveedor. */
  function fail(res: Response, route: string, err: unknown, unavailableMessage: string) {
    if (err instanceof AIError) {
      logger.warn(`IA ${route}: ${err.kind}`);
      if (err.kind === "not_understood") return sendError(res, 422, AI_MESSAGES.notUnderstood, "NOT_UNDERSTOOD");
      if (err.kind === "not_configured") return sendError(res, 503, unavailableMessage, "AI_NOT_CONFIGURED");
      return sendError(res, 503, unavailableMessage, "AI_UNAVAILABLE");
    }
    logger.error(`IA ${route}: error inesperado (${err instanceof Error ? err.name : typeof err})`);
    return sendError(res, 500, AI_MESSAGES.unexpected);
  }

  router.post("/chat", async (req: Request, res: Response) => {
    const { message, history } = req.body ?? {};
    if (typeof message !== "string" || !message.trim()) {
      return sendError(res, 400, "Escriba un mensaje.", "INVALID_MESSAGE");
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return sendError(res, 400, "El mensaje es muy largo.", "MESSAGE_TOO_LONG");
    }
    try {
      const reply = await getProvider().chat([...toHistory(history), { role: "user", text: message }]);
      return res.json(reply);
    } catch (err) {
      return fail(res, "chat", err, AI_MESSAGES.chatUnavailable);
    }
  });

  router.post("/transcribe-audio", async (req: Request, res: Response) => {
    const { audioBase64, mimeType } = req.body ?? {};
    const audio = toMedia(audioBase64, mimeType, "audio/webm", "audio");
    if (!audio) return sendError(res, 400, "No llegó el audio.", "INVALID_AUDIO");
    try {
      // El audio no se guarda: se transcribe y se descarta (ADR-006, D5).
      return res.json(await getProvider().transcribe(audio));
    } catch (err) {
      return fail(res, "transcribe-audio", err, AI_MESSAGES.transcribeUnavailable);
    }
  });

  router.post("/analyze-image", async (req: Request, res: Response) => {
    const { imageBase64, mimeType, product } = req.body ?? {};
    const image = toMedia(imageBase64, mimeType, "image/jpeg", "image");
    if (!image) return sendError(res, 400, "No llegó la foto.", "INVALID_IMAGE");
    try {
      return res.json(await getProvider().analyzeImage(image, typeof product === "string" ? product : undefined));
    } catch (err) {
      return fail(res, "analyze-image", err, AI_MESSAGES.imageUnavailable);
    }
  });

  router.post("/extract-lot", async (req: Request, res: Response) => {
    const { text } = req.body ?? {};
    if (typeof text !== "string") return sendError(res, 400, "No llegó el texto.", "INVALID_TEXT");
    if (text.length > MAX_MESSAGE_CHARS) return sendError(res, 400, "El texto es muy largo.", "TEXT_TOO_LONG");
    try {
      return res.json(await getProvider().extractLot(text));
    } catch (err) {
      return fail(res, "extract-lot", err, AI_MESSAGES.extractUnavailable);
    }
  });

  return router;
}

export const aiRoutes = createAIRoutes();
