// Pruebas de validar-uml.mjs. Correr con: node --test .github/scripts/validar-uml.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validarUml, formatearUml, nombreBase, tipoDeIssue, nombresExigidos, elementosDeTabla, medidasPng, archivosPermitidos,
} from './validar-uml.mjs';

/** Cabecera de un PNG de ancho × alto (firma + bloque IHDR). */
function cabeceraPng(ancho, alto) {
  const b = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52];
  for (const n of [ancho, alto]) b.push((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255);
  return b;
}

const ISSUE_SEQ = {
  number: 263,
  title: '[uml] Sequence diagram: register a lot by voice',
  state: 'open',
  assignees: ['alumna1'],
  body: [
    '2. Draw the diagram and add `docs/uml/seq-registrar-lote-por-voz.md` and `docs/uml/img/seq-registrar-lote-por-voz.png`.',
    '',
    '### It must include',
    '',
    '* Participants: person, app (chat screen), AI service, `WalletPort`, `LotRegistryPort`.',
    '* Show the pattern (`prepareRegisterLot`, signature, `submit`).',
    '* Read `SyncEngine.ts`; mark `source: \'simulated\'` and `<DemoBadge />`; use `LotRegistryPort.getLot`.',
    '',
    '## Sources',
    '',
    '* [`src/core/chain/ports.ts`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/core/chain/ports.ts)',
  ].join('\n'),
};

const MD_BIEN = [
  '# Sequence diagram: register a lot by voice',
  '',
  'The person speaks, the AI prepares a draft, the person signs on the phone and the lot is sent.',
  '',
  '![Sequence diagram: register a lot by voice](img/seq-registrar-lote-por-voz.png)',
  '',
  '## Elements',
  '',
  '| Element | Kind | Source |',
  '|---|---|---|',
  '| Person | actor | ADR-007 |',
  '| `WalletPort` | participant | `src/core/chain/ports.ts` |',
  '| `LotRegistryPort` | participant | `src/core/chain/ports.ts` |',
  '| `prepareRegisterLot` | message | `src/core/chain/ports.ts` |',
  '| `submit` | message | `src/core/chain/ports.ts` |',
  '| `getLot` | message | `src/core/chain/ports.ts` |',
  '',
  '## Sources',
  '',
  '- [ports.ts](../../src/core/chain/ports.ts)',
].join('\n');

const FUENTES = 'export interface LotRegistryPort { prepareRegisterLot(); submit(); getLot(); } export type WalletPort = DeviceWalletPort;';

function base(extra = {}) {
  return {
    prBody: 'Resolves #263',
    autor: 'alumna1',
    archivos: [
      { path: 'docs/uml/seq-registrar-lote-por-voz.md', status: 'added' },
      { path: 'docs/uml/img/seq-registrar-lote-por-voz.png', status: 'added' },
    ],
    issues: [ISSUE_SEQ],
    textos: { 'docs/uml/seq-registrar-lote-por-voz.md': MD_BIEN },
    binarios: { 'docs/uml/img/seq-registrar-lote-por-voz.png': { size: 180_000, cabecera: cabeceraPng(1122, 631) } },
    fuentes: FUENTES,
    atraso: 0,
    ...extra,
  };
}
const todoBien = (r) => r.minimos.every((m) => m.cumple);
const fallas = (r) => r.minimos.filter((m) => !m.cumple).map((m) => m.texto).join(' | ');

test('lee el nombre, el tipo y los archivos permitidos', () => {
  assert.equal(nombreBase(ISSUE_SEQ.body), 'seq-registrar-lote-por-voz');
  assert.equal(nombreBase('See [`docs/uml/README.md`](x) and create `docs/uml/clases-escrow.md`.'), 'clases-escrow', 'ignora la guía README');
  assert.equal(tipoDeIssue('[uml] Class diagram: escrow'), 'diagrama');
  assert.equal(tipoDeIssue('[docs] Requirements from ADR-002'), 'documento');
  assert.equal(tipoDeIssue('[W12] Algo'), 'otro');
  assert.deepEqual(archivosPermitidos('x', 'documento'), { obligatorios: ['docs/uml/x.md'], opcionales: [] });
});

test('nombres exigidos: ignora rutas, archivos y código suelto; toma el método de A.b', () => {
  assert.deepEqual(nombresExigidos(ISSUE_SEQ.body), ['WalletPort', 'LotRegistryPort', 'prepareRegisterLot', 'submit', 'getLot']);
});

test('tabla Elements: cuenta filas y lee los nombres de la primera columna', () => {
  const t = elementosDeTabla(MD_BIEN);
  assert.equal(t.filas, 6);
  assert.deepEqual(t.nombres, ['WalletPort', 'LotRegistryPort', 'prepareRegisterLot', 'submit', 'getLot']);
  assert.equal(elementosDeTabla('# Sin tabla'), null);
});

test('medidas de un PNG', () => {
  assert.deepEqual(medidasPng(cabeceraPng(1122, 631)), { ancho: 1122, alto: 631 });
  assert.equal(medidasPng([0xff, 0xd8, 0xff, 0xe0, ...Array(20).fill(0)]), null, 'un JPG no es PNG');
});

test('un PR de diagrama correcto cumple y no deja avisos', () => {
  const r = validarUml(base());
  assert.ok(todoBien(r), fallas(r));
  assert.equal(r.avisos.length, 0, JSON.stringify(r.avisos));
  assert.ok(formatearUml(r).texto.includes('✅ **Cumple'));
});

test('el XMI opcional se acepta si es XML', () => {
  const r = validarUml(base({
    archivos: [...base().archivos, { path: 'docs/uml/modelos/seq-registrar-lote-por-voz.xmi', status: 'added' }],
    binarios: { ...base().binarios, 'docs/uml/modelos/seq-registrar-lote-por-voz.xmi': { size: 40_000, inicio: '<?xml version="1.0"?><xmi:XMI>' } },
  }));
  assert.ok(todoBien(r), fallas(r));
});

test('sin "Resolves #" no cumple', () => {
  assert.ok(!todoBien(validarUml(base({ prBody: 'Mi diagrama', issues: [] }))));
});

test('sin la imagen PNG no cumple', () => {
  const r = validarUml(base({ archivos: [base().archivos[0]], binarios: {} }));
  assert.ok(!todoBien(r));
  assert.match(fallas(r), /Faltan archivos/);
});

test('subir el proyecto de Enterprise Architect u otro archivo no cumple', () => {
  const r = validarUml(base({ archivos: [...base().archivos, { path: 'docs/uml/seq-registrar-lote-por-voz.qea', status: 'added' }] }));
  assert.ok(!todoBien(r));
  assert.match(fallas(r), /no se suben/);
  const r2 = validarUml(base({ archivos: [...base().archivos, { path: 'README.md', status: 'modified' }] }));
  assert.ok(!todoBien(r2));
});

test('una imagen angosta, pesada o que no es PNG no cumple', () => {
  const png = 'docs/uml/img/seq-registrar-lote-por-voz.png';
  assert.ok(!todoBien(validarUml(base({ binarios: { [png]: { size: 50_000, cabecera: cabeceraPng(500, 300) } } }))));
  assert.ok(!todoBien(validarUml(base({ binarios: { [png]: { size: 4 * 1048576, cabecera: cabeceraPng(1200, 800) } } }))));
  assert.ok(!todoBien(validarUml(base({ binarios: { [png]: { size: 50_000, cabecera: [0xff, 0xd8, ...Array(22).fill(0)] } } }))));
});

test('sin insertar la imagen, sin tabla o sin fuentes no cumple', () => {
  const md = 'docs/uml/seq-registrar-lote-por-voz.md';
  assert.ok(!todoBien(validarUml(base({ textos: { [md]: MD_BIEN.replace(/!\[.*\n/, '') } }))));
  assert.ok(!todoBien(validarUml(base({ textos: { [md]: MD_BIEN.replace('## Elements', '## Elementos del dibujo') } }))));
  assert.ok(!todoBien(validarUml(base({ textos: { [md]: MD_BIEN.split('## Sources')[0] } }))));
});

test('si falta un elemento que pide la issue no cumple', () => {
  const md = 'docs/uml/seq-registrar-lote-por-voz.md';
  const r = validarUml(base({ textos: { [md]: MD_BIEN.replace('| `submit` | message | `src/core/chain/ports.ts` |\n', '') } }));
  assert.ok(!todoBien(r));
  assert.match(fallas(r), /`submit`/);
});

test('un nombre que no está en las fuentes solo avisa', () => {
  const md = 'docs/uml/seq-registrar-lote-por-voz.md';
  const r = validarUml(base({ textos: { [md]: MD_BIEN.replace('| `getLot` |', '| `getLot` | message | x |\n| `verifyWithBlockchainOracle` |') } }));
  assert.ok(todoBien(r), fallas(r));
  assert.match(r.avisos.join(' '), /verifyWithBlockchainOracle/);
});

test('afirmaciones, hashes y datos personales no cumplen', () => {
  const md = 'docs/uml/seq-registrar-lote-por-voz.md';
  assert.ok(!todoBien(validarUml(base({ textos: { [md]: MD_BIEN + '\nThe contract is audited.' } }))));
  assert.ok(!todoBien(validarUml(base({ textos: { [md]: MD_BIEN + '\nhash ' + 'a'.repeat(64) } }))));
  assert.ok(!todoBien(validarUml(base({ textos: { [md]: MD_BIEN + '\nAlumna 99620001' } }))));
});

test('no estar asignado, una rama atrasada o un bloque Mermaid solo avisan', () => {
  const md = 'docs/uml/seq-registrar-lote-por-voz.md';
  const r = validarUml(base({ autor: 'otro', atraso: 35, textos: { [md]: MD_BIEN + '\n```mermaid\nsequenceDiagram\n```' } }));
  assert.ok(todoBien(r), fallas(r));
  assert.equal(r.avisos.length, 3, JSON.stringify(r.avisos));
});

test('una issue que no es de docs/uml no cumple', () => {
  const r = validarUml(base({ issues: [{ number: 112, title: '[W18] Puerto de pagos', state: 'open', assignees: [], body: 'código' }] }));
  assert.ok(!todoBien(r));
});

test('documento de requisitos: pide 8 requisitos RF y RNF', () => {
  const issue = { number: 283, title: '[docs] Requirements from ADR-002 (offline-first PWA)', state: 'open', assignees: ['alumno2'], body: 'Create `docs/uml/requisitos-adr-002.md` with tables.' };
  const filas = (pref, n) => Array.from({ length: n }, (_, i) => `| ${pref}-0${i + 1} | The system must keep working without signal for the step number ${i + 1} of the registration flow. | ADR-002 D${i + 1} |`).join('\n');
  const doc = (rf, rnf) => `# Requirements from ADR-002\n\nFunctional and non-functional requirements taken from ADR-002, written so that each one can be checked by a test or a manual check.\n\n| ID | Requirement | Source |\n|---|---|---|\n${filas('RF', rf)}\n\n| ID | Requirement | Source |\n|---|---|---|\n${filas('RNF', rnf)}\n`;
  const datos = (texto) => ({
    prBody: 'Resolves #283', autor: 'alumno2', issues: [issue], fuentes: '', atraso: 0, binarios: {},
    archivos: [{ path: 'docs/uml/requisitos-adr-002.md', status: 'added' }],
    textos: { 'docs/uml/requisitos-adr-002.md': texto },
  });
  const bien = validarUml(datos(doc(5, 3)));
  assert.ok(todoBien(bien), fallas(bien));
  assert.ok(!todoBien(validarUml(datos(doc(4, 2)))), 'con 6 requisitos no cumple');
  assert.ok(!todoBien(validarUml(datos(doc(8, 0)))), 'sin no funcionales no cumple');
});
