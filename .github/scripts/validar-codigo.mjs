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
  [/['"]@google\/genai['"]/, 'el proveedor de IA (`@google/genai`)'],
  [/SimulatedChain['"]/, '`SimulatedChain` (usen `chain` de `src/core/chain`)'],
  [/trustless/i, 'Trustless Work directamente'],
];
const RE_ANY = /(:\s*any\b|\bas\s+any\b|<any>|\bany\[\])/;
const RE_TS_IGNORE = /@ts-(ignore|nocheck)/;
const SECRETOS = [
  [/\bS[A-Z2-7]{55}\b/, 'una llave secreta de Stellar (`S…`)'],
  [/AIza[0-9A-Za-z_-]{35}/, 'una llave de Google/Gemini'],
  [/GEMINI_API_KEY\s*[:=]\s*['"][^'"\s]{8,}/, 'un valor de `GEMINI_API_KEY`'],
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

/** Convierte un patrón como "src/tests/**\/*.test.ts" en una expresión regular. */
export function globARegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      i++;
      if (glob[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*';
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
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
    ? `El PR dice resolver ${citadas.map((n) => '#' + n).join(', ')}.`
    : 'La descripción del PR debe decir `Resolves #<número>` con la issue que resuelve.');
  const w = d.issues.filter((i) => /^\[W\d+\]/.test(i.title));
  if (citadas.length && !w.length) avisos.push('La issue citada no es una W*. Si es trabajo de clase de la Unidad 5, citen su issue W*.');
  for (const i of w) {
    if (i.state !== 'open') avisos.push(`La issue #${i.number} ya está cerrada.`);
    if (!i.assignees.includes(d.autor)) avisos.push(`\`${d.autor}\` no está asignado a #${i.number}. Pidan al docente que los asigne antes de programar.`);
  }

  // 2. Pruebas.
  const codigo = vivos.filter((a) => a.path.startsWith('src/') && ES_CODIGO.test(a.path) && !a.path.startsWith('src/tests/'));
  const pruebas = vivos.filter((a) => ES_PRUEBA.test(a.path));
  if (codigo.length) {
    ok(pruebas.length > 0, pruebas.length
      ? `Trae pruebas: ${pruebas.map((a) => '`' + a.path + '`').join(', ')}.`
      : 'El PR cambia código en `src/` pero no agrega ni cambia pruebas en `src/tests/`. AGENTS.md pide una prueba positiva y una negativa por cada regla nueva.');
  }
  const nuevas = pruebas.filter((a) => a.status === 'added');
  if (nuevas.length) {
    let script = '';
    try { script = JSON.parse(d.packageJson || '{}')?.scripts?.test || ''; } catch { script = ''; }
    // El script puede listar archivos o usar un patrón como "src/tests/**/*.test.ts".
    const patrones = (script.match(/[^\s"']*\*[^\s"']*/g) || []).map(globARegex);
    const faltan = nuevas.filter((a) => !script.includes(a.path) && !patrones.some((re) => re.test(a.path)));
    ok(faltan.length === 0, faltan.length
      ? `Estas pruebas nuevas no están en el script \`test\` de \`package.json\`, así que no se ejecutarían: ${faltan.map((a) => '`' + a.path + '`').join(', ')}.`
      : 'Las pruebas nuevas están en el script `test` de `package.json`.');
  }

  // 3. Reglas sobre las líneas agregadas.
  const hallazgos = { ui: [], any: [], ignore: [], secreto: [], privacidad: [], porcentaje: [], hash: [] };
  for (const a of vivos) {
    if (a.patch === undefined && ES_CODIGO.test(a.path)) {
      avisos.push(`GitHub no mostró los cambios de \`${a.path}\` (archivo muy grande); no lo revisé.`);
      continue;
    }
    const lineas = lineasAgregadas(a.patch);
    const esPrueba = a.path.startsWith('src/tests/');
    for (const l of lineas) {
      if (ES_UI.test(a.path) && /\b(import|require)\b/.test(l)) {
        for (const [re, nombre] of IMPORTS_PROHIBIDOS_UI) if (re.test(l)) hallazgos.ui.push(`\`${a.path}\` importa ${nombre}`);
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
    ? `Las pantallas solo hablan con los puertos (AGENTS.md, regla 4): ${unicos(hallazgos.ui).join('; ')}.`
    : 'Ninguna pantalla importa Stellar, Trustless Work, la IA ni `SimulatedChain` directamente.');
  ok(!hallazgos.any.length && !hallazgos.ignore.length, hallazgos.any.length || hallazgos.ignore.length
    ? `TypeScript estricto: hay ${hallazgos.any.length ? '`any` nuevos en ' + unicos(hallazgos.any).map((p) => '`' + p + '`').join(', ') : ''}${hallazgos.any.length && hallazgos.ignore.length ? ' y ' : ''}${hallazgos.ignore.length ? '`@ts-ignore` en ' + unicos(hallazgos.ignore).map((p) => '`' + p + '`').join(', ') : ''}.`
    : 'Sin `any` nuevos ni `@ts-ignore`.');
  ok(!hallazgos.secreto.length, hallazgos.secreto.length
    ? `Hay posibles secretos en el código: ${unicos(hallazgos.secreto).join('; ')}. Van en \`.env\`, nunca en el repo. Si ya se subió una llave real, hay que cambiarla.`
    : 'Sin llaves ni secretos.');
  ok(!hallazgos.privacidad.length, hallazgos.privacidad.length
    ? `Posibles números de control o CURP en: ${unicos(hallazgos.privacidad).map((p) => '`' + p + '`').join(', ')}.`
    : 'Sin números de control ni CURP.');
  if (hallazgos.porcentaje.length) avisos.push(`Parece haber comisiones o porcentajes escritos a mano en ${unicos(hallazgos.porcentaje).map((p) => '`' + p + '`').join(', ')}. Deben salir de \`src/config/protocolFees.ts\` (AGENTS.md, regla 7).`);
  if (hallazgos.hash.length) avisos.push(`Hay hashes de 64 caracteres escritos a mano en ${unicos(hallazgos.hash).map((p) => '`' + p + '`').join(', ')}. Solo \`SimulatedChain.ts\` puede inventar resultados, y con \`source: 'simulated'\` (regla 3).`);

  // 4. Otros avisos.
  if (vivos.some((a) => a.path === 'package.json' && /^\+\s*"[^"]+":\s*"[\^~]?\d/m.test(a.patch || ''))) {
    avisos.push('El PR parece agregar o cambiar dependencias en `package.json`. Expliquen en el PR por qué hacen falta.');
  }
  if (vivos.some((a) => a.path.startsWith('contracts/'))) {
    avisos.push('Toca `contracts/`: corran `cargo fmt --all`, `cargo clippy --locked --all-targets -- -D warnings` y `cargo test --locked`.');
  }

  const conteo = {};
  for (const a of d.autoresCommits) conteo[a || '(sin cuenta de GitHub)'] = (conteo[a || '(sin cuenta de GitHub)'] || 0) + 1;
  const aprobaron = [...new Set(d.revisiones.filter((r) => r.state === 'APPROVED' && r.login !== d.autor).map((r) => r.login))];
  if (!aprobaron.length) avisos.push('Todavía nadie más aprobó el PR. Pidan revisión a otro integrante o al equipo pareja.');

  return { minimos, avisos, conteo, aprobaron, citadas };
}

export function formatearCodigo(r) {
  const cumple = r.minimos.every((m) => m.cumple);
  const l = [MARCA_CODIGO, '## Revisión automática · reglas de AGENTS.md', ''];
  l.push(cumple
    ? '✅ **Cumple las reglas fijas.** Falta que el CI (lint, pruebas y build) salga en verde y la revisión del docente.'
    : '❌ **No cumple las reglas fijas.** Corríjanlo en esta misma rama; la revisión se repite sola con cada push.');
  l.push('', '### Reglas', ...r.minimos.map((m) => `- ${m.cumple ? '✅' : '❌'} ${m.texto}`));
  l.push('', '### Trabajo en equipo', ...Object.entries(r.conteo).map(([u, n]) => `- \`${u}\`: ${n} commit(s)`));
  if (r.aprobaron.length) l.push(`- Aprobado por: ${r.aprobaron.map((u) => '`' + u + '`').join(', ')}`);
  if (r.avisos.length) l.push('', '### Avisos (no bloquean)', ...r.avisos.map((a) => `- ⚠️ ${a}`));
  l.push('', '---', '*Esta revisión solo comprueba reglas fijas de [AGENTS.md](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/AGENTS.md). Antes de pedir revisión, corran `npm run lint`, `npm test` y `npm run build`. En la revisión tendrán que explicar su código.*');
  return { cumple, texto: l.join('\n') };
}
