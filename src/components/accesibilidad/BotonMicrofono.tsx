import React from 'react';
import { MAX_GRABACION_MS, formatearContador } from '../../core/voz/grabacion';
import { TEXTOS_MICROFONO } from '../../textos/campo';
import type { GrabacionVoz } from './useGrabacionVoz';

interface BotonMicrofonoProps {
  grabacion: GrabacionVoz;
}

/**
 * Botón de micrófono grande (56 × 56 px). Funciona con toque y toque, o con mantener y soltar.
 * La lógica está en `core/voz/grabacion.ts`; aquí solo se traducen los gestos a eventos.
 */
export const BotonMicrofono: React.FC<BotonMicrofonoProps> = ({ grabacion }) => {
  const etiqueta = !grabacion.grabando
    ? TEXTOS_MICROFONO.grabar
    : grabacion.manteniendo
    ? TEXTOS_MICROFONO.soltarParaEnviar
    : TEXTOS_MICROFONO.enviar;

  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        // Así el "soltar" llega aunque el dedo se mueva fuera del botón.
        e.currentTarget.setPointerCapture?.(e.pointerId);
        grabacion.presionar();
      }}
      onPointerUp={() => grabacion.soltar()}
      onPointerCancel={() => grabacion.interrumpir()}
      onClick={(e) => {
        // Con teclado (Enter o Espacio) no hay eventos de puntero: cuenta como un toque.
        if (e.detail === 0) {
          grabacion.presionar();
          grabacion.soltar();
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 select-none touch-none cursor-pointer transition-colors ${
        grabacion.grabando ? 'bg-red-700 text-white' : 'bg-[#032517] text-white hover:bg-[#1b3b2b]'
      }`}
    >
      <span className="material-symbols-outlined text-3xl" aria-hidden="true">
        {grabacion.grabando ? 'send' : 'mic'}
      </span>
    </button>
  );
};

interface PanelGrabacionProps {
  grabacion: GrabacionVoz;
  /** Volumen de 0 a 100 para la onda. */
  volumen: number;
  /** Lo que el teléfono va entendiendo, si lo hay. */
  textoEnVivo?: string;
}

// Alturas relativas de las barras de la onda, para que no se vean todas iguales.
const FORMA_ONDA = [0.45, 0.7, 1, 0.8, 0.55, 0.9, 0.65, 1, 0.5, 0.75, 0.6, 0.85];

/** Lo que se ve mientras graba: contador, onda y un botón grande de "Cancelar". */
export const PanelGrabacion: React.FC<PanelGrabacionProps> = ({ grabacion, volumen, textoEnVivo }) => {
  if (!grabacion.grabando) return null;

  const nivel = Math.min(100, Math.max(0, volumen)) / 100;
  const limite = formatearContador(MAX_GRABACION_MS / 1000);
  const instruccion = grabacion.manteniendo ? TEXTOS_MICROFONO.soltarParaEnviar : TEXTOS_MICROFONO.enviar;

  return (
    <div
      className="mt-2 bg-[#1b3b2b] text-white p-3 rounded-2xl shadow-md flex flex-col gap-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" aria-hidden="true" />
          <span className="text-lg font-bold font-mono whitespace-nowrap" aria-label={`${grabacion.segundos} segundos`}>
            {formatearContador(grabacion.segundos)} / {limite}
          </span>
        </div>

        {/* Onda: se mueve con el volumen del micrófono. */}
        <div className="flex items-center gap-1 h-10 flex-1 min-w-0 max-w-48" aria-hidden="true">
          {FORMA_ONDA.map((factor, i) => (
            <span
              key={i}
              className="flex-1 bg-emerald-300 rounded-full transition-all duration-100"
              style={{ height: `${Math.max(12, Math.round(nivel * factor * 100))}%` }}
            />
          ))}
        </div>
      </div>

      <p className="text-base font-semibold">
        {TEXTOS_MICROFONO.grabando}. {instruccion}.
      </p>

      <p className="text-base italic text-white bg-black/30 px-3 py-2 rounded-xl truncate">
        {textoEnVivo ? `"${textoEnVivo}"` : TEXTOS_MICROFONO.sinTextoEnVivo}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={grabacion.cancelar}
          className="flex-1 min-h-14 rounded-full bg-white text-[#032517] text-lg font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">close</span>
          <span>{TEXTOS_MICROFONO.cancelar}</span>
        </button>
      </div>

      <p className="text-base text-white">{TEXTOS_MICROFONO.limite}</p>
    </div>
  );
};
