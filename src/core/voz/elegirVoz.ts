// Elegir la voz para leer en voz alta (FRONTEND.md, sección 5: "Escuchar").
// Funciones puras, sin pantalla, para poder probarlas con `npm test`.

/** Lo mínimo que usamos de una voz de `speechSynthesis` (`SpeechSynthesisVoice`). */
export interface VozDisponible {
  lang: string;
  name: string;
}

/** Lo mínimo que usamos de `window.speechSynthesis`. */
export interface SintetizadorVoz {
  getVoices: () => readonly VozDisponible[];
}

/** Un poco más lento que lo normal (1), para personas mayores. */
export const VELOCIDAD_LECTURA = 0.85;

/** Idioma que se pide a la voz cuando hay español de México. */
export const IDIOMA_LECTURA = 'es-MX';

// Primero español de México; después variantes latinoamericanas; al final cualquier español.
const PREFERENCIAS = ['es-mx', 'es-419', 'es-us'];

function normalizar(lang: string): string {
  return lang.trim().replace('_', '-').toLowerCase();
}

/**
 * Devuelve la mejor voz en español, o `null` si el teléfono no tiene ninguna.
 * Nunca lanza error: una lista vacía o rara también da `null`.
 */
export function elegirVoz<T extends VozDisponible>(voces: readonly T[] | null | undefined): T | null {
  if (!voces || voces.length === 0) return null;

  for (const preferida of PREFERENCIAS) {
    const voz = voces.find((v) => typeof v?.lang === 'string' && normalizar(v.lang) === preferida);
    if (voz) return voz;
  }

  const cualquierEspanol = voces.find((v) => {
    if (typeof v?.lang !== 'string') return false;
    const lang = normalizar(v.lang);
    return lang === 'es' || lang.startsWith('es-');
  });
  return cualquierEspanol ?? null;
}

export type PlanLectura<T extends VozDisponible = VozDisponible> =
  | { modo: 'voz'; voz: T; idioma: string; velocidad: number }
  | { modo: 'texto'; motivo: 'sin-sintesis' | 'sin-voz-espanol' };

/**
 * Decide cómo leer un texto: con voz en español, o mostrando el texto en letra muy grande.
 * Si no hay `speechSynthesis` o falla al pedir las voces, no lanza error: devuelve el modo texto.
 */
export function planearLectura<T extends VozDisponible>(
  sintetizador: { getVoices: () => readonly T[] } | null | undefined,
): PlanLectura<T> {
  if (!sintetizador || typeof sintetizador.getVoices !== 'function') {
    return { modo: 'texto', motivo: 'sin-sintesis' };
  }

  let voces: readonly T[] = [];
  try {
    voces = sintetizador.getVoices() ?? [];
  } catch {
    return { modo: 'texto', motivo: 'sin-sintesis' };
  }

  const voz = elegirVoz(voces);
  if (!voz) return { modo: 'texto', motivo: 'sin-voz-espanol' };

  return {
    modo: 'voz',
    voz,
    // Si la voz es es-MX se usa tal cual; si es otra variante de español, se respeta su idioma.
    idioma: normalizar(voz.lang) === 'es-mx' ? IDIOMA_LECTURA : voz.lang,
    velocidad: VELOCIDAD_LECTURA,
  };
}
