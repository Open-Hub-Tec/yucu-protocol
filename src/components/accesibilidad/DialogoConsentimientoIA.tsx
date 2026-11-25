import React from 'react';

interface DialogoConsentimientoIAProps {
  tipo: 'imagen' | 'audio';
  onAceptar: () => void;
  onRechazar: () => void;
}

const TEXTOS = {
  imagen: {
    titulo: '¿Mandar tu foto a la IA?',
    que: 'La foto se envía a Google Gemini para revisar la calidad.',
    aviso: 'No mandes fotos donde salgan personas.',
  },
  audio: {
    titulo: '¿Mandar tu voz a la IA?',
    que: 'El audio se envía a Google Gemini para escribir lo que dijiste.',
    aviso: 'No grabes datos de otras personas.',
  },
};

/** Pantalla corta que pide permiso antes de mandar una foto o un audio a la IA. */
export const DialogoConsentimientoIA: React.FC<DialogoConsentimientoIAProps> = ({
  tipo,
  onAceptar,
  onRechazar,
}) => {
  const t = TEXTOS[tipo];
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consentimiento-ia-titulo"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-center">
        <h3 id="consentimiento-ia-titulo" className="text-xl font-extrabold text-[#032517]">
          {t.titulo}
        </h3>
        <p className="text-lg text-[#1c1c18] leading-snug">{t.que}</p>
        <p className="text-lg text-[#a73918] font-bold leading-snug">{t.aviso}</p>
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onRechazar}
            autoFocus
            className="flex-1 min-h-14 rounded-2xl bg-stone-200 text-stone-800 text-xl font-bold cursor-pointer"
          >
            No
          </button>
          <button
            type="button"
            onClick={onAceptar}
            className="flex-1 min-h-14 rounded-2xl bg-[#032517] text-white text-xl font-bold cursor-pointer"
          >
            Sí, enviar
          </button>
        </div>
      </div>
    </div>
  );
};