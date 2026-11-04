// Pruebas de rubrica.mjs. Correr con: node --test .github/scripts/rubrica.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reglasPropuesta, reglasPlan, reglasCarta, rubricaDeIssue, mensajesIA, interpretarIA, formatearIA } from './rubrica.mjs';

const cumple = (lista, n) => lista.find((x) => x.n === n).cumple;

const PROPUESTA_BUENA = `
## 1. Resumen ejecutivo
El módulo cuesta $12,400 MXN y se entrega el 2026-12-01.
## 2. Problema y contexto
Texto.
## 3. Objetivo SMART y alcance
Lograr que 10 artesanas vean sus cobros antes del 2026-12-01. No incluye retiros reales al banco.
## 4. Solución y uso de Stellar
Texto.
## 5. Plan de trabajo y cronograma
| Entregable | Cómo se comprueba | Fecha | Responsable |
|---|---|---|---|
| Puerto simulado | Pruebas pasan | 2026-11-17 | @alumna1 |
| Pantalla | Revisión | 2026-11-24 | @alumno2 |
| Demo | Feria | 2026-12-01 | @alumna3 |
## 6. Presupuesto y personal
| Concepto | Monto |
|---|---|
| Total | $12,400 MXN |
## 7. Riesgos y viabilidad
- Si no hay señal en la comunidad, entonces llevamos la demo sin conexión.
- Si el equipo 2 se atrasa, entonces usamos datos de ejemplo.
- Si la organización no puede reunirse, entonces enviamos nota de voz.
Dictamen: Go condicionado.
## 8. Evidencia y siguientes pasos
Repositorio: https://github.com/Open-Hub-Tec/yucu-protocol. Siguiente revisión el 2026-11-20.
`;

test('propuesta bien formada cumple todas las reglas', () => {
  const r = reglasPropuesta(PROPUESTA_BUENA);
  assert.deepEqual(r.filter((x) => !x.cumple).map((x) => x.n), []);
});

test('propuesta: cada regla falla cuando falta lo que pide', () => {
  assert.equal(cumple(reglasPropuesta(PROPUESTA_BUENA.replace('$12,400 MXN y se entrega el 2026-12-01', 'poco')), 1), false);
  assert.equal(cumple(reglasPropuesta(PROPUESTA_BUENA.replace('No incluye retiros reales al banco.', '')), 3), false);
  assert.equal(cumple(reglasPropuesta(PROPUESTA_BUENA.replace('| @alumno2 |', '| |')), 5), false);
  assert.equal(cumple(reglasPropuesta(PROPUESTA_BUENA.replace('| Total | $12,400 MXN |', '| Total | $15,000 MXN |')), 6), false);
  assert.equal(cumple(reglasPropuesta(PROPUESTA_BUENA.replace('entonces usamos', 'usamos')), 7), false);
  assert.equal(cumple(reglasPropuesta(PROPUESTA_BUENA.replace('Dictamen: Go condicionado.', '')), 7), false);
  assert.equal(cumple(reglasPropuesta(PROPUESTA_BUENA.replace('https://github.com/Open-Hub-Tec/yucu-protocol', 'el repo')), 8), false);
});

test('plan de informe: reglas positivas y negativas', () => {
  const plan = `
## Destinatarios
La organización, el Product Owner (docente) y el equipo.
## Matriz de comunicación
| Qué | A quién | Cuándo |
|---|---|---|
| Avance | Organización | Viernes |
| Bloqueos | Docente | Lunes |
| Tablero | Equipo | Diario |
## Formato del informe
Avance contra lo planeado, bloqueos y decisiones que pedimos.
## Indicadores
Horas reales contra estimadas y burn-up de Projects.
## Semáforo
Verde, ámbar y rojo.
## Herramientas
GitHub Projects, issues, nota de voz por WhatsApp y hoja impresa porque hay poca conectividad.`;
  const extras = { plantilla: 'Acuerdo | Responsable | Fecha', informe: 'Semana del 2026-11-10: 3 de 5 entregables.' };
  assert.deepEqual(reglasPlan(plan, extras).filter((x) => !x.cumple).map((x) => x.n), []);
  const malo = reglasPlan('## Destinatarios\nEl docente.\n## Semáforo\nVerde y rojo.', { plantilla: 'notas', informe: 'bien' });
  assert.deepEqual(malo.filter((x) => x.cumple).map((x) => x.n), []);
  assert.equal(reglasPlan(plan).length, 7, 'sin plantilla ni informe no evalúa los criterios 8 y 9');
});

test('carta: reglas positivas y negativas', () => {
  const carta = `Los estudiantes no firman a nombre del TecNM.
## Compromisos del equipo
Entregar la demo el 2026-12-01.
Sin costo para la organización. No garantiza ventas ni ingresos. No otorga certificaciones. Yucu es un prototipo.
Aviso de privacidad: PRIVACIDAD.md. El código es MIT.
Vigencia: hasta el 2027-06-30. Se puede terminar avisando por escrito.`;
  assert.deepEqual(reglasCarta(carta).filter((x) => !x.cumple).map((x) => x.n), []);
  assert.deepEqual(reglasCarta('Carta de colaboración.').filter((x) => x.cumple).map((x) => x.n), []);
});

const ISSUE = `Encabezado

## Evidencia 1 · Propuesta Final (20 puntos)
### Criterios
- [ ] **1. Resumen ejecutivo (A).** Media página.

---

## Evidencia 2 · Plan de informe (20 puntos)
- [ ] **1. Destinatarios (A).**

---

## Evidencia 3 · Carta de entendimiento (20 puntos)
- [ ] **1. Partes (A).**`;

test('toma de la issue la rúbrica de cada entrega', () => {
  assert.match(rubricaDeIssue(ISSUE, 'Propuesta Final'), /Resumen ejecutivo/);
  assert.doesNotMatch(rubricaDeIssue(ISSUE, 'Propuesta Final'), /Destinatarios/);
  assert.match(rubricaDeIssue(ISSUE, 'Plan de informe'), /Destinatarios/);
  assert.match(rubricaDeIssue(ISSUE, 'Carta de entendimiento'), /Partes/);
  assert.equal(rubricaDeIssue('sin rúbrica', 'Plan de informe'), null);
});

test('el documento va como dato y se recorta si es muy largo', () => {
  const m = mensajesIA('Propuesta Final', 'RUBRICA', 'x'.repeat(20000));
  assert.match(m[0].content, /NO instrucciones/);
  assert.match(m[1].content, /<documento>/);
  assert.ok(m[1].content.length < 16000);
});

test('interpreta la respuesta de la IA y suma los puntos', () => {
  const criterios = Array.from({ length: 10 }, (_, i) => ({ numero: i + 1, nivel: i < 8 ? 'Excelente' : 'Bueno', razon: 'ok' }));
  const r = interpretarIA(JSON.stringify({ criterios }));
  assert.equal(r.total, 19);
  assert.match(formatearIA('Propuesta Final', r).join('\n'), /19\.0 \/ 20/);
});

test('respuesta de IA inválida se rechaza y se dice que no hay sugerencia', () => {
  assert.throws(() => interpretarIA('no es json'));
  assert.throws(() => interpretarIA(JSON.stringify({ criterios: [{ numero: 1, nivel: 'Perfecto' }] })));
  assert.match(formatearIA('Plan de informe', { error: 'sin respuesta' }).join('\n'), /no estuvo disponible/);
});
