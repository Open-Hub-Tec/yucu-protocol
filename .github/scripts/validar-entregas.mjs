// Validación automática de las entregas del Sprint 4 (Gestión de Proyectos, TecNM).
// Solo revisa requisitos mínimos y reglas fijas. La calificación con la rúbrica
// la hacen la revisión cruzada y el docente.
//
// Este módulo no llama a GitHub: recibe los datos ya leídos y devuelve el resultado.
// Así se puede probar con `node --test .github/scripts/validar-entregas.test.mjs`.

import { reglasPropuesta, reglasPlan, reglasCarta, formatearReglas, formatearIA } from './rubrica.mjs';

export const MARCA = '<!-- validar-entregas-sprint4 -->';

/** Archivo principal de cada entrega y etiqueta de su sub-issue. */
export const ARCHIVO_DE_ENTREGA = { 'Propuesta Final': 'propuesta.md', 'Plan de informe': 'plan-de-informe.md', 'Carta de entendimiento': 'carta.md' };
export const ETIQUETA_DE_ENTREGA = { 'entrega-propuesta': 'Propuesta Final', 'entrega-plan': 'Plan de informe', 'entrega-carta': 'Carta de entendimiento' };

const EXT_PROHIBIDAS = /\.(pdf|jpe?g|png|gif|webp|heic|svg|bmp|tiff?|mp3|m4a|ogg|opus|wav|aac|mp4|mov|webm|avi|3gp|docx?|xlsx?|pptx?|odt|zip|rar|7z)$/i;

// Número de control del TecNM Tlaxiaco: dos dígitos del año + 620 + tres dígitos (con letra opcional).
const RE_CONTROL = /(?<![\w])[A-Za-z]?\d{2}620\d{3}(?![\w])/g;
// Teléfono de 10 dígitos, con o sin +52 y separadores.
const RE_TELEFONO = /(?<![\d.,])(?:\+?52[\s.-]?)?(?:\d[\s.-]?){9}\d(?![\d.,])/g;
const RE_CURP = /\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/g;
const RE_CORREO = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const RE_SHA256 = /\b[a-f0-9]{64}\b/gi;
const FRASES_DE_MAS = ['en produccion', 'auditado', 'auditada', 'certificado oficial', 'certificacion oficial'];

const SECCIONES_PROPUESTA = [
  ['Resumen ejecutivo', /resumen ejecutivo/],
  ['Problema y contexto', /problema/],
  ['Objetivo SMART y alcance', /objetivo/],
  ['Solución y uso de Stellar', /solucion/],
  ['Plan de trabajo y cronograma', /plan de trabajo|cronograma/],
  ['Presupuesto y personal', /presupuesto/],
  ['Riesgos y viabilidad', /riesgo/],
  ['Evidencia y siguientes pasos', /evidencia/],
];

const PARTES_PLAN = [
  ['Destinatarios', /destinatario/],
  ['Matriz de comunicación', /matriz/],
  ['Formato del informe', /formato/],
  ['Indicadores de avance', /indicador/],
  ['Semáforo y escalamiento', /semaforo/],
  ['Herramientas', /herramienta/],
];

/**
 * Arma { equipo: { padre, 'Propuesta Final': n, … } } con las issues de la etiqueta tecnm-sprint-4.
 * @param {{number:number, labels:(string|{name:string})[], pull_request?:object}[]} lista
 */
export function mapearIssues(lista) {
  const mapa = {};
  for (const i of lista) {
    if (i.pull_request) continue;
    const etiquetas = i.labels.map((l) => (typeof l === 'string' ? l : l.name));
    const equipo = etiquetas.map((l) => l.match(/^equipo-(\d+)$/)?.[1]).find(Boolean);
    if (!equipo) continue;
    const entrega = etiquetas.map((l) => ETIQUETA_DE_ENTREGA[l]).find(Boolean);
    (mapa[equipo] ||= {})[entrega || 'padre'] = i.number;
  }
  return mapa;
}

export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function titulos(md) {
  return md
    .split('\n')
    .filter((l) => /^#{1,4}\s/.test(l))
    .map((l) => normalizar(l.replace(/^#+\s*/, '')));
}

function revisarPrivacidad(ruta, md) {
  // Las huellas SHA-256 tienen muchos dígitos: se quitan antes de buscar teléfonos.
  const limpio = md.replace(RE_SHA256, ' ');
  const hallazgos = [];
  const control = limpio.match(RE_CONTROL);
  if (control) hallazgos.push(`posible número de control (${control.length})`);
  const tel = limpio.match(RE_TELEFONO);
  if (tel) hallazgos.push(`posible teléfono (${tel.length})`);
  const curp = limpio.match(RE_CURP);
  if (curp) hallazgos.push(`posible CURP (${curp.length})`);
  return hallazgos.length ? `\`${ruta}\`: ${hallazgos.join(', ')}` : null;
}

/** Busca la línea "Estado: ..." de la carta. */
export function estadoDeCarta(md) {
  for (const linea of md.split('\n')) {
    const m = normalizar(linea).match(/^[\s>*_-]*estado[\s*_]*:[\s*_`]*(.+?)[\s*_`.]*$/);
    if (!m) continue;
    const valor = m[1];
    if (valor.startsWith('borrador')) return { tipo: 'borrador' };
    if (valor.startsWith('en consulta')) return { tipo: 'consulta' };
    const f = valor.match(/^firmada el (\d{4}-\d{2}-\d{2})/);
    if (f) return { tipo: 'firmada', fecha: f[1] };
    return { tipo: 'invalido', valor };
  }
  return null;
}

/**
 * @param {object} d
 * @param {string} d.prBody                 Descripción del PR.
 * @param {{path:string,status:string}[]} d.archivos  Archivos que cambia el PR.
 * @param {Record<string,string>} d.contenidos  Contenido de los .md del equipo en el PR (ruta → texto).
 * @param {string[]} d.archivosDelEquipo     Rutas que existen en la carpeta del equipo (en la rama del PR).
 * @param {Record<string,Record<string,number>>} d.issuesPorEquipo  Por equipo: { padre, 'Propuesta Final', 'Plan de informe', 'Carta de entendimiento' } → número de issue.
 * @param {string} d.autor                   Usuario que abrió el PR.
 * @param {string[]} d.autoresCommits        Usuario de cada commit del PR.
 * @param {{login:string,state:string}[]} d.revisiones
 */
export function validar(d) {
  const minimos = [];
  const avisos = [];
  const ok = (cumple, texto) => minimos.push({ cumple, texto });

  // 1. Un solo equipo por PR.
  const equipos = new Set();
  for (const a of d.archivos) {
    const m = a.path.match(/^docs\/gestion\/equipo-(\d+)\//);
    if (m) equipos.add(m[1]);
  }
  if (equipos.size !== 1) {
    ok(false, equipos.size === 0
      ? 'El PR no cambia nada dentro de `docs/gestion/equipo-N/`.'
      : `El PR mezcla carpetas de varios equipos (${[...equipos].map((e) => 'equipo-' + e).join(', ')}). Cada equipo entrega en su propio PR.`);
    return { equipo: null, minimos, avisos, entregas: [] };
  }
  const equipo = [...equipos][0];
  const carpeta = `docs/gestion/equipo-${equipo}/`;

  const fuera = d.archivos.filter((a) => !a.path.startsWith('docs/gestion/'));
  if (fuera.length) avisos.push(`El PR también cambia archivos fuera de \`docs/gestion/\`: ${fuera.map((a) => '`' + a.path + '`').join(', ')}. Las entregas del Sprint 4 son solo documentos.`);

  // 2. Ligado a la sub-issue de cada entrega que trae el PR.
  const issues = d.issuesPorEquipo[equipo] || {};
  const menciona = (n) => new RegExp(`\\b(refs|resolves|closes|fixes)\\s+#${n}\\b`, 'i').test(d.prBody || '');
  const entregasDelPR = Object.entries(ARCHIVO_DE_ENTREGA)
    .filter(([, archivo]) => d.contenidos[carpeta + archivo] !== undefined)
    .map(([entrega]) => entrega);
  if (!issues.padre && !Object.keys(issues).length) {
    ok(false, `No encontré las issues del Sprint 4 del equipo ${equipo} (etiquetas \`tecnm-sprint-4\` y \`equipo-${equipo}\`).`);
  } else if (entregasDelPR.length) {
    for (const entrega of entregasDelPR) {
      const sub = issues[entrega];
      if (!sub) ok(false, `No encontré la sub-issue de "${entrega}" del equipo ${equipo}.`);
      else ok(menciona(sub), `La descripción del PR dice \`Resolves #${sub}\` (sub-issue de ${entrega}).`);
    }
  } else {
    const todas = Object.values(issues);
    ok(todas.some(menciona), `La descripción del PR dice \`Refs #\` con una issue del equipo ${equipo} (${todas.map((n) => '#' + n).join(', ')}).`);
  }
  const issue = issues[entregasDelPR[0]] || issues.padre;

  // 3. Sin PDF, fotos, audio, video ni documentos de Office.
  const prohibidos = d.archivos.filter((a) => a.status !== 'removed' && a.path.startsWith('docs/gestion/') && EXT_PROHIBIDAS.test(a.path));
  ok(prohibidos.length === 0, prohibidos.length
    ? `Hay archivos que no pueden ir al repo público: ${prohibidos.map((a) => '`' + a.path + '`').join(', ')}. Escriban el contenido en Markdown; la carta firmada se queda fuera del repo.`
    : 'No hay PDF, fotos, audio, video ni archivos de Office.');

  // 4. Privacidad en el texto.
  const privacidad = Object.entries(d.contenidos).map(([ruta, md]) => revisarPrivacidad(ruta, md)).filter(Boolean);
  ok(privacidad.length === 0, privacidad.length
    ? `Posibles datos personales: ${privacidad.join('; ')}. Si es un falso positivo (por ejemplo, una cifra), escríbanla con comas o en palabras.`
    : 'No encontré números de control, teléfonos ni CURP.');

  for (const [ruta, md] of Object.entries(d.contenidos)) {
    const correos = (md.match(RE_CORREO) || []).length;
    if (correos) avisos.push(`\`${ruta}\` tiene ${correos} correo(s). Usen el \`@usuario\` de GitHub o un cargo, no correos personales.`);
    const n = normalizar(md);
    const frases = FRASES_DE_MAS.filter((f) => n.includes(f));
    if (frases.length) avisos.push(`\`${ruta}\` dice: ${frases.map((f) => '"' + f + '"').join(', ')}. Yucu es un prototipo: no afirmen de más (AGENTS.md, regla 8). Si lo usan para decir que algo *no* lo es, está bien.`);
  }

  // 5. Estructura de cada entrega que viene en el PR.
  const entregas = [];
  const reglas = [];
  const existe = (r) => d.archivosDelEquipo.includes(carpeta + r);

  const propuesta = d.contenidos[carpeta + 'propuesta.md'];
  if (propuesta !== undefined) {
    entregas.push('Propuesta Final');
    reglas.push({ entrega: 'Propuesta Final', items: reglasPropuesta(propuesta) });
    const t = titulos(propuesta);
    let desde = 0;
    const faltan = [];
    for (const [nombre, re] of SECCIONES_PROPUESTA) {
      const i = t.findIndex((x, k) => k >= desde && re.test(x));
      if (i === -1) faltan.push(nombre);
      else desde = i + 1;
    }
    ok(faltan.length === 0, faltan.length
      ? `La propuesta no tiene, o no en orden, estas secciones como títulos (\`##\`): ${faltan.join(', ')}.`
      : 'La propuesta tiene las ocho secciones en orden.');
  }

  const plan = d.contenidos[carpeta + 'plan-de-informe.md'];
  if (plan !== undefined) {
    entregas.push('Plan de informe');
    reglas.push({ entrega: 'Plan de informe', items: reglasPlan(plan, { plantilla: d.contenidos[carpeta + 'minutas/plantilla.md'], informe: d.contenidos[carpeta + 'informe-semana-1.md'] }) });
    const t = titulos(plan);
    const faltan = PARTES_PLAN.filter(([, re]) => !t.some((x) => re.test(x))).map(([n]) => n);
    ok(faltan.length === 0, faltan.length
      ? `Al plan de informe le faltan estas partes como títulos (\`##\`): ${faltan.join(', ')}.`
      : 'El plan de informe tiene todas sus partes.');
    ok(existe('informe-semana-1.md'), 'Existe `informe-semana-1.md` con un informe real.');
    ok(existe('minutas/plantilla.md'), 'Existe la plantilla de minuta en `minutas/plantilla.md`.');
  }

  const carta = d.contenidos[carpeta + 'carta.md'];
  if (carta !== undefined) {
    entregas.push('Carta de entendimiento');
    reglas.push({ entrega: 'Carta de entendimiento', items: reglasCarta(carta) });
    const estado = estadoDeCarta(carta);
    ok(estado && estado.tipo !== 'invalido', estado && estado.tipo !== 'invalido'
      ? `La carta dice su estado (${estado.tipo === 'firmada' ? 'firmada el ' + estado.fecha : estado.tipo}).`
      : 'La carta debe tener una línea `Estado: borrador`, `Estado: en consulta de asamblea` o `Estado: firmada el AAAA-MM-DD`.');
    if (estado && estado.tipo === 'firmada') {
      ok(RE_SHA256.test(carta), 'La carta firmada incluye la huella SHA-256 del PDF firmado (64 caracteres, de `sha256sum carta-firmada.pdf`).');
      RE_SHA256.lastIndex = 0;
    }
    if (estado && estado.tipo !== 'borrador') {
      const minutas = d.archivosDelEquipo.filter((r) => r.startsWith(carpeta + 'minutas/') && r.endsWith('.md') && !r.endsWith('/plantilla.md'));
      ok(minutas.length > 0, 'Hay minuta de la sesión de lectura con la organización en `minutas/`.');
    }
  }

  if (entregas.length === 0) avisos.push('El PR no trae `propuesta.md`, `plan-de-informe.md` ni `carta.md`; no revisé estructura.');

  // 6. Trabajo en equipo (solo informativo).
  const conteo = {};
  for (const a of d.autoresCommits) conteo[a || '(sin cuenta de GitHub)'] = (conteo[a || '(sin cuenta de GitHub)'] || 0) + 1;
  const aprobaron = [...new Set(d.revisiones.filter((r) => r.state === 'APPROVED' && r.login !== d.autor).map((r) => r.login))];
  if (!aprobaron.length) avisos.push('Todavía nadie más aprobó el PR. La rúbrica pide la revisión de otro integrante con comentarios reales.');

  return { equipo, issue, minimos, avisos, entregas, reglas, conteo, aprobaron, carpeta };
}

/** @param {{entrega:string, criterios?:object[], total?:number, error?:string}[]} [ia] */
export function formatear(r, ia = []) {
  const cumple = r.minimos.every((m) => m.cumple);
  const l = [MARCA, '## Revisión automática · Sprint 4', ''];
  if (r.equipo) l.push(`**Equipo ${r.equipo}**${r.entregas.length ? ' · ' + r.entregas.join(', ') : ''}`, '');
  l.push(cumple
    ? '✅ **Cumple los requisitos mínimos.** La entrega pasa a revisión cruzada y a calificación con la rúbrica.'
    : '❌ **No cumple los requisitos mínimos.** Corríjanlo en esta misma rama; la revisión se repite sola con cada push.');
  l.push('', '### Requisitos mínimos', ...r.minimos.map((m) => `- ${m.cumple ? '✅' : '❌'} ${m.texto}`));
  for (const g of r.reglas || []) l.push(...formatearReglas(g.entrega, g.items));
  for (const x of ia) l.push(...formatearIA(x.entrega, x));
  if (r.conteo) {
    l.push('', '### Trabajo en equipo', ...Object.entries(r.conteo).map(([u, n]) => `- \`${u}\`: ${n} commit(s)`));
    if (r.aprobaron?.length) l.push(`- Aprobado por: ${r.aprobaron.map((u) => '`' + u + '`').join(', ')}`);
  }
  if (r.avisos.length) l.push('', '### Avisos (no bloquean)', ...r.avisos.map((a) => `- ⚠️ ${a}`));
  l.push('', '---', '*✅/❌ = requisitos mínimos (bloquean). ✅/⬜ = forma que pide la rúbrica (orientan, no bloquean). La sugerencia de IA solo orienta: la calificación la ponen el docente y la revisión cruzada con la rúbrica.*');
  return { cumple, texto: l.join('\n') };
}
