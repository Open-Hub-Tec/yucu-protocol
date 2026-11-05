// Validación automática de los PR de código (Unidad 5 y cualquier issue W*).
// Revisa las reglas fijas de AGENTS.md en las líneas que agrega el PR.
// No sustituye al CI (lint, pruebas y build) ni a la revisión del docente.
//
// Este módulo no llama a GitHub: recibe los datos ya leídos y devuelve el resultado.
// Pruebas: node --test .github/scripts/validar-codigo.test.mjs

export const MARCA_CODIGO = '<!-- validar-codigo -->';

const ES_CODIGO = /\.(ts|tsx|js|jsx|mjs)$/;
const ES_PRUEBA = /^src\/tests\/.+\.test\.(ts|tsx)$/;
// Pantallas: solo pueden hablar con los puertos (AGENTS.md, regla 4).
const ES_UI = /^src\/(components\/|hooks\/|App\.tsx$|main\.tsx$)/;
const IMPORTS_PROHIBIDOS_UI = [
  [/['"]@stellar\/stellar-sdk['"]/, '`@stellar/stellar-sdk`'],
  [/['"]@google\/genai['"]/, 'the AI provider (`@google/genai`)'],
  [/SimulatedChain['"]/, '`SimulatedChain` (use `chain` from `src/core/chain`)'],
  [/trustless/i, 'Trustless Work directly'],
];
const RE_ANY = /(:\s*any\b|\bas\s+any\b|<any>|\bany\[\])/;
const RE_TS_IGNORE = /@ts-(ignore|nocheck)/;
const SECRETOS = [
  [/\bS[A-Z2-7]{55}\b/, 'a Stellar secret key (`S…`)'],
  [/AIza[0-9A-Za-z_-]{35}/, 'a Google/Gemini API key'],
  [/GEMINI_API_KEY\s*[:=]\s*['"][^'"\s]{8,}/, 'a `GEMINI_API_KEY` value'],
];
const RE_CONTROL = /(?<![\w])[A-Za-z]?\d{2}620\d{3}(?![\w])/;
const RE_CURP = /\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/;
const RE_PORCENTAJE = /(fee|comisi|commission|royalt|regal|tequio)\w*[^\n]*?(\b0?\.\d+\b|\b\d+(\.\d+)?\s*%)/i;
const RE_HASH_LITERAL = /['"`][a-f0-9]{64}['"`]/i;

/** Líneas que agrega un parche unificado (sin el "+"). */
export function lineasAgregadas(patch) {
  if (!patch) return [];
  return patch.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
}

/** Números de issue que el PR dice resolver. */
export function issuesCitadas(body) {
  return [...(body || '').matchAll(/\b(resolves|closes|fixes)\s+#(\d+)/gi)].map((m) => Number(m[2]));
}

/**
 * @param {object} d
 * @param {string} d.prBody
 * @param {{path:string,status:string,patch?:string}[]} d.archivos
 * @param {string|null} d.packageJson      package.json de la rama del PR.
 * @param {{number:number,title:string,state:string,assignees:string[]}[]} d.issues  Issues citadas.
 * @param {string} d.autor
 * @param {string[]} d.autoresCommits
 * @param {{login:string,state:string}[]} d.revisiones
 */
export function validarCodigo(d) {
  const minimos = [];
  const avisos = [];
  const ok = (cumple, texto) => minimos.push({ cumple, texto });
  const vivos = d.archivos.filter((a) => a.status !== 'removed');

  // 1. Ligado a una issue.
  const citadas = issuesCitadas(d.prBody);
  ok(citadas.length > 0, citadas.length
    ? `The PR resolves ${citadas.map((n) => '#' + n).join(', ')}.`
    : 'The PR description must say `Resolves #<number>` with the issue it resolves.');
  const w = d.issues.filter((i) => /^\[W\d+\]/.test(i.title));
  if (citadas.length && !w.length) avisos.push('The cited issue is not a W* issue. If this is course work, cite your W* issue.');
  for (const i of w) {
    if (i.state !== 'open') avisos.push(`Issue #${i.number} is already closed.`);
    if (!i.assignees.includes(d.autor)) avisos.push(`\`${d.autor}\` is not assigned to #${i.number}. Ask a maintainer to assign you before you start coding.`);
  }

  // 2. Pruebas.
  const codigo = vivos.filter((a) => a.path.startsWith('src/') && ES_CODIGO.test(a.path) && !a.path.startsWith('src/tests/'));
  const pruebas = vivos.filter((a) => ES_PRUEBA.test(a.path));
  if (codigo.length) {
    ok(pruebas.length > 0, pruebas.length
      ? `Includes tests: ${pruebas.map((a) => '`' + a.path + '`').join(', ')}.`
      : 'The PR changes code in `src/` but adds or changes no tests in `src/tests/`. AGENTS.md asks for a positive and a negative test for every new rule.');
  }
  const nuevas = pruebas.filter((a) => a.status === 'added');
  if (nuevas.length) {
    let script = '';
    try { script = JSON.parse(d.packageJson || '{}')?.scripts?.test || ''; } catch { script = ''; }
    const faltan = nuevas.filter((a) => !script.includes(a.path));
    ok(faltan.length === 0, faltan.length
      ? `These new tests are not in the \`test\` script of \`package.json\`, so they would never run: ${faltan.map((a) => '`' + a.path + '`').join(', ')}.`
      : 'The new tests are in the `test` script of `package.json`.');
  }

  // 3. Reglas sobre las líneas agregadas.
  const hallazgos = { ui: [], any: [], ignore: [], secreto: [], privacidad: [], porcentaje: [], hash: [] };
  for (const a of vivos) {
    if (a.patch === undefined && ES_CODIGO.test(a.path)) {
      avisos.push(`GitHub did not show the changes of \`${a.path}\` (file too large); it was not checked.`);
      continue;
    }
    const lineas = lineasAgregadas(a.patch);
    const esPrueba = a.path.startsWith('src/tests/');
    for (const l of lineas) {
      if (ES_UI.test(a.path) && /\b(import|require)\b/.test(l)) {
        for (const [re, nombre] of IMPORTS_PROHIBIDOS_UI) if (re.test(l)) hallazgos.ui.push(`\`${a.path}\` imports ${nombre}`);
      }
      if (/\.(ts|tsx)$/.test(a.path)) {
        if (RE_ANY.test(l.replace(/\/\/.*$/, ''))) hallazgos.any.push(a.path);
        if (RE_TS_IGNORE.test(l)) hallazgos.ignore.push(a.path);
      }
      for (const [re, nombre] of SECRETOS) if (re.test(l)) hallazgos.secreto.push(`\`${a.path}\`: ${nombre}`);
      if (RE_CONTROL.test(l) || RE_CURP.test(l)) hallazgos.privacidad.push(a.path);
      if (!esPrueba && a.path !== 'src/config/protocolFees.ts' && ES_CODIGO.test(a.path) && RE_PORCENTAJE.test(l)) hallazgos.porcentaje.push(a.path);
      if (!esPrueba && !a.path.endsWith('SimulatedChain.ts') && RE_HASH_LITERAL.test(l)) hallazgos.hash.push(a.path);
    }
  }
  const unicos = (xs) => [...new Set(xs)];
  ok(!hallazgos.ui.length, hallazgos.ui.length
    ? `Screens only talk to the ports (AGENTS.md, rule 4): ${unicos(hallazgos.ui).join('; ')}.`
    : 'No screen imports Stellar, Trustless Work, the AI provider or `SimulatedChain` directly.');
  ok(!hallazgos.any.length && !hallazgos.ignore.length, hallazgos.any.length || hallazgos.ignore.length
    ? `Strict TypeScript: there are ${hallazgos.any.length ? 'new `any` in ' + unicos(hallazgos.any).map((p) => '`' + p + '`').join(', ') : ''}${hallazgos.any.length && hallazgos.ignore.length ? ' and ' : ''}${hallazgos.ignore.length ? '`@ts-ignore` in ' + unicos(hallazgos.ignore).map((p) => '`' + p + '`').join(', ') : ''}.`
    : 'No new `any` and no `@ts-ignore`.');
  ok(!hallazgos.secreto.length, hallazgos.secreto.length
    ? `Possible secrets in the code: ${unicos(hallazgos.secreto).join('; ')}. They belong in \`.env\`, never in the repo. If a real key was pushed, it must be rotated.`
    : 'No keys or secrets.');
  ok(!hallazgos.privacidad.length, hallazgos.privacidad.length
    ? `Possible student control numbers or CURP in: ${unicos(hallazgos.privacidad).map((p) => '`' + p + '`').join(', ')}.`
    : 'No student control numbers or CURP.');
  if (hallazgos.porcentaje.length) avisos.push(`Fees or percentages seem to be hard-coded in ${unicos(hallazgos.porcentaje).map((p) => '`' + p + '`').join(', ')}. They must come from \`src/config/protocolFees.ts\` (AGENTS.md, rule 7).`);
  if (hallazgos.hash.length) avisos.push(`Hard-coded 64-character hashes in ${unicos(hallazgos.hash).map((p) => '`' + p + '`').join(', ')}. Only \`SimulatedChain.ts\` may invent results, and with \`source: 'simulated'\` (rule 3).`);

  // 4. Otros avisos.
  if (vivos.some((a) => a.path === 'package.json' && /^\+\s*"[^"]+":\s*"[\^~]?\d/m.test(a.patch || ''))) {
    avisos.push('The PR seems to add or change dependencies in `package.json`. Explain in the PR why they are needed.');
  }
  if (vivos.some((a) => a.path.startsWith('contracts/'))) {
    avisos.push('It touches `contracts/`: run `cargo fmt --all`, `cargo clippy --locked --all-targets -- -D warnings` and `cargo test --locked`.');
  }

  const conteo = {};
  for (const a of d.autoresCommits) conteo[a || '(no GitHub account)'] = (conteo[a || '(no GitHub account)'] || 0) + 1;
  const aprobaron = [...new Set(d.revisiones.filter((r) => r.state === 'APPROVED' && r.login !== d.autor).map((r) => r.login))];
  if (!aprobaron.length) avisos.push('Nobody else has approved the PR yet. Ask a teammate or another contributor for a review.');

  return { minimos, avisos, conteo, aprobaron, citadas };
}

export function formatearCodigo(r) {
  const cumple = r.minimos.every((m) => m.cumple);
  const l = [MARCA_CODIGO, '## Automated check · AGENTS.md rules', ''];
  l.push(cumple
    ? '✅ **Passes the fixed rules.** CI (lint, tests and build) must also be green, and a maintainer will review it.'
    : '❌ **Does not pass the fixed rules.** Fix it on this same branch; the check runs again on every push.');
  l.push('', '### Rules', ...r.minimos.map((m) => `- ${m.cumple ? '✅' : '❌'} ${m.texto}`));
  l.push('', '### Contributors', ...Object.entries(r.conteo).map(([u, n]) => `- \`${u}\`: ${n} commit(s)`));
  if (r.aprobaron.length) l.push(`- Approved by: ${r.aprobaron.map((u) => '`' + u + '`').join(', ')}`);
  if (r.avisos.length) l.push('', '### Warnings (not blocking)', ...r.avisos.map((a) => `- ⚠️ ${a}`));
  l.push('', '---', '*This check only covers fixed rules from [AGENTS.md](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/AGENTS.md). Before asking for review, run `npm run lint`, `npm test` and `npm run build`. In the review you will have to explain your code.*');
  return { cumple, texto: l.join('\n') };
}
