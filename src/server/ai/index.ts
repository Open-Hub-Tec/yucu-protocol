/**
 * Elige el proveedor de IA con `AI_PROVIDER` (`gemini` o `simulated`). Ver SERVIDOR.md, sección 6.
 *
 * - `simulated`: nunca llama a Google, aunque exista `GEMINI_API_KEY`.
 * - `gemini`: usa `GEMINI_API_KEY`; si falta, cada ruta responde 503 con un mensaje claro.
 * - Sin valor: `gemini` si hay llave, si no `simulated`.
 * - Otro valor: `simulated`, con un aviso.
 * Nunca se imprime la llave.
 */
import { GeminiAIProvider } from "./GeminiAIProvider";
import { SimulatedAIProvider } from "./SimulatedAIProvider";
import type { AIProvider } from "./ports";

export * from "./ports";
export { GeminiAIProvider } from "./GeminiAIProvider";
export { SimulatedAIProvider } from "./SimulatedAIProvider";

export interface AILogger {
  warn(message: string): void;
}

type AIEnv = { AI_PROVIDER?: string; GEMINI_API_KEY?: string };

export function createAIProvider(env: AIEnv = process.env, logger: AILogger = console): AIProvider {
  const wanted = (env.AI_PROVIDER ?? "").trim().toLowerCase();
  const hasKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim());

  if (wanted === "simulated") return new SimulatedAIProvider();
  if (wanted === "gemini") {
    if (!hasKey) logger.warn("AI_PROVIDER=gemini pero falta GEMINI_API_KEY: las rutas de IA responderán 503.");
    return new GeminiAIProvider(env.GEMINI_API_KEY);
  }
  if (wanted) {
    logger.warn("AI_PROVIDER no es 'gemini' ni 'simulated': se usa el proveedor simulado.");
    return new SimulatedAIProvider();
  }
  return hasKey ? new GeminiAIProvider(env.GEMINI_API_KEY) : new SimulatedAIProvider();
}
