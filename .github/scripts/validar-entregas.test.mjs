// Pruebas de validar-entregas.mjs. Correr con: node --test .github/scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validar, formatear, estadoDeCarta } from './validar-entregas.mjs';

const C = 'docs/gestion/equipo-3/';
const PROPUESTA = [
  '# Propuesta', '## 1. Resumen ejecutivo', 'x', '## 2. Problema y contexto', '## 3. Objetivo SMART y alcance',
  '## 4. Solución y uso de Stellar', '## 5. Plan de trabajo y cronograma', '## 6. Presupuesto y personal',
  '## 7. Riesgos y viabilidad', '## 8. Evidencia y siguientes pasos', 'Costo total: $12,400 MXN.',
].join('\n');

function base(extra = {}) {
  return {
    prBody: 'Refs #199',
    archivos: [{ path: C + 'propuesta.md', status: 'added' }],
    contenidos: { [C + 'propuesta.md']: PROPUESTA },
    archivosDelEquipo: [C + 'propuesta.md'],
    issuesPorEquipo: { 3: 199 },
    autor: 'alumna1',
    autoresCommits: ['alumna1', 'alumno2'],
    revisiones: [{ login: 'alumno2', state: 'APPROVED' }],
    ...extra,
  };
}
const todoBien = (r) => r.minimos.every((m) => m.cumple);

test('propuesta completa cumple', () => {
  const r = validar(base());
  assert.equal(r.equipo, '3');
  assert.ok(todoBien(r), JSON.stringify(r.minimos));
});

test('sin referencia a la issue no cumple', () => {
  assert.ok(!todoBien(validar(base({ prBody: 'Mi propuesta' }))));
  assert.ok(!todoBien(validar(base({ prBody: 'Refs #198' }))));
});

test('sección faltante o fuera de orden no cumple', () => {
  const sinRiesgos = PROPUESTA.replace('## 7. Riesgos y viabilidad', '');
  assert.ok(!todoBien(validar(base({ contenidos: { [C + 'propuesta.md']: sinRiesgos } }))));
  const desordenada = PROPUESTA.replace('## 1. Resumen ejecutivo', '').replace('## 8. Evidencia', '## 1. Resumen ejecutivo\n## 8. Evidencia');
  assert.ok(!todoBien(validar(base({ contenidos: { [C + 'propuesta.md']: desordenada } }))));
});

test('PDF o foto en docs/gestion no cumple', () => {
  const r = validar(base({ archivos: [...base().archivos, { path: C + 'carta-firmada.pdf', status: 'added' }] }));
  assert.ok(!todoBien(r));
});

test('número de control, teléfono o CURP no cumplen', () => {
  for (const dato of ['Integrante 23620107', 'Tel. 953 123 4567', 'CURP GOMC800101HOCRRR09']) {
    const r = validar(base({ contenidos: { [C + 'propuesta.md']: PROPUESTA + '\n' + dato } }));
    assert.ok(!todoBien(r), dato);
  }
});

test('cifras con comas, fechas y huellas SHA-256 no son falsos positivos', () => {
  const texto = PROPUESTA + '\nCosto: $1,500,000. Fecha: 2026-11-10.\n' + 'a'.repeat(10) + '1234567890'.repeat(5) + 'abcdef0123456';
  const r = validar(base({ contenidos: { [C + 'propuesta.md']: texto } }));
  assert.ok(todoBien(r), JSON.stringify(r.minimos));
});

test('mezclar dos equipos no cumple', () => {
  const r = validar(base({ archivos: [...base().archivos, { path: 'docs/gestion/equipo-4/propuesta.md', status: 'added' }] }));
  assert.equal(r.equipo, null);
  assert.ok(!todoBien(r));
});

test('plan de informe pide sus partes, el informe real y la plantilla de minuta', () => {
  const plan = '## Destinatarios\n## Matriz de comunicación\n## Formato del informe\n## Indicadores\n## Semáforo\n## Herramientas';
  const d = {
    archivos: [{ path: C + 'plan-de-informe.md', status: 'added' }],
    contenidos: { [C + 'plan-de-informe.md']: plan },
  };
  assert.ok(!todoBien(validar(base({ ...d, archivosDelEquipo: [C + 'plan-de-informe.md'] }))));
  const completo = validar(base({ ...d, archivosDelEquipo: [C + 'plan-de-informe.md', C + 'informe-semana-1.md', C + 'minutas/plantilla.md'] }));
  assert.ok(todoBien(completo), JSON.stringify(completo.minimos));
});

test('estado de la carta', () => {
  assert.deepEqual(estadoDeCarta('Texto\n**Estado:** borrador'), { tipo: 'borrador' });
  assert.deepEqual(estadoDeCarta('Estado: En consulta de asamblea'), { tipo: 'consulta' });
  assert.deepEqual(estadoDeCarta('Estado: firmada el 2026-11-28'), { tipo: 'firmada', fecha: '2026-11-28' });
  assert.equal(estadoDeCarta('Sin estado'), null);
  assert.equal(estadoDeCarta('Estado: casi lista').tipo, 'invalido');
});

test('carta firmada pide huella y minuta', () => {
  const huella = 'b'.repeat(64);
  const d = (texto, archivos) => base({
    archivos: [{ path: C + 'carta.md', status: 'modified' }],
    contenidos: { [C + 'carta.md']: texto },
    archivosDelEquipo: archivos,
  });
  assert.ok(todoBien(validar(d('Estado: borrador', [C + 'carta.md']))));
  assert.ok(!todoBien(validar(d('Estado: firmada el 2026-11-28', [C + 'carta.md', C + 'minutas/2026-11-20.md']))));
  assert.ok(!todoBien(validar(d(`Estado: firmada el 2026-11-28\nSHA-256: ${huella}`, [C + 'carta.md', C + 'minutas/plantilla.md']))));
  assert.ok(todoBien(validar(d(`Estado: firmada el 2026-11-28\nSHA-256: ${huella}`, [C + 'carta.md', C + 'minutas/2026-11-20.md']))));
});

test('avisos no bloquean: correo, frases de más y sin aprobación', () => {
  const r = validar(base({
    contenidos: { [C + 'propuesta.md']: PROPUESTA + '\nContacto: alguien@correo.com. Ya está en producción.' },
    revisiones: [],
  }));
  assert.ok(todoBien(r));
  assert.equal(r.avisos.length, 3);
});

test('el comentario lleva la marca y el resultado', () => {
  const { cumple, texto } = formatear(validar(base()));
  assert.ok(cumple);
  assert.match(texto, /validar-entregas-sprint4/);
  assert.match(texto, /Cumple los requisitos mínimos/);
});
