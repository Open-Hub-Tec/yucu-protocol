/**
 * Puertos de IA del servidor (#154; ADR-006, D2). Cada trabajo es una interfaz y cada proveedor
 * es un adaptador; cambiar de proveedor no toca las rutas ni las pantallas.
 *
 * Reglas para cualquier adaptador:
 *  - Nunca inventa: si no está configurado, falla o no entendió, lanza `AIError`.
 *  - `extractLot` devuelve solo los campos de `RegisterLotRequest` de las listas cerradas
 *    (`sanitizeLotDraft`), nunca nombres de personas.
 *  - El audio y las fotos no se guardan: se procesan y se descartan.
 *  - Lo que no viene de un proveedor real lleva source 'simulated'.
 */
import type { ChatMessage, ChatReply, ImageAnalysis, LotExtraction, Transcription, AISource } from "../../core/ai/types";

export interface MediaInput {
  /** Contenido en base64, sin el prefijo `data:...;base64,`. */
  base64: string;
  mimeType: string;
}

/** Transcribir: audio → texto y su idioma, o un error. */
export interface Transcriber {
  transcribe(audio: MediaInput): Promise<Transcription>;
}

/** Extraer el lote: texto → solo los campos permitidos. Más adelante recibirá el manifiesto (ADR-007). */
export interface LotExtractor {
  extractLot(texto: string): Promise<LotExtraction>;
}

/** Conversar: mensajes → respuesta del asistente. */
export interface ChatAssistant {
  chat(mensajes: ChatMessage[]): Promise<ChatReply>;
}

/** Describir una foto del producto. Es una sugerencia, nunca un dictamen. El consentimiento lo agrega #107. */
export interface ImageAnalyzer {
  analyzeImage(image: MediaInput, context?: string): Promise<ImageAnalysis>;
}

export interface AIProvider extends Transcriber, LotExtractor, ChatAssistant, ImageAnalyzer {
  readonly source: AISource;
}

/**
 * - `not_configured`: falta la llave o el proveedor no hace ese trabajo (503).
 * - `unavailable`: el proveedor falló o respondió algo que no sirve (503).
 * - `not_understood`: el proveedor respondió, pero no se entendió nada (422).
 */
export type AIErrorKind = "not_configured" | "unavailable" | "not_understood";

export class AIError extends Error {
  readonly kind: AIErrorKind;
  constructor(kind: AIErrorKind) {
    // El mensaje es fijo a propósito: nunca lleva texto del proveedor ni datos de la petición.
    super(`AIError: ${kind}`);
    this.name = "AIError";
    this.kind = kind;
  }
}
