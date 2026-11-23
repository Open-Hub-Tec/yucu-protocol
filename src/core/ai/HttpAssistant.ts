/**
 * `AssistantPort` que habla con el servidor (src/server/routes/ai.ts). Es el ÚNICO lugar del
 * teléfono que llama a las rutas de IA.
 */
import { ASSISTANT_OFFLINE_MESSAGE, type AssistantPort, type AssistantResult } from './AssistantPort';
import type { ChatMessage, ChatReply, ImageAnalysis, LotExtraction, Transcription } from './types';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class HttpAssistant implements AssistantPort {
  constructor(
    private readonly baseUrl = '',
    private readonly fetchImpl: FetchLike = (input, init) => fetch(input, init),
  ) {}

  private async post<T>(path: string, body: unknown): Promise<AssistantResult<T>> {
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}/api${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      return { ok: false, error: ASSISTANT_OFFLINE_MESSAGE, code: 'NETWORK' };
    }
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    const obj = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
    if (!res.ok) {
      return {
        ok: false,
        error: typeof obj.error === 'string' ? obj.error : 'El asistente no está disponible ahorita.',
        code: typeof obj.code === 'string' ? obj.code : undefined,
      };
    }
    return { ok: true, ...(obj as T) };
  }

  chat(message: string, history: ChatMessage[] = []): Promise<AssistantResult<ChatReply>> {
    return this.post<ChatReply>('/chat', {
      message,
      history: history.slice(-6).map((m) => ({ sender: m.role === 'assistant' ? 'bot' : 'user', text: m.text })),
    });
  }

  transcribe(audioBase64: string, mimeType: string): Promise<AssistantResult<Transcription>> {
    return this.post<Transcription>('/transcribe-audio', { audioBase64, mimeType });
  }

  analyzeImage(imageBase64: string, mimeType: string, product?: string): Promise<AssistantResult<ImageAnalysis>> {
    return this.post<ImageAnalysis>('/analyze-image', { imageBase64, mimeType, product });
  }

  extractLot(text: string): Promise<AssistantResult<LotExtraction>> {
    return this.post<LotExtraction>('/extract-lot', { text });
  }
}
