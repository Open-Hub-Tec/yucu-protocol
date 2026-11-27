import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ESTADO_INICIAL,
  segundosGrabados,
  transicionGrabacion,
  UMBRAL_MANTENER_MS,
  type EstadoGrabacion,
  type EventoGrabacion,
} from '../../core/voz/grabacion';

export interface OpcionesGrabacionVoz {
  /** Abre el micrófono. Devuelve `false` si no se pudo (sin permiso, sin micrófono). */
  onIniciar: () => Promise<boolean>;
  /** Detiene la grabación y envía lo que se grabó. */
  onEnviar: () => void;
  /** Detiene la grabación y la borra sin enviar nada. */
  onCancelar: () => void;
}

export interface GrabacionVoz {
  grabando: boolean;
  /** `true` mientras el dedo sigue sobre el botón y todavía no se sabe si es toque o mantener. */
  presionado: boolean;
  /** `true` cuando ya está claro que la persona mantiene presionado: al soltar se envía. */
  manteniendo: boolean;
  segundos: number;
  presionar: () => void;
  soltar: () => void;
  interrumpir: () => void;
  cancelar: () => void;
}

const INTERVALO_TIC_MS = 250;

/**
 * Conecta la máquina de estados de `core/voz/grabacion.ts` con React y con el micrófono real.
 * La lógica (toque, mantener, cancelar, 60 segundos) vive en la máquina; aquí solo hay tiempo y efectos.
 */
export function useGrabacionVoz(opciones: OpcionesGrabacionVoz): GrabacionVoz {
  const [estado, setEstado] = useState<EstadoGrabacion>(ESTADO_INICIAL);
  const [ahora, setAhora] = useState<number>(() => Date.now());

  const estadoRef = useRef<EstadoGrabacion>(ESTADO_INICIAL);
  const opcionesRef = useRef(opciones);
  // El micrófono tarda en abrir (sobre todo la primera vez, cuando pide permiso).
  // Si la persona envía o cancela antes, se guarda aquí y se hace en cuanto abra.
  const microfonoListoRef = useRef(false);
  const pendienteRef = useRef<'enviar' | 'descartar' | null>(null);

  useEffect(() => {
    opcionesRef.current = opciones;
  });

  const despachar = useCallback((evento: EventoGrabacion) => {
    const { estado: nuevo, efecto } = transicionGrabacion(estadoRef.current, evento);
    estadoRef.current = nuevo;
    setEstado(nuevo);

    if (efecto === 'iniciar') {
      microfonoListoRef.current = false;
      pendienteRef.current = null;
      setAhora(Date.now());
      opcionesRef.current
        .onIniciar()
        .catch(() => false)
        .then((abrio) => {
          if (!abrio) {
            pendienteRef.current = null;
            despachar({ tipo: 'fallo' });
            return;
          }
          const pendiente = pendienteRef.current;
          pendienteRef.current = null;
          if (pendiente === 'enviar') opcionesRef.current.onEnviar();
          else if (pendiente === 'descartar') opcionesRef.current.onCancelar();
          else microfonoListoRef.current = true;
        });
      return;
    }

    if (efecto === 'enviar' || efecto === 'descartar') {
      if (!microfonoListoRef.current) {
        pendienteRef.current = efecto;
        return;
      }
      microfonoListoRef.current = false;
      if (efecto === 'enviar') opcionesRef.current.onEnviar();
      else opcionesRef.current.onCancelar();
    }
  }, []);

  // Mientras graba, el tiempo avanza: actualiza el contador y corta a los 60 segundos.
  const grabando = estado.fase === 'grabando';
  useEffect(() => {
    if (!grabando) return;
    const id = setInterval(() => {
      const t = Date.now();
      setAhora(t);
      despachar({ tipo: 'tic', ahora: t });
    }, INTERVALO_TIC_MS);
    return () => clearInterval(id);
  }, [grabando, despachar]);

  // Si la pantalla se cierra a media grabación, no se envía nada.
  useEffect(() => {
    return () => {
      if (estadoRef.current.fase === 'grabando' && microfonoListoRef.current) {
        opcionesRef.current.onCancelar();
      }
    };
  }, []);

  return {
    grabando,
    presionado: estado.fase === 'grabando' && estado.modo === 'presionado',
    manteniendo:
      estado.fase === 'grabando' && estado.modo === 'presionado' && ahora - estado.inicio >= UMBRAL_MANTENER_MS,
    segundos: segundosGrabados(estado, ahora),
    presionar: () => despachar({ tipo: 'presionar', ahora: Date.now() }),
    soltar: () => despachar({ tipo: 'soltar', ahora: Date.now() }),
    interrumpir: () => despachar({ tipo: 'interrumpir' }),
    cancelar: () => despachar({ tipo: 'cancelar' }),
  };
}
