// Validación automática de los PR de diagramas UML y documentos de docs/uml/.
// Los diagramas se dibujan en Modelio o Enterprise Architect y se entregan como:
//   docs/uml/<nombre>.md          texto, imagen insertada, tabla de elementos y fuentes
//   docs/uml/img/<nombre>.png     imagen exportada del diagrama
//   docs/uml/modelos/<nombre>.xmi modelo exportado como XMI (opcional)
// Ver docs/uml/README.md. No califica ni aprueba: eso lo hacen los mantenedores.
//
// Este módulo no llama a GitHub: recibe los datos ya leídos y devuelve el resultado.
// Pruebas: node --test .github/scripts/validar-uml.test.mjs

export const MARCA_UML = '<!-- validar-uml -->';

export const ANCHO_MINIMO = 800;               // px
export const PESO_MAXIMO_PNG = 3 * 1024 * 1024; // 3 MB
export const PESO_MAXIMO_XMI = 5 * 1024 * 1024; // 5 MB
export const PALABRAS_MINIMAS_DOC = 120;
export const MINIMO_REQUISITOS = 8;
export const MAXIMO_ATRASO = 20; // commits detrás de main antes de avisar

const FIRMA_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PROYECTOS_PROHIBIDOS = /\.(qea|qeax|eap|eapx|feap|ldb|ramc|exml|zip|rar|7z)$/i;
const AFIRMACIONES = [
  [/\baudited\b|\bauditad[oa]s?\b/i, '"audited" / "auditado"'],
  [/\bin production\b|\ben producci[oó]n\b/i, '"in production" / "en producción"'],
  [/\bcertified\b|\bcertificad[oa]s? oficial/i, '"certified" / "certificado oficial"'],
];
const SECRETOS = [
  [/\bS[A-Z2-7]{55}\b/, 'una llave secreta de Stellar (`S…`)'],
  [/\b[a-f0-9]{64}\b/i, 'un hash de 64 caracteres'],
  [/AIza[0-9A-Za-z_-]{35}/, 'una llave de Google/Gemini'],
];
const RE_CONTROL = /(?<![\w])[A-Za-z]?\d{2}620\d{3}(?![\w])/;
const RE_CURP = /\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/;

/** Números de issue que el PR dice resolver. */
export function issuesCitadas(body) {
  return [...(body || '').matchAll(/\b(resolves|closes|fixes)\s+#(\d+)/gi)].map((m) => Number(m[2]));
}

/** Tipo de issue según su título: 'diagrama' ([uml]), 'documento' ([docs]) u otro. */
export function tipoDeIssue(titulo) {
  if (/^\s*\[uml\]/i.test(titulo || '')) return 'diagrama';
  if (/^\s*\[docs\]/i.test(titulo || '')) return 'documento';
  return 'otro';
}

/** Nombre base que pide la issue: el primer `docs/uml/<nombre>.md` del texto. */
export function nombreBase(cuerpoIssue) {
  for (const m of (cuerpoIssue || '').matchAll(/docs\/uml\/([a-z0-9][a-z0-9-]*)\.md/gi)) {
    if (m[1].toLowerCase() !== 'readme') return m[1];
  }
  return null;
}

/** Archivos que puede traer el PR para esa issue. */
export function archivosPermitidos(nombre, tipo) {
  const md = `docs/uml/${nombre}.md`;
  if (tipo !== 'diagrama') return { obligatorios: [md], opcionales: [] };
  return {
    obligatorios: [md, `docs/uml/img/${nombre}.png`],
    opcionales: [`docs/uml/modelos/${nombre}.xmi`],
  };
}

/** Sección de un markdown (texto bajo un encabezado ##/### hasta el siguiente). */
export function seccion(md, titulo) {
  const lineas = (md || '').split('\n');
  const re = new RegExp(`^#{2,3}\\s+${titulo}\\b`, 'i');
  const i = lineas.findIndex((l) => re.test(l.trim()));
  if (i < 0) return null;
  const fin = lineas.findIndex((l, j) => j > i && /^#{1,3}\s/.test(l.trim()));
  return lineas.slice(i + 1, fin < 0 ? undefined : fin).join('\n');
}

/** Nombres de código que la issue exige ("It must include"): lo que va entre `…`. */
export function nombresExigidos(cuerpoIssue) {
  const s = seccion(cuerpoIssue, 'It must include');
  if (!s) return [];
  const crudos = [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
  const nombres = [];
  for (const c of crudos) {
    if (/\s|\/|^[@<]|\.(ts|tsx|md|svg|rs)$/i.test(c)) continue; // rutas, código suelto, archivos
    // "LotRegistryPort.getLot" basta con que aparezca el método.
    const parte = c.includes('.') ? c.split('.').pop() : c;
    if (parte && !nombres.includes(parte)) nombres.push(parte);
  }
  return nombres;
}

/** Filas de la tabla de elementos: el texto entre `…` de la primera columna. */
export function elementosDeTabla(md) {
  const s = seccion(md, 'Elements');
  if (s === null) return null;
  const filas = s.split('\n').filter((l) => /^\s*\|/.test(l) && !/^\s*\|\s*:?-{2,}/.test(l));
  const datos = filas.slice(1); // la primera es el encabezado
  const nombres = [];
  for (const f of datos) {
    const celda = f.split('|')[1] || '';
    for (const m of celda.matchAll(/`([^`]+)`/g)) nombres.push(m[1].trim());
  }
  return { filas: datos.length, nombres };
}

/** Ancho y alto de un PNG a partir de sus primeros 24 bytes (bloque IHDR). */
export function medidasPng(bytes) {
  if (!bytes || bytes.length < 24) return null;
  for (let i = 0; i < 8; i++) if (bytes[i] !== FIRMA_PNG[i]) return null;
  const leer = (o) => ((bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]) >>> 0;
  return { ancho: leer(16), alto: leer(20) };
}

const contarPalabras = (t) => (t || '').replace(/`[^`]*`/g, ' ').split(/\s+/).filter((w) => /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(w)).length;
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const aparece = (nombre, texto) => new RegExp(`(^|[^A-Za-z0-9_])${escapar(nombre)}([^A-Za-z0-9_]|$)`).test(texto || '');

/**
 * @param {object} d
 * @param {string} d.prBody
 * @param {string} d.autor
 * @param {{path:string,status:string}[]} d.archivos       Archivos del PR.
 * @param {{number:number,title:string,state:string,assignees:string[],body:string}[]} d.issues  Issues citadas.
 * @param {Record<string,string>} d.textos                   Contenido de los .md del PR.
 * @param {Record<string,{size:number,cabecera?:number[],inicio?:string}>} d.binarios  PNG y XMI del PR.
 * @param {string} d.fuentes                                  Texto de las fuentes que cita la issue (en main).
 * @param {number|null} [d.atraso]                            Commits detrás de main.
 */
export function validarUml(d) {
  const minimos = [];
  const avisos = [];
  const ok = (cumple, texto) => minimos.push({ cumple, texto });
  const vivos = d.archivos.filter((a) => a.status !== 'removed');

  // 1. Issue citada.
  const citadas = issuesCitadas(d.prBody);
  ok(citadas.length > 0, citadas.length
    ? `El PR dice resolver ${citadas.map((n) => '#' + n).join(', ')}.`
    : 'La descripción del PR debe decir `Resolves #<número>` con la issue que resuelve.');
  if (citadas.length > 1) avisos.push('El PR cita más de una issue. Para Drips, cada PR resuelve una sola issue.');

  const issue = d.issues.find((i) => tipoDeIssue(i.title) !== 'otro' && nombreBase(i.body));
  if (!issue) {
    if (citadas.length) ok(false, 'La issue citada no es de `docs/uml/` (título `[uml]` o `[docs]` con un archivo `docs/uml/…`). Revisen el número.');
    return { minimos, avisos, issue: null, tipo: null, nombre: null };
  }
  const tipo = tipoDeIssue(issue.title);
  const nombre = nombreBase(issue.body);
  if (issue.state !== 'open') avisos.push(`La issue #${issue.number} ya está cerrada.`);
  if (!issue.assignees.includes(d.autor)) {
    avisos.push(`\`${d.autor}\` no está asignado a #${issue.number}. En Drips solo gana puntos la persona asignada: postúlense en la app de Drips y esperen la asignación.`);
  }

  // 2. Archivos permitidos.
  const { obligatorios, opcionales } = archivosPermitidos(nombre, tipo);
  const permitidos = [...obligatorios, ...opcionales];
  const sobran = d.archivos.filter((a) => !permitidos.includes(a.path));
  const faltan = obligatorios.filter((p) => !vivos.some((a) => a.path === p));
  const proyectos = sobran.filter((a) => PROYECTOS_PROHIBIDOS.test(a.path));
  ok(faltan.length === 0, faltan.length
    ? `Faltan archivos: ${faltan.map((p) => '`' + p + '`').join(', ')}.`
    : `Están los archivos que pide la issue: ${obligatorios.map((p) => '`' + p + '`').join(', ')}.`);
  ok(sobran.length === 0, sobran.length
    ? `El PR cambia archivos que la issue no pide: ${sobran.map((a) => '`' + a.path + '`').join(', ')}.${proyectos.length ? ' Los proyectos de Modelio o Enterprise Architect no se suben: exporten PNG y, si quieren, XMI.' : ''}`
    : 'No cambia archivos fuera de los que pide la issue.');

  // 3. Contenido del .md.
  const md = d.textos[`docs/uml/${nombre}.md`];
  if (md !== undefined) {
    ok(/^#\s+\S/m.test(md), /^#\s+\S/m.test(md) ? 'El documento tiene título.' : 'El documento necesita un título (`# …`) en la primera línea.');

    if (tipo === 'diagrama') {
      const img = `img/${nombre}.png`;
      const inserta = new RegExp(`!\\[[^\\]]*\\]\\((\\./)?${escapar(img)}\\)`).test(md);
      ok(inserta, inserta ? `Inserta la imagen \`${img}\`.` : `El documento debe insertar la imagen con \`![descripción](${img})\`.`);

      const tabla = elementosDeTabla(md);
      ok(!!tabla && tabla.filas > 0, tabla && tabla.filas > 0
        ? `Tiene la tabla **Elements** con ${tabla.filas} fila(s).`
        : 'Falta la sección `## Elements` con una tabla de los elementos del diagrama (ver `docs/uml/README.md`).');

      const exigidos = nombresExigidos(issue.body);
      const ausentes = exigidos.filter((n) => !aparece(n, md));
      if (exigidos.length) {
        ok(ausentes.length === 0, ausentes.length
          ? `La issue pide estos elementos y no aparecen en el documento: ${ausentes.map((n) => '`' + n + '`').join(', ')}. Si están en el diagrama, agréguenlos a la tabla Elements.`
          : `Aparecen los ${exigidos.length} elementos que pide la issue.`);
      }

      if (tabla && d.fuentes) {
        const desconocidos = [...new Set(tabla.nombres)].filter((n) => /^[A-Za-z_][\w]*(\(\))?$/.test(n) && !aparece(n.replace(/\(\)$/, ''), d.fuentes));
        if (desconocidos.length) avisos.push(`Estos nombres de la tabla no aparecen en las fuentes de la issue: ${desconocidos.map((n) => '`' + n + '`').join(', ')}. Si no existen en el código o en el ADR, márquenlos como nota o quítenlos.`);
      }

      if (/```mermaid/i.test(md)) avisos.push('El documento trae un bloque Mermaid. El diagrama que cuenta es el PNG exportado de Modelio o Enterprise Architect.');
    } else {
      const palabras = contarPalabras(md);
      ok(palabras >= PALABRAS_MINIMAS_DOC, palabras >= PALABRAS_MINIMAS_DOC
        ? `Tiene ${palabras} palabras.`
        : `Tiene ${palabras} palabras; se esperan al menos ${PALABRAS_MINIMAS_DOC}.`);
      if (/^requisitos-/.test(nombre)) {
        const ids = new Set([...md.matchAll(/\bR(N?)F-\d{2,3}\b/g)].map((m) => m[0]));
        const rf = [...ids].filter((x) => x.startsWith('RF-')).length;
        const rnf = [...ids].filter((x) => x.startsWith('RNF-')).length;
        ok(ids.size >= MINIMO_REQUISITOS && rf > 0 && rnf > 0, ids.size >= MINIMO_REQUISITOS && rf > 0 && rnf > 0
          ? `Tiene ${rf} requisitos funcionales y ${rnf} no funcionales.`
          : `Se esperan al menos ${MINIMO_REQUISITOS} requisitos con ID (\`RF-01\`, \`RNF-01\`…), funcionales y no funcionales; hay ${rf} RF y ${rnf} RNF.`);
      }
    }

    const fuentes = seccion(md, 'Sources') ?? seccion(md, 'Fuentes');
    if (tipo === 'diagrama' || fuentes !== null) {
      const enlaces = fuentes ? (fuentes.match(/\]\([^)]+\)|https?:\/\/\S+|`[^`]+\.(md|ts|tsx|rs)`/g) || []).length : 0;
      ok(enlaces > 0, enlaces > 0 ? 'Cita sus fuentes.' : 'Falta la sección `## Sources` con al menos una fuente (enlace o ruta del archivo).');
    }

    const afirm = AFIRMACIONES.filter(([re]) => re.test(md)).map(([, t]) => t);
    ok(!afirm.length, afirm.length
      ? `Hay afirmaciones que AGENTS.md (regla 8) no permite sin evidencia: ${afirm.join(', ')}.`
      : 'Sin afirmaciones como "audited" o "in production".');
    const secretos = SECRETOS.filter(([re]) => re.test(md)).map(([, t]) => t);
    ok(!secretos.length, secretos.length ? `No escriban ${secretos.join(' ni ')} (reglas 3 y 6).` : 'Sin hashes, llaves ni secretos.');
    const privado = RE_CONTROL.test(md) || RE_CURP.test(md);
    ok(!privado, privado ? 'Parece haber un número de control o una CURP (regla 5, privacidad).' : 'Sin números de control ni CURP.');
  }

  // 4. Imagen y modelo.
  if (tipo === 'diagrama') {
    const png = d.binarios[`docs/uml/img/${nombre}.png`];
    if (png) {
      const medidas = medidasPng(png.cabecera);
      ok(!!medidas, medidas ? 'La imagen es un PNG válido.' : 'La imagen no es un PNG válido. Expórtenla de nuevo como PNG (no cambien solo la extensión).');
      if (medidas) {
        ok(medidas.ancho >= ANCHO_MINIMO, medidas.ancho >= ANCHO_MINIMO
          ? `Mide ${medidas.ancho} × ${medidas.alto} px.`
          : `Mide ${medidas.ancho} px de ancho; se pide al menos ${ANCHO_MINIMO} px para que se lea. Exporten con más zoom o más resolución.`);
      }
      ok(png.size <= PESO_MAXIMO_PNG, png.size <= PESO_MAXIMO_PNG
        ? `Pesa ${(png.size / 1024).toFixed(0)} KB.`
        : `Pesa ${(png.size / 1048576).toFixed(1)} MB; el máximo es 3 MB.`);
    }
    const xmi = d.binarios[`docs/uml/modelos/${nombre}.xmi`];
    if (xmi) {
      const esXmi = /<\?xml|xmi:XMI|xmlns:xmi|uml:Model/i.test(xmi.inicio || '');
      ok(esXmi && xmi.size <= PESO_MAXIMO_XMI, !esXmi
        ? 'El archivo `.xmi` no parece XMI (XML). Expórtenlo desde Modelio o Enterprise Architect.'
        : xmi.size <= PESO_MAXIMO_XMI ? 'El modelo XMI es válido.' : 'El XMI pesa más de 5 MB; exporten solo el paquete del diagrama.');
    }
  }

  if (typeof d.atraso === 'number' && d.atraso > MAXIMO_ATRASO) {
    avisos.push(`La rama va ${d.atraso} commits detrás de \`main\`. Actualícenla (botón **Update branch**): Drips no da puntos a PR muy atrasados.`);
  }

  return { minimos, avisos, issue: issue.number, tipo, nombre };
}

export function formatearUml(r) {
  const cumple = r.minimos.every((m) => m.cumple);
  const l = [MARCA_UML, '## Revisión automática · diagramas y documentos de `docs/uml/`', ''];
  l.push(cumple
    ? '✅ **Cumple los requisitos mínimos.** Falta la revisión de un mantenedor: que el diagrama diga lo mismo que las fuentes.'
    : '❌ **Todavía no cumple.** Corrijan en esta misma rama; la revisión se repite sola con cada push.');
  if (r.issue) l.push('', `Issue: #${r.issue} · tipo: ${r.tipo === 'diagrama' ? 'diagrama UML' : 'documento'} · nombre: \`${r.nombre}\``);
  l.push('', '### Requisitos', ...r.minimos.map((m) => `- ${m.cumple ? '✅' : '❌'} ${m.texto}`));
  if (r.avisos.length) l.push('', '### Avisos (no bloquean)', ...r.avisos.map((a) => `- ⚠️ ${a}`));
  l.push('', '---', '*Esta revisión no mira el dibujo: comprueba archivos, nombres y reglas fijas. Guía y plantilla: [`docs/uml/README.md`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/docs/uml/README.md). En la revisión tendrán que explicar su diagrama.*');
  return { cumple, texto: l.join('\n') };
}
