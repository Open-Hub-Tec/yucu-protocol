/**
 * Proveedor SIMULADO de IA (#154). No llama a ningún servicio externo.
 *
 * - Conversar: respuestas de demostración que solo orientan a flujos que existen (`simulatedChatReply`).
 * - Extraer el lote: por palabras de las listas cerradas (`extractLotByRules`).
 * - Transcribir y ver fotos: no se pueden simular con honestidad, así que fallan con `not_configured`.
 *   Nunca se devuelve una transcripción ni un diagnóstico inventados.
 * Todo lo que devuelve lleva source 'simulated'.
 */
import { extractLotByRules } from "../../core/ai/lotFields";
import { simulatedChatReply } from "../../core/ai/simulatedChat";
import type { ChatMessage, ChatReply, ImageAnalysis, LotExtraction, Transcription } from "../../core/ai/types";
import { AIError, type AIProvider } from "./ports";

export class SimulatedAIProvider implements AIProvider {
  readonly source = "simulated" as const;

  async transcribe(): Promise<Transcription> {
    throw new AIError("not_configured");
  }

  async analyzeImage(): Promise<ImageAnalysis> {
    throw new AIError("not_configured");
  }

  async extractLot(texto: string): Promise<LotExtraction> {
    return { fields: extractLotByRules(texto), source: "simulated" };
  }

  async chat(mensajes: ChatMessage[]): Promise<ChatReply> {
    const last = [...mensajes].reverse().find((m) => m.role === "user");
    return simulatedChatReply(last?.text ?? "");
  }
}
