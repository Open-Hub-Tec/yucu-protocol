/**
 * Puerto de IA del teléfono (#154; ADR-006, D2; regla 4 de AGENTS.md).
 *
 * Las pantallas SOLO hablan con la IA a través de este puerto: ningún componente llama a las
 * rutas de IA del servidor (chat, transcribir, revisar foto, extraer lote) ni a un proveedor de IA.
 *
 * Ningún método lanza errores: si la IA no está, falla o no entendió, devuelve `ok: false` con un
 * mensaje que se puede mostrar tal cual. Nunca hay una respuesta inventada para "rellenar".
 *
 * Implementaciones:
 *  - HttpAssistant: habla con el servidor, que elige el proveedor (AI_PROVIDER).
 *  - SimulatedAssistant: sin red, para pruebas y demostración. Todo lleva source 'simulated'.
 */
import type { ChatMessage, ChatReply, ImageAnalysis, LotExtraction, Transcription } from './types';

export interface AssistantFailure {
  ok: false;
  /** Frase corta para la persona (p. ej. "No te escuché bien. ¿Lo intentamos otra vez o lo escribes?"). */
  error: string;
  /** Código para que la app decida qué hacer: NOT_UNDERSTOOD, AI_NOT_CONFIGURED, AI_UNAVAILABLE, NETWORK… */
  code?: string;
}

export type AssistantResult<T> = ({ ok: true; error?: undefined; code?: undefined } & T) | AssistantFailure;

export interface AssistantPort {
  /** Conversar. `history`: mensajes anteriores (se mandan los últimos 6). */
  chat(message: string, history?: ChatMessage[]): Promise<AssistantResult<ChatReply>>;
  /** Transcribir un audio. El audio no se guarda. */
  transcribe(audioBase64: string, mimeType: string): Promise<AssistantResult<Transcription>>;
  /** Describir la foto de un producto. Es una sugerencia, nunca un dictamen. */
  analyzeImage(imageBase64: string, mimeType: string, product?: string): Promise<AssistantResult<ImageAnalysis>>;
  /** Llenar el borrador del lote con lo que se entendió del texto. */
  extractLot(text: string): Promise<AssistantResult<LotExtraction>>;
}

export const ASSISTANT_OFFLINE_MESSAGE = 'No hay conexión con el asistente. Revise su señal e intente de nuevo.';
