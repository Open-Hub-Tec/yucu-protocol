/**
 * Tipos de los trabajos de IA (ADR-006, D2; #154). Los usan el servidor (adaptadores por proveedor)
 * y el teléfono (`AssistantPort`). No dependen de ningún proveedor.
 */
import type { LotDraft } from './lotFields';

/** De dónde viene la respuesta. Si es 'simulated', la UI muestra <DemoBadge />. */
export type AISource = 'gemini' | 'simulated';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

/** Acciones que un botón del chat puede abrir. Lista cerrada: la IA no puede inventar otras. */
export const CHAT_ACTIONS = [
  'registrar_lote',
  'registrar_cafe',
  'registrar_pulque',
  'registrar_miel',
  'registrar_maiz',
  'registrar_sombrero',
  'registrar_textil',
  'evaluar_foto',
  'ver_pagos',
  'consulta',
] as const;

export type ChatAction = (typeof CHAT_ACTIONS)[number];

export interface ChatOption {
  id: number;
  title: string;
  subtitle: string;
  icon?: string;
  action?: ChatAction;
}

export interface ChatReply {
  reply: string;
  options: ChatOption[];
  source: AISource;
}

export interface Transcription {
  transcript: string;
  /** Código del idioma si el proveedor lo dice; si no, null. */
  language: string | null;
  source: AISource;
}

export interface LotExtraction {
  fields: LotDraft;
  source: AISource;
}

/**
 * Lo que la IA ve en una foto. Es una SUGERENCIA, nunca un dictamen ni una certificación (ADR-007, D3).
 * Lo que no se pudo estimar va en null; no se rellena con valores fijos.
 */
export interface ImageAnalysis {
  /** Código de `LOT_CATEGORIES` si coincide con la lista; si no, null. */
  detectedCategory: string | null;
  /** Qué se ve en la foto, en palabras sencillas. */
  detectedItem: string | null;
  /** Observaciones de lo visible, en frases cortas. */
  analysis: string;
  disclaimer: string;
  source: AISource;
}

export const IMAGE_DISCLAIMER =
  'Sugerencia de la IA a partir de una foto. No es un dictamen, ni una certificación, ni una prueba de laboratorio.';

/** Normaliza y recorta los botones que devuelva un proveedor: solo acciones de la lista cerrada. */
export function sanitizeChatOptions(raw: unknown): ChatOption[] {
  if (!Array.isArray(raw)) return [];
  const options: ChatOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    if (typeof o.title !== 'string' || !o.title.trim()) continue;
    const action = (CHAT_ACTIONS as readonly string[]).includes(o.action as string) ? (o.action as ChatAction) : undefined;
    if (!action) continue;
    options.push({
      id: options.length + 1,
      title: o.title.trim().slice(0, 60),
      subtitle: typeof o.subtitle === 'string' ? o.subtitle.trim().slice(0, 60) : '',
      icon: typeof o.icon === 'string' ? o.icon.slice(0, 40) : undefined,
      action,
    });
    if (options.length === 3) break;
  }
  return options;
}
