import React from 'react';
import { TEXTOS_SELLO } from '../../textos/campo';
import { Escuchar } from './Escuchar';

interface ExplicacionSelloProps {
  /** Versión corta, sin botón de escuchar, para listas y etiquetas pequeñas. */
  compacta?: boolean;
  className?: string;
}

/**
 * Explica el sello dondequiera que aparece (pasaporte, etiqueta QR, lista de lotes).
 * En las pruebas de campo se confundió con un trámite de impuestos o un cobro (HITO_1.2).
 * Nunca dice "oficial" ni "certificado" (regla 8, #108).
 */
export const ExplicacionSello: React.FC<ExplicacionSelloProps> = ({ compacta = false, className = '' }) => {
  if (compacta) {
    return (
      <p className={`flex items-start gap-2 text-base font-semibold text-[#032517] ${className}`}>
        <span className="material-symbols-outlined text-2xl text-emerald-800 shrink-0" aria-hidden="true">
          verified
        </span>
        <span>{TEXTOS_SELLO.explicacion}</span>
      </p>
    );
  }

  return (
    <section
      aria-label={TEXTOS_SELLO.titulo}
      className={`bg-[#e7f3ec] border-2 border-emerald-800 rounded-2xl p-3 flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-start gap-2">
        <span className="material-symbols-outlined text-3xl text-emerald-800 shrink-0" aria-hidden="true">
          verified
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-[#032517]">{TEXTOS_SELLO.titulo}</h2>
          <p className="text-lg font-semibold text-[#032517] leading-snug">{TEXTOS_SELLO.explicacion}</p>
        </div>
      </div>
      <Escuchar texto={TEXTOS_SELLO.explicacion} />
    </section>
  );
};
