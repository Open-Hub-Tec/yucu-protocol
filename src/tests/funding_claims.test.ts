// Issue #246: la app y los pitch decks no prometen becas, montos ni "Drips Splits".
// Ver docs/drips/FUNDING_POLICY.md y la regla 8 de AGENTS.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const leer = (ruta: string) => readFileSync(fileURLToPath(new URL(`../../${ruta}`, import.meta.url)), 'utf-8');

const ARCHIVOS = [
  'src/components/KnowledgeBaseModal.tsx',
  'src/components/ExplainerVideoModal.tsx',
  'scripts/generate_pitch_deck.ts',
  'scripts/generate_pitch_deck_es.ts',
];

/** Devuelve las promesas de financiamiento estudiantil que encuentre en el texto. */
function promesasDeFinanciamiento(texto: string): string[] {
  const patrones = [/beca/i, /scholarship/i, /drips\s+splits/i, /\d+\s*USDC\s*·\s*Residencia/i];
  return patrones.filter((re) => re.test(texto)).map((re) => re.source);
}

test('detecta los textos que la issue #246 pide quitar', () => {
  assert.ok(promesasDeFinanciamiento('🎓 Becas &amp; TecNM').length > 0);
  assert.ok(promesasDeFinanciamiento('Beca: 120 USDC · Residencia').length > 0);
  assert.ok(promesasDeFinanciamiento("{ role: 'Gobernanza & Drips Splits:' }").length > 0);
});

test('no marca el texto nuevo basado en FUNDING_POLICY.md', () => {
  const nuevo =
    'Estudiantes del TecNM Campus Tlaxiaco programan Yucu como parte de sus materias. ' +
    'Si una issue forma parte de Drips Wave, Drips le paga directamente a quien la resolvió.';
  assert.deepEqual(promesasDeFinanciamiento(nuevo), []);
});

for (const ruta of ARCHIVOS) {
  test(`${ruta} no promete becas, montos ni Drips Splits`, () => {
    assert.deepEqual(promesasDeFinanciamiento(leer(ruta)), []);
  });
}

test('la pestaña de la base de conocimiento se llama "Estudiantes TecNM"', () => {
  const modal = leer('src/components/KnowledgeBaseModal.tsx');
  assert.match(modal, /Estudiantes TecNM/);
  assert.match(modal, /activeTab === 'estudiantes'/);
});
