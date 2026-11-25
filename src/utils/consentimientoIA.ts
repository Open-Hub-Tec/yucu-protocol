
export interface ConsentimientoIA {
  imagen: boolean;
  audio: boolean;
}

export type TipoEnvioIA = 'imagen' | 'audio';

export const consentimientoInicial = (): ConsentimientoIA => ({
  imagen: false,
  audio: false,
});

export const puedeEnviarAIA = (
  consentimiento: ConsentimientoIA,
  tipo: TipoEnvioIA
): boolean => consentimiento[tipo] === true;

export async function conConsentimiento<T>(
  consentimiento: ConsentimientoIA,
  tipo: TipoEnvioIA,
  enviar: () => Promise<T>
): Promise<T | null> {
  if (!puedeEnviarAIA(consentimiento, tipo)) {
    return null;
  }

  return enviar();
}
