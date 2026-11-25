// W53 #182: el micrófono envía con toque y toque, y con mantener y soltar;
// "Cancelar" no envía nada; una grabación se detiene sola a los 60 segundos.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ESTADO_INICIAL,
  MAX_GRABACION_MS,
  UMBRAL_MANTENER_MS,
  formatearContador,
  segundosGrabados,
  transicionGrabacion,
  type EfectoGrabacion,
  type EstadoGrabacion,
  type EventoGrabacion,
} from '../core/voz/grabacion';

/** Aplica una serie de eventos y devuelve el estado final y todos los efectos en orden. */
function correr(eventos: EventoGrabacion[]): { estado: EstadoGrabacion; efectos: EfectoGrabacion[] } {
  let estado = ESTADO_INICIAL;
  const efectos: EfectoGrabacion[] = [];
  for (const evento of eventos) {
    const t = transicionGrabacion(estado, evento);
    estado = t.estado;
    if (t.efecto) efectos.push(t.efecto);
  }
  return { estado, efectos };
}

describe('micrófono: toque y toque', () => {
  it('un toque empieza a grabar y el segundo toque envía', () => {
    const { estado, efectos } = correr([
      { tipo: 'presionar', ahora: 0 },
      { tipo: 'soltar', ahora: 120 },
      { tipo: 'tic', ahora: 3_000 },
      { tipo: 'presionar', ahora: 5_000 },
      { tipo: 'soltar', ahora: 5_100 },
    ]);
    assert.deepEqual(efectos, ['iniciar', 'enviar']);
    assert.equal(estado.fase, 'inactiva');
  });

  it('después del primer toque sigue grabando (no envía al soltar)', () => {
    const { estado, efectos } = correr([
      { tipo: 'presionar', ahora: 0 },
      { tipo: 'soltar', ahora: UMBRAL_MANTENER_MS - 1 },
    ]);
    assert.deepEqual(efectos, ['iniciar']);
    assert.equal(estado.fase, 'grabando');
  });
});

describe('micrófono: mantener y soltar', () => {
  it('mantener presionado y soltar envía', () => {
    const { estado, efectos } = correr([
      { tipo: 'presionar', ahora: 0 },
      { tipo: 'tic', ahora: 2_000 },
      { tipo: 'soltar', ahora: 4_000 },
    ]);
    assert.deepEqual(efectos, ['iniciar', 'enviar']);
    assert.equal(estado.fase, 'inactiva');
  });

  it('si el navegador corta el gesto mientras mantiene, no se envía nada', () => {
    const { efectos } = correr([
      { tipo: 'presionar', ahora: 0 },
      { tipo: 'interrumpir' },
      { tipo: 'soltar', ahora: 3_000 },
    ]);
    assert.deepEqual(efectos, ['iniciar', 'descartar']);
    assert.ok(!efectos.includes('enviar'));
  });
});

describe('micrófono: Cancelar', () => {
  it('"Cancelar" en modo toque descarta y no envía nada', () => {
    const { estado, efectos } = correr([
      { tipo: 'presionar', ahora: 0 },
      { tipo: 'soltar', ahora: 100 },
      { tipo: 'cancelar' },
      // Soltar el dedo después de cancelar no envía nada.
      { tipo: 'soltar', ahora: 2_000 },
    ]);
    assert.deepEqual(efectos, ['iniciar', 'descartar']);
    assert.ok(!efectos.includes('enviar'));
    assert.equal(estado.fase, 'inactiva');
  });

  it('"Cancelar" mientras mantiene presionado tampoco envía al soltar', () => {
    const { efectos } = correr([
      { tipo: 'presionar', ahora: 0 },
      { tipo: 'cancelar' },
      { tipo: 'soltar', ahora: 5_000 },
    ]);
    assert.deepEqual(efectos, ['iniciar', 'descartar']);
  });

  it('cancelar sin estar grabando no hace nada', () => {
    const { estado, efectos } = correr([{ tipo: 'cancelar' }, { tipo: 'soltar', ahora: 10 }]);
    assert.deepEqual(efectos, []);
    assert.equal(estado.fase, 'inactiva');
  });
});

describe('micrófono: máximo 60 segundos', () => {
  it('a los 60 segundos la grabación se detiene sola (y se envía)', () => {
    const { estado, efectos } = correr([
      { tipo: 'presionar', ahora: 1_000 },
      { tipo: 'soltar', ahora: 1_100 },
      { tipo: 'tic', ahora: 1_000 + MAX_GRABACION_MS },
    ]);
    assert.equal(MAX_GRABACION_MS, 60_000);
    assert.deepEqual(efectos, ['iniciar', 'enviar']);
    assert.equal(estado.fase, 'inactiva');
  });

  it('también se detiene a los 60 segundos si sigue manteniendo, y el soltar tardío no envía otra vez', () => {
    const { efectos } = correr([
      { tipo: 'presionar', ahora: 0 },
      { tipo: 'tic', ahora: MAX_GRABACION_MS + 50 },
      { tipo: 'soltar', ahora: MAX_GRABACION_MS + 2_000 },
    ]);
    assert.deepEqual(efectos, ['iniciar', 'enviar']);
  });

  it('antes de los 60 segundos sigue grabando', () => {
    const { estado, efectos } = correr([
      { tipo: 'presionar', ahora: 0 },
      { tipo: 'soltar', ahora: 100 },
      { tipo: 'tic', ahora: MAX_GRABACION_MS - 1 },
    ]);
    assert.deepEqual(efectos, ['iniciar']);
    assert.equal(estado.fase, 'grabando');
  });

  it('el contador va de 0 a 60 y no pasa de 1:00', () => {
    const grabando: EstadoGrabacion = { fase: 'grabando', inicio: 0, modo: 'toque' };
    assert.equal(segundosGrabados(grabando, 7_900), 7);
    assert.equal(segundosGrabados(grabando, 90_000), 60);
    assert.equal(segundosGrabados(ESTADO_INICIAL, 5_000), 0);
    assert.equal(formatearContador(7), '0:07');
    assert.equal(formatearContador(60), '1:00');
  });
});

describe('micrófono: si no abre', () => {
  it('un fallo al abrir el micrófono vuelve a inactiva sin enviar', () => {
    const { estado, efectos } = correr([{ tipo: 'presionar', ahora: 0 }, { tipo: 'fallo' }]);
    assert.deepEqual(efectos, ['iniciar']);
    assert.equal(estado.fase, 'inactiva');
  });
});
