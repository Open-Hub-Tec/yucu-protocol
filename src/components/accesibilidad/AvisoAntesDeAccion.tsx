import React from 'react';

interface AvisoAntesDeAccionProps {
  /** Frase que dice lo que va a pasar, por ejemplo "Vas a guardar tu café. Puedes cambiarlo después." */
  texto: string;
  className?: string;
}

/** Frase corta que se muestra antes de una acción importante, para que nada pase por sorpresa. */
export const AvisoAntesDeAccion: React.FC<AvisoAntesDeAccionProps> = ({ texto, className = '' }) => (
  <p className={`flex items-start gap-2 text-base font-semibold text-[#1c1c18] ${className}`}>
    <span className="material-symbols-outlined text-2xl text-[#a73918] shrink-0" aria-hidden="true">
      info
    </span>
    <span>{texto}</span>
  </p>
);
