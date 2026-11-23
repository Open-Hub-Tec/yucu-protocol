/**
 * Adaptador de Gemini para los puertos de IA (#154).
 *
 * La llave (`GEMINI_API_KEY`) llega por el constructor desde `.env` y nunca se imprime ni se devuelve.
 * Privacidad (ADR-006, D1): con el nivel gratuito de AI Studio, solo datos inventados.
 */
import { GoogleGenAI, Type, type GenerateContentParameters } from "@google/genai";
import { LOT_CATEGORIES, LOT_FIELD_RULES, sanitizeLotDraft, normalizeText } from "../../core/ai/lotFields";
import {
  CHAT_ACTIONS,
  IMAGE_DISCLAIMER,
  sanitizeChatOptions,
  type ChatMessage,
  type ChatReply,
  type ImageAnalysis,
  type LotExtraction,
  type Transcription,
} from "../../core/ai/types";
import { AIError, type AIProvider, type MediaInput } from "./ports";

export const GEMINI_MODEL = "gemini-3.8-flash";

/** Lo único que el adaptador necesita del SDK. En las pruebas se cambia por uno falso. */
export interface GenerateContentClient {
  generateContent(params: GenerateContentParameters): Promise<{ text?: string }>;
}

const NOT_UNDERSTOOD = "[NO_ENTENDI]";

export const CHAT_SYSTEM_INSTRUCTION = `
Eres el asistente de Yucu, un prototipo de aplicación para que productoras y artesanas de la Mixteca (Oaxaca) registren sus lotes.
Hablas con personas mayores y de campo: frases cortas, trato de "usted", sin tecnicismos. Entiende errores de escritura sin corregirlos.

Lo que la aplicación hace hoy (no digas nada más):
- Registrar un lote: la persona dice o escribe los datos, la app se los lee y ella confirma y firma.
- Tomar foto al producto: la IA puede decir lo que ve como sugerencia. No es un dictamen ni una certificación.
- Ver la pantalla de pagos.

Reglas que no se rompen:
- No inventes precios, saldos, pagos, cifras, certificaciones, dictámenes, normas cumplidas, aprobaciones, laboratorios, pesajes, horarios, instalaciones ni servicios de transporte.
- No digas que algo está verificado, registrado o certificado. Tú solo orientas; la persona decide y firma.
- Si no sabes algo, dilo con honestidad y ofrece un botón.
- Si el tema no tiene que ver con la aplicación o con sus productos, discúlpate y ofrece registrar un lote.
- No pidas ni repitas nombres, teléfonos ni domicilios.

Salida: "reply" (texto) y "options" (0 a 3 botones). Cada botón: title con emoji, subtitle de 3 a 5 palabras, icon y una "action" de esta lista: ${CHAT_ACTIONS.join(", ")}.
`;

function lotExtractionInstruction(): string {
  const categories = LOT_CATEGORIES.map(
    (c) => `- ${c.code} (${c.label}); variedades: ${c.varieties.map((v) => `${v.code} (${v.label})`).join(", ")}`,
  ).join("\n");
  return `
Extrae los datos de un lote del texto de una productora. Devuelve SOLO estos campos:
- category: uno de estos códigos, o null:
${categories}
- variety: un código de variedad de esa categoría, o null.
- location: uno de estos municipios o regiones, escrito igual, o null: ${LOT_FIELD_RULES.location.join("; ")}.
- volumeRange: 1 (menos de 10 kg), 2 (10 a 49 kg), 3 (50 a 199 kg), 4 (200 a 999 kg), 5 (1000 kg o más), o null. Un costal o bulto es de unos 50 kg.

Si un dato no está claro, usa null; no lo adivines. Nunca devuelvas nombres de personas, teléfonos, comunidades exactas, domicilios ni montos.
`;
}

const IMAGE_PROMPT = `
Mira la foto de un producto del campo o de una artesanía de la Mixteca y describe con honestidad solo lo que se ve.
- detectedCategory: uno de ${LOT_FIELD_RULES.category.join(", ")}, o null si no es ninguno o no estás seguro.
- detectedItem: qué producto se ve, en pocas palabras, o null.
- analysis: 2 o 3 frases cortas, con trato de "usted", sobre lo visible.
No des calificaciones, porcentajes de humedad, normas cumplidas, dictámenes, aprobaciones, precios ni certificaciones: desde una foto no se pueden saber.
Si en la foto aparece una persona, no la describas.
`;

export class GeminiAIProvider implements AIProvider {
  readonly source = "gemini" as const;
  private client: GenerateContentClient | null;
  private readonly apiKey: string | undefined;

  /**
   * @param apiKey `GEMINI_API_KEY`. Si falta, cada trabajo falla con `not_configured`.
   * @param client Cliente a usar en lugar del SDK (para pruebas sin red).
   */
  constructor(apiKey: string | undefined, client?: GenerateContentClient) {
    this.apiKey = apiKey && apiKey.trim() ? apiKey : undefined;
    this.client = client ?? null;
  }

  private getClient(): GenerateContentClient {
    if (this.client) return this.client;
    if (!this.apiKey) throw new AIError("not_configured");
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    this.client = { generateContent: (params) => ai.models.generateContent(params) };
    return this.client;
  }

  /** Llama al modelo. Cualquier falla del proveedor se convierte en `unavailable`, sin su mensaje. */
  private async generate(params: Omit<GenerateContentParameters, "model">): Promise<string> {
    const client = this.getClient();
    let text: string | undefined;
    try {
      const response = await client.generateContent({ model: GEMINI_MODEL, ...params });
      text = response.text;
    } catch {
      throw new AIError("unavailable");
    }
    return (text ?? "").trim();
  }

  private async generateJson(params: Omit<GenerateContentParameters, "model">): Promise<Record<string, unknown>> {
    const text = await this.generate(params);
    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      // Se trata abajo como respuesta inútil.
    }
    throw new AIError("unavailable");
  }

  async transcribe(audio: MediaInput): Promise<Transcription> {
    const text = await this.generate({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Transcribe fielmente el audio en español. Conserva las palabras en Tu'un Savi tal como se oyen. Responde solo con el texto transcrito, sin comillas ni explicaciones. Si no se entiende o no hay voz, responde exactamente ${NOT_UNDERSTOOD}.`,
            },
            { inlineData: { data: audio.base64, mimeType: audio.mimeType } },
          ],
        },
      ],
      config: { temperature: 0 },
    });
    if (!text || text.includes(NOT_UNDERSTOOD)) throw new AIError("not_understood");
    return { transcript: text, language: null, source: "gemini" };
  }

  async extractLot(texto: string): Promise<LotExtraction> {
    if (!normalizeText(texto)) return { fields: sanitizeLotDraft(null), source: "gemini" };
    const parsed = await this.generateJson({
      contents: [{ role: "user", parts: [{ text: texto }] }],
      config: {
        systemInstruction: lotExtractionInstruction(),
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, nullable: true, enum: [...LOT_FIELD_RULES.category] },
            variety: { type: Type.STRING, nullable: true },
            location: { type: Type.STRING, nullable: true, enum: [...LOT_FIELD_RULES.location] },
            volumeRange: { type: Type.INTEGER, nullable: true },
          },
        },
      },
    });
    // La salida del modelo no es de confianza: se valida contra las listas cerradas.
    return { fields: sanitizeLotDraft(parsed), source: "gemini" };
  }

  async chat(mensajes: ChatMessage[]): Promise<ChatReply> {
    const parsed = await this.generateJson({
      contents: mensajes.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.text }] })),
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  action: { type: Type.STRING, enum: [...CHAT_ACTIONS] },
                },
                required: ["title", "action"],
              },
            },
          },
          required: ["reply"],
        },
      },
    });
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    if (!reply) throw new AIError("unavailable");
    return { reply, options: sanitizeChatOptions(parsed.options), source: "gemini" };
  }

  async analyzeImage(image: MediaInput, context?: string): Promise<ImageAnalysis> {
    const parsed = await this.generateJson({
      contents: [
        {
          role: "user",
          parts: [
            { text: context ? `${IMAGE_PROMPT}\nProducto que la persona dice registrar: ${context.slice(0, 80)}` : IMAGE_PROMPT },
            { inlineData: { data: image.base64, mimeType: image.mimeType } },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedCategory: { type: Type.STRING, nullable: true, enum: [...LOT_FIELD_RULES.category] },
            detectedItem: { type: Type.STRING, nullable: true },
            analysis: { type: Type.STRING },
          },
          required: ["analysis"],
        },
      },
    });
    const analysis = typeof parsed.analysis === "string" ? parsed.analysis.trim() : "";
    if (!analysis) throw new AIError("unavailable");
    return {
      detectedCategory: sanitizeLotDraft({ category: parsed.detectedCategory }).category,
      detectedItem: typeof parsed.detectedItem === "string" && parsed.detectedItem.trim() ? parsed.detectedItem.trim().slice(0, 80) : null,
      analysis,
      disclaimer: IMAGE_DISCLAIMER,
      source: "gemini",
    };
  }
}
