import React from 'react';
import { TEXTOS_NAVEGACION } from '../../textos/campo';

interface BotonRegresarProps {
  onClick: () => void;
  /** "Regresar" por defecto; también "Cancelar" o "Cerrar". */
  texto?: string;
  icono?: 'arrow_back' | 'close';
  className?: string;
}

/** Botón grande (al menos 56 px de alto) con ícono y texto para cancelar o volver atrás. */
export const BotonRegresar: React.FC<BotonRegresarProps> = ({
  onClick,
  texto = TEXTOS_NAVEGACION.regresar,
  icono = 'arrow_back',
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-14 min-w-14 px-4 rounded-full bg-white border-2 border-[#032517] text-[#032517] text-lg font-bold inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform ${className}`}
  >
    <span className="material-symbols-outlined text-2xl" aria-hidden="true">
      {icono}
    </span>
    <span>{texto}</span>
  </button>
);
