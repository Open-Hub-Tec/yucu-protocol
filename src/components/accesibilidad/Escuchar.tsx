import React, { useEffect, useRef, useState } from 'react';
import { planearLectura } from '../../core/voz/elegirVoz';
import { TEXTOS_ESCUCHAR } from '../../textos/campo';

interface EscucharProps {
  /** Texto que se lee en voz alta (o que se muestra en letra muy grande si no hay voz). */
  texto: string;
  /** Texto del botón, si se quiere otro distinto de "Escuchar". */
  etiqueta?: string;
  className?: string;
}

function obtenerSintetizador(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  return window.speechSynthesis;
}

/**
 * Único componente para leer en voz alta (FRONTEND.md, sección 5).
 * Español de México si el teléfono lo tiene, un poco más lento, con "Escuchar" y "Repetir".
 * Si no hay voz en español, muestra el texto en letra muy grande con un aviso, sin fallar.
 */
export const Escuchar: React.FC<EscucharProps> = ({ texto, etiqueta, className = '' }) => {
  const [hablando, setHablando] = useState(false);
  const [yaEscucho, setYaEscucho] = useState(false);
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const hablandoRef = useRef(false);

  // Chrome carga la lista de voces poco a poco: pedirla al abrir la pantalla la prepara.
  useEffect(() => {
    const sintetizador = obtenerSintetizador();
    if (!sintetizador) return;
    const cargar = () => {
      try {
        sintetizador.getVoices();
      } catch {
        // Sin voces: al tocar "Escuchar" se mostrará el texto.
      }
    };
    cargar();
    sintetizador.addEventListener?.('voiceschanged', cargar);
    return () => {
      sintetizador.removeEventListener?.('voiceschanged', cargar);
      if (hablandoRef.current) sintetizador.cancel();
    };
  }, []);

  const terminar = () => {
    hablandoRef.current = false;
    setHablando(false);
  };

  const detener = () => {
    obtenerSintetizador()?.cancel();
    terminar();
  };

  const leer = () => {
    setYaEscucho(true);
    const sintetizador = obtenerSintetizador();
    const plan = planearLectura(sintetizador);

    if (plan.modo === 'texto' || !sintetizador) {
      setMostrarTexto(true);
      return;
    }

    try {
      sintetizador.cancel();
      const lectura = new SpeechSynthesisUtterance(texto);
      lectura.voice = plan.voz;
      lectura.lang = plan.idioma;
      lectura.rate = plan.velocidad;
      lectura.onend = terminar;
      lectura.onerror = terminar;
      hablandoRef.current = true;
      setHablando(true);
      sintetizador.speak(lectura);
    } catch {
      terminar();
      setMostrarTexto(true);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={hablando ? detener : leer}
          className="min-h-14 px-4 rounded-full bg-white border-2 border-[#032517] text-[#032517] text-lg font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">
            {hablando ? 'stop' : 'volume_up'}
          </span>
          <span>{hablando ? TEXTOS_ESCUCHAR.detener : etiqueta ?? TEXTOS_ESCUCHAR.escuchar}</span>
        </button>

        {yaEscucho && !hablando && !mostrarTexto && (
          <button
            type="button"
            onClick={leer}
            className="min-h-14 px-4 rounded-full bg-white border-2 border-[#032517] text-[#032517] text-lg font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">replay</span>
            <span>{TEXTOS_ESCUCHAR.repetir}</span>
          </button>
        )}
      </div>

      {mostrarTexto && (
        <div className="bg-white border-2 border-[#a73918] rounded-2xl p-4 flex flex-col gap-3" role="alert">
          <p className="text-base font-bold text-[#6c1900]">{TEXTOS_ESCUCHAR.sinVoz}</p>
          <p className="text-3xl font-bold leading-snug text-[#1c1c18]">{texto}</p>
          <button
            type="button"
            onClick={() => setMostrarTexto(false)}
            className="min-h-14 rounded-full bg-[#032517] text-white text-lg font-bold cursor-pointer active:scale-95"
          >
            {TEXTOS_ESCUCHAR.cerrarTexto}
          </button>
        </div>
      )}
    </div>
  );
};
