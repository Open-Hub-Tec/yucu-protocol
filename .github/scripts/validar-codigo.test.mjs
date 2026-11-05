// Pruebas de validar-codigo.mjs. Correr con: node --test .github/scripts/validar-codigo.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarCodigo, formatearCodigo, lineasAgregadas, issuesCitadas } from './validar-codigo.mjs';

const parche = (...lineas) => ['@@ -1,1 +1,3 @@', ' contexto', ...lineas.map((l) => '+' + l)].join('\n');
const PKG = JSON.stringify({ scripts: { test: 'tsx src/tests/chain_ports.test.ts && tsx src/tests/payout.test.ts' } });

function base(extra = {}) {
  return {
    prBody: 'Resolves #112',
    archivos: [
      { path: 'src/core/chain/SimulatedChain.ts', status: 'modified', patch: parche('export class SimulatedPayout {}') },
      { path: 'src/tests/payout.test.ts', status: 'added', patch: parche("assert.equal(quote(10).source, 'simulated');") },
    ],
    packageJson: PKG,
    issues: [{ number: 112, title: '[W18] Puerto de pagos', state: 'open', assignees: ['alumna1'] }],
    autor: 'alumna1',
    autoresCommits: ['alumna1', 'alumno2'],
    revisiones: [{ login: 'alumno2', state: 'APPROVED' }],
    ...extra,
  };
}
const todoBien = (r) => r.minimos.every((m) => m.cumple);
const conArchivo = (path, ...lineas) => base({ archivos: [...base().archivos, { path, status: 'modified', patch: parche(...lineas) }] });

test('lee las líneas agregadas y las issues citadas', () => {
  assert.deepEqual(lineasAgregadas('+++ b/x\n+uno\n-dos\n tres\n+cuatro'), ['uno', 'cuatro']);
  assert.deepEqual(issuesCitadas('Resolves #112 y closes #5. Refs #9'), [112, 5]);
});

test('un PR correcto cumple', () => {
  const r = validarCodigo(base());
  assert.ok(todoBien(r), JSON.stringify(r.minimos));
  assert.equal(r.avisos.length, 0, JSON.stringify(r.avisos));
});

test('sin "Resolves #" no cumple', () => {
  assert.ok(!todoBien(validarCodigo(base({ prBody: 'Mi cambio', issues: [] }))));
});

test('código sin pruebas no cumple; solo pruebas sí', () => {
  assert.ok(!todoBien(validarCodigo(base({ archivos: [base().archivos[0]] }))));
  assert.ok(todoBien(validarCodigo(base({ archivos: [base().archivos[1]] }))));
});

test('prueba nueva que no está en package.json no cumple', () => {
  const pkg = JSON.stringify({ scripts: { test: 'tsx src/tests/chain_ports.test.ts' } });
  assert.ok(!todoBien(validarCodigo(base({ packageJson: pkg }))));
});

test('una pantalla no puede importar Stellar, la IA ni SimulatedChain', () => {
  for (const l of ["import { Keypair } from '@stellar/stellar-sdk';", "import { GoogleGenAI } from '@google/genai';", "import { SimulatedPayout } from '../core/chain/SimulatedChain';"]) {
    assert.ok(!todoBien(validarCodigo(conArchivo('src/components/MyPaymentsModal.tsx', l))), l);
  }
  assert.ok(todoBien(validarCodigo(conArchivo('src/components/MyPaymentsModal.tsx', "import { chain } from '../core/chain';"))));
  assert.ok(todoBien(validarCodigo(conArchivo('src/core/chain/StellarLive.ts', "import { Keypair } from '@stellar/stellar-sdk';"))), 'en el núcleo sí se permite');
});

test('any nuevo o @ts-ignore no cumplen; la palabra en comentarios o textos no cuenta', () => {
  assert.ok(!todoBien(validarCodigo(conArchivo('src/core/x.ts', 'const a: any = 1;'))));
  assert.ok(!todoBien(validarCodigo(conArchivo('src/core/x.ts', 'const b = c as any;'))));
  assert.ok(!todoBien(validarCodigo(conArchivo('src/core/x.ts', '// @ts-ignore'))));
  assert.ok(todoBien(validarCodigo(conArchivo('src/core/x.ts', 'const texto = "cualquier any cosa"; // no usar any'))));
});

test('secretos no cumplen', () => {
  const llave = 'S' + 'A'.repeat(55);
  assert.ok(!todoBien(validarCodigo(conArchivo('src/core/x.ts', `const k = '${llave}';`))));
  assert.ok(!todoBien(validarCodigo(conArchivo('src/core/x.ts', 'const g = "AIza' + 'b'.repeat(35) + '";'))));
  assert.ok(todoBien(validarCodigo(conArchivo('src/core/x.ts', 'const k = process.env.GEMINI_API_KEY;'))));
});

test('número de control o CURP no cumplen', () => {
  assert.ok(!todoBien(validarCodigo(conArchivo('src/data/x.ts', "const id = '23620107';"))));
  assert.ok(!todoBien(validarCodigo(conArchivo('src/data/x.ts', "const c = 'GOMC800101HOCRRR09';"))));
});

test('porcentajes a mano y hashes inventados solo avisan', () => {
  const r1 = validarCodigo(conArchivo('src/components/Cobro.tsx', 'const comision = 0.05;'));
  assert.ok(todoBien(r1));
  assert.ok(r1.avisos.some((a) => a.includes('protocolFees')));
  const r2 = validarCodigo(conArchivo('src/components/Pasaporte.tsx', `const hash = '${'a'.repeat(64)}';`));
  assert.ok(r2.avisos.some((a) => a.includes('SimulatedChain.ts')));
  const r3 = validarCodigo(conArchivo('src/config/protocolFees.ts', 'export const COMISION = 0.05;'));
  assert.ok(!r3.avisos.some((a) => a.includes('protocolFees')), 'en protocolFees.ts está bien');
});

test('avisa si no está asignado, si la issue no es W* o si agrega dependencias', () => {
  assert.ok(validarCodigo(base({ autor: 'otra' })).avisos.some((a) => a.includes('is not assigned')));
  assert.ok(validarCodigo(base({ issues: [{ number: 5, title: 'Arreglo', state: 'open', assignees: [] }], prBody: 'Resolves #5' })).avisos.some((a) => a.includes('not a W*')));
  const dep = validarCodigo(base({ archivos: [...base().archivos, { path: 'package.json', status: 'modified', patch: parche('    "left-pad": "^1.3.0",') }] }));
  assert.ok(dep.avisos.some((a) => a.includes('dependencies')));
});

test('el comentario lleva la marca y el resultado', () => {
  const { cumple, texto } = formatearCodigo(validarCodigo(base()));
  assert.ok(cumple);
  assert.match(texto, /validar-codigo/);
  assert.match(texto, /Passes the fixed rules/);
});
