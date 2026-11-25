// #121: para medir interés solo se guarda si la persona aceptó que la contacten (sí/no).
// Nunca su nombre ni su teléfono (docs/research/PRIVACIDAD.md, reglas 2 y 5).

/** Llave donde se guardan solo los conteos de sí y no. */
export const CONTACT_CONSENT_TALLY_KEY = 'yucu_buyer_contact_consent';

export interface ContactConsentTally {
  si: number;
  no: number;
}

/** Lo mínimo de `Storage` que necesitamos; así se puede probar sin navegador. */
export type TallyStorage = Pick<Storage, 'getItem' | 'setItem'>;

const EMPTY: ContactConsentTally = { si: 0, no: 0 };

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** Lee los conteos guardados. Si no hay o están dañados, devuelve 0 y 0. */
export function readContactConsentTally(storage: TallyStorage | undefined): ContactConsentTally {
  if (!storage) return { ...EMPTY };
  try {
    const raw = storage.getItem(CONTACT_CONSENT_TALLY_KEY);
    if (raw === null) return { ...EMPTY };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      const { si, no } = parsed as Record<string, unknown>;
      if (isCount(si) && isCount(no)) return { si, no };
    }
  } catch {
    // Almacenamiento bloqueado o dato dañado: empezamos de cero.
  }
  return { ...EMPTY };
}

/** Suma una respuesta (sí o no) y devuelve los conteos nuevos. Solo guarda números. */
export function recordContactConsent(
  storage: TallyStorage | undefined,
  accepted: boolean,
): ContactConsentTally {
  const current = readContactConsentTally(storage);
  const next: ContactConsentTally = accepted
    ? { si: current.si + 1, no: current.no }
    : { si: current.si, no: current.no + 1 };
  try {
    storage?.setItem(CONTACT_CONSENT_TALLY_KEY, JSON.stringify(next));
  } catch {
    // Si no se puede guardar, al menos se muestra en pantalla durante esta sesión.
  }
  return next;
}
