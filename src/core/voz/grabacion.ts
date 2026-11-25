// Máquina de estados del botón de micrófono (FRONTEND.md, sección 5: "Grabar").
//
// El botón funciona de dos maneras, como en WhatsApp:
//   * Toque y toque: tocas una vez para empezar y otra vez para enviar.
//   * Mantener y soltar: mantienes presionado mientras hablas y sueltas para enviar.
// "Cancelar" nunca envía nada, y la grabación se detiene sola (y se envía) a los 60 segundos.
//
// Es una función pura: recibe el estado y un evento (con la hora en milisegundos) y devuelve
// el estado nuevo y qué hay que hacer con el micrófono. Así se prueba sin micrófono ni relojes.

/** Máximo de grabación: 60 segundos (FRONTEND.md, sección 5; límite del servidor #170). */
export const MAX_GRABACION_MS = 60_000;

/** Si se suelta antes de este tiempo, fue un toque; si se suelta después, fue "mantener y soltar". */
export const UMBRAL_MANTENER_MS = 400;

export type ModoGrabacion =
  /** Se presionó y todavía no se suelta: aún no sabemos si es toque o mantener. */
  | 'presionado'
  /** Fue un toque: sigue grabando hasta el siguiente toque. */
  | 'toque';

export type EstadoGrabacion =
  | { fase: 'inactiva' }
  | { fase: 'grabando'; inicio: number; modo: ModoGrabacion };

export type EventoGrabacion =
  | { tipo: 'presionar'; ahora: number }
  | { tipo: 'soltar'; ahora: number }
  /** El navegador interrumpió el gesto (por ejemplo, la persona deslizó la pantalla). */
  | { tipo: 'interrumpir' }
  | { tipo: 'cancelar' }
  /** Pasa el tiempo: se manda cada fracción de segundo mientras se graba. */
  | { tipo: 'tic'; ahora: number }
  /** El micrófono no se pudo abrir. */
  | { tipo: 'fallo' };

/** Qué debe hacer la pantalla con el micrófono después de la transición. */
export type EfectoGrabacion = 'iniciar' | 'enviar' | 'descartar' | null;

export interface Transicion {
  estado: EstadoGrabacion;
  efecto: EfectoGrabacion;
}

export const ESTADO_INICIAL: EstadoGrabacion = { fase: 'inactiva' };

const INACTIVA: EstadoGrabacion = ESTADO_INICIAL;

export function transicionGrabacion(estado: EstadoGrabacion, evento: EventoGrabacion): Transicion {
  if (estado.fase === 'inactiva') {
    if (evento.tipo === 'presionar') {
      return { estado: { fase: 'grabando', inicio: evento.ahora, modo: 'presionado' }, efecto: 'iniciar' };
    }
    // Soltar después de un envío, un tic tardío o cancelar sin grabar: no pasa nada.
    return { estado, efecto: null };
  }

  // Desde aquí, la fase es "grabando".
  switch (evento.tipo) {
    case 'cancelar':
      return { estado: INACTIVA, efecto: 'descartar' };

    case 'fallo':
      return { estado: INACTIVA, efecto: null };

    case 'tic':
      if (evento.ahora - estado.inicio >= MAX_GRABACION_MS) {
        return { estado: INACTIVA, efecto: 'enviar' };
      }
      return { estado, efecto: null };

    case 'soltar':
      if (estado.modo === 'presionado') {
        if (evento.ahora - estado.inicio >= UMBRAL_MANTENER_MS) {
          // Mantener y soltar: se envía al soltar.
          return { estado: INACTIVA, efecto: 'enviar' };
        }
        // Fue un toque corto: sigue grabando hasta el siguiente toque.
        return { estado: { ...estado, modo: 'toque' }, efecto: null };
      }
      return { estado, efecto: null };

    case 'presionar':
      if (estado.modo === 'toque') {
        // Segundo toque: se envía.
        return { estado: INACTIVA, efecto: 'enviar' };
      }
      return { estado, efecto: null };

    case 'interrumpir':
      // Si la persona estaba manteniendo presionado y el gesto se corta, no se envía nada por accidente.
      if (estado.modo === 'presionado') {
        return { estado: INACTIVA, efecto: 'descartar' };
      }
      return { estado, efecto: null };
  }
}

/** Segundos que lleva la grabación, de 0 a 60, para el contador. */
export function segundosGrabados(estado: EstadoGrabacion, ahora: number): number {
  if (estado.fase !== 'grabando') return 0;
  const ms = Math.min(Math.max(0, ahora - estado.inicio), MAX_GRABACION_MS);
  return Math.floor(ms / 1000);
}

/** Formato del contador: "0:07", "1:00". */
export function formatearContador(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
