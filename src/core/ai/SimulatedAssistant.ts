/**
 * `AssistantPort` de DEMOSTRACIÓN: no usa red. Todo lo que devuelve lleva source 'simulated'.
 * No transcribe ni describe fotos: eso no se puede simular con honestidad, así que lo dice.
 */
import type { AssistantPort, AssistantResult } from './AssistantPort';
import { extractLotByRules } from './lotFields';
import { simulatedChatReply } from './simulatedChat';
import type { ChatReply, ImageAnalysis, LotExtraction, Transcription } from './types';

export const SIMULATED_TRANSCRIBE_MESSAGE = 'En la demostración no puedo escuchar audios. ¿Me lo escribe, por favor?';
export const SIMULATED_IMAGE_MESSAGE = 'En la demostración no puedo revisar fotos. Puede seguir sin la revisión.';

export class SimulatedAssistant implements AssistantPort {
  async chat(message: string): Promise<AssistantResult<ChatReply>> {
    return { ok: true, ...simulatedChatReply(message) };
  }

  async transcribe(): Promise<AssistantResult<Transcription>> {
    return { ok: false, error: SIMULATED_TRANSCRIBE_MESSAGE, code: 'AI_NOT_CONFIGURED' };
  }

  async analyzeImage(): Promise<AssistantResult<ImageAnalysis>> {
    return { ok: false, error: SIMULATED_IMAGE_MESSAGE, code: 'AI_NOT_CONFIGURED' };
  }

  async extractLot(text: string): Promise<AssistantResult<LotExtraction>> {
    return { ok: true, fields: extractLotByRules(text), source: 'simulated' };
  }
}
