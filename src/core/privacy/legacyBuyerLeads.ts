// #121: la pantalla de entrevistas a compradores ya no guarda nombres ni teléfonos
// (docs/research/PRIVACIDAD.md, reglas 2 y 5). Versiones anteriores sí los guardaban
// en localStorage con esta llave; al abrir la app la borramos si todavía existe.

/** Llave antigua donde se guardaban nombre y teléfono de compradores. Solo se usa para borrarla. */
export const LEGACY_BUYER_LEADS_KEY = 'raiz_buyer_leads';

/** Lo mínimo de `Storage` que necesitamos; así se puede probar sin navegador. */
export type RemovableStorage = Pick<Storage, 'getItem' | 'removeItem'>;

/** `localStorage` del navegador, o `undefined` si no existe o el navegador lo bloquea. */
export function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Borra la llave antigua de compradores si existe.
 * Devuelve `true` si había datos y se borraron, `false` si no había nada que borrar.
 * Nunca lanza error: si el almacenamiento no está disponible, no hace nada.
 */
export function purgeLegacyBuyerLeads(storage: RemovableStorage | undefined): boolean {
  if (!storage) return false;
  try {
    if (storage.getItem(LEGACY_BUYER_LEADS_KEY) === null) return false;
    storage.removeItem(LEGACY_BUYER_LEADS_KEY);
    return true;
  } catch {
    // Modo privado o almacenamiento bloqueado: no hay nada que podamos borrar.
    return false;
  }
}
