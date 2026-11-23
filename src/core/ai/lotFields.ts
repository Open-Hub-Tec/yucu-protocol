/**
 * Campos de un lote que la IA puede llenar (#154; ADR-004, D5; ADR-006, D3).
 *
 * Solo los de `RegisterLotRequest`: categoría y variedad de una lista cerrada, municipio o región,
 * y rango de volumen. Nunca nombres, teléfonos, comunidad exacta ni montos. Lo que no quedó claro
 * se deja vacío (`null`); no se adivina.
 *
 * Las listas son PROVISIONALES: las define el contrato `lot_passport` (#110). Cuando #110 las fije,
 * se cambian aquí y en ningún otro lugar. Más adelante (ADR-007), el manifiesto de cada esquema
 * dirá qué campos y qué valores se permiten; por eso las reglas viven como datos (`LOT_FIELD_RULES`).
 *
 * Este archivo no usa red ni dependencias: lo usan el servidor (adaptadores de IA) y el teléfono.
 */

// ─────────────────────────────── Listas cerradas ───────────────────────────────

export interface ClosedOption {
  /** Valor que se guarda en `RegisterLotRequest`. */
  code: string;
  /** Texto para leer en voz alta. */
  label: string;
  /** Palabras (sin acentos, en minúsculas) con que la gente lo dice. */
  words: string[];
}

export interface CategoryOption extends ClosedOption {
  varieties: ClosedOption[];
}

export const LOT_CATEGORIES: readonly CategoryOption[] = [
  {
    code: 'coffee',
    label: 'Café',
    words: ['cafe', 'pergamino', 'cafetal'],
    varieties: [
      { code: 'typica', label: 'Típica', words: ['typica', 'tipica', 'pluma'] },
      { code: 'bourbon', label: 'Bourbon', words: ['bourbon', 'borbon'] },
      { code: 'caturra', label: 'Caturra', words: ['caturra'] },
      { code: 'mundo_novo', label: 'Mundo Novo', words: ['mundo novo'] },
      { code: 'garnica', label: 'Garnica', words: ['garnica'] },
    ],
  },
  {
    code: 'honey',
    label: 'Miel',
    words: ['miel', 'colmena', 'apicola'],
    varieties: [
      { code: 'multifloral', label: 'Multifloral', words: ['multifloral', 'multiflora'] },
      { code: 'mezquite', label: 'Mezquite', words: ['mezquite'] },
    ],
  },
  {
    code: 'pulque',
    label: 'Pulque',
    words: ['pulque', 'aguamiel', 'tinacal'],
    varieties: [
      { code: 'blanco', label: 'Blanco', words: ['blanco', 'natural'] },
      { code: 'curado', label: 'Curado', words: ['curado'] },
    ],
  },
  {
    code: 'maize',
    label: 'Maíz criollo',
    words: ['maiz', 'mazorca'],
    varieties: [
      { code: 'blanco', label: 'Blanco', words: ['blanco'] },
      { code: 'amarillo', label: 'Amarillo', words: ['amarillo'] },
      { code: 'azul', label: 'Azul', words: ['azul', 'morado'] },
      { code: 'rojo', label: 'Rojo', words: ['rojo'] },
    ],
  },
  {
    code: 'beans',
    label: 'Frijol',
    words: ['frijol', 'frijoles', 'ayocote', 'ayocotes'],
    varieties: [
      { code: 'negro', label: 'Negro', words: ['negro'] },
      { code: 'bayo', label: 'Bayo', words: ['bayo'] },
      { code: 'ayocote', label: 'Ayocote', words: ['ayocote', 'ayocotes'] },
    ],
  },
  {
    code: 'textile',
    label: 'Textil',
    words: ['textil', 'textiles', 'huipil', 'huipiles', 'rebozo', 'rebozos', 'telar'],
    varieties: [
      { code: 'telar_cintura', label: 'Telar de cintura', words: ['telar de cintura'] },
      { code: 'bordado', label: 'Bordado', words: ['bordado', 'bordados'] },
    ],
  },
  {
    code: 'palm',
    label: 'Tejido de palma',
    words: ['palma', 'sombrero', 'sombreros', 'tenate', 'tenates', 'petate', 'petates'],
    varieties: [
      { code: 'sombrero', label: 'Sombrero', words: ['sombrero', 'sombreros'] },
      { code: 'tenate', label: 'Tenate', words: ['tenate', 'tenates'] },
      { code: 'petate', label: 'Petate', words: ['petate', 'petates'] },
    ],
  },
];

/**
 * Municipios y regiones de la Mixteca. Son nombres de lugares públicos, nunca la comunidad exacta
 * ni un domicilio (ADR-004, D5). Un municipio va antes que una región porque es más preciso.
 */
export const LOT_MUNICIPALITIES: readonly ClosedOption[] = [
  { code: 'Heroica Ciudad de Tlaxiaco', label: 'Tlaxiaco', words: ['tlaxiaco'] },
  { code: 'Heroica Ciudad de Huajuapan de León', label: 'Huajuapan', words: ['huajuapan'] },
  { code: 'Asunción Nochixtlán', label: 'Nochixtlán', words: ['nochixtlan'] },
  { code: 'Chalcatongo de Hidalgo', label: 'Chalcatongo', words: ['chalcatongo'] },
  { code: 'Coicoyán de las Flores', label: 'Coicoyán', words: ['coicoyan'] },
  { code: 'Magdalena Peñasco', label: 'Magdalena Peñasco', words: ['magdalena penasco'] },
  { code: 'Putla Villa de Guerrero', label: 'Putla', words: ['putla'] },
  { code: 'San Esteban Atatlahuca', label: 'Atatlahuca', words: ['atatlahuca'] },
  { code: 'San Juan Mixtepec', label: 'San Juan Mixtepec', words: ['san juan mixtepec'] },
  { code: 'San Juan Ñumí', label: 'Ñumí', words: ['numi'] },
  { code: 'San Martín Peras', label: 'San Martín Peras', words: ['san martin peras'] },
  { code: 'San Mateo Peñasco', label: 'San Mateo Peñasco', words: ['san mateo penasco'] },
  { code: 'San Miguel el Grande', label: 'San Miguel el Grande', words: ['san miguel el grande'] },
  { code: 'San Pedro y San Pablo Teposcolula', label: 'Teposcolula', words: ['teposcolula'] },
  { code: 'Santa Catarina Yosonotú', label: 'Yosonotú', words: ['yosonotu'] },
  { code: 'Santa María Yucuhiti', label: 'Yucuhiti', words: ['yucuhiti'] },
  { code: 'Santiago Juxtlahuaca', label: 'Juxtlahuaca', words: ['juxtlahuaca'] },
  { code: 'Santiago Tilantongo', label: 'Tilantongo', words: ['tilantongo'] },
  { code: 'Santo Domingo Yanhuitlán', label: 'Yanhuitlán', words: ['yanhuitlan'] },
];

export const LOT_REGIONS: readonly ClosedOption[] = [
  { code: 'Mixteca Alta', label: 'Mixteca Alta', words: ['mixteca alta'] },
  { code: 'Mixteca Baja', label: 'Mixteca Baja', words: ['mixteca baja'] },
  { code: 'Mixteca de la Costa', label: 'Mixteca de la Costa', words: ['mixteca de la costa'] },
];

/** Rangos de volumen (código de `volumeRange`). Provisionales hasta #110. */
export const VOLUME_RANGES: readonly { code: number; label: string; minKg: number; maxKg: number }[] = [
  { code: 1, label: 'menos de 10 kg', minKg: 0, maxKg: 10 },
  { code: 2, label: 'de 10 a 49 kg', minKg: 10, maxKg: 50 },
  { code: 3, label: 'de 50 a 199 kg', minKg: 50, maxKg: 200 },
  { code: 4, label: 'de 200 a 999 kg', minKg: 200, maxKg: 1000 },
  { code: 5, label: '1000 kg o más', minKg: 1000, maxKg: Number.POSITIVE_INFINITY },
];

/**
 * Lo que la IA entendió del lote. Es un BORRADOR: la persona lo escucha, lo corrige y firma
 * (ADR-007, D3). `null` = no quedó claro.
 */
export interface LotDraft {
  category: string | null;
  variety: string | null;
  location: string | null;
  volumeRange: number | null;
}

export const EMPTY_LOT_DRAFT: LotDraft = Object.freeze({
  category: null,
  variety: null,
  location: null,
  volumeRange: null,
});

/** Reglas por campo. Hoy están escritas para lotes; el manifiesto de ADR-007 las reemplazará. */
export const LOT_FIELD_RULES = {
  category: LOT_CATEGORIES.map((c) => c.code),
  variety: (category: string) => LOT_CATEGORIES.find((c) => c.code === category)?.varieties.map((v) => v.code) ?? [],
  location: [...LOT_MUNICIPALITIES, ...LOT_REGIONS].map((m) => m.code),
  volumeRange: VOLUME_RANGES.map((r) => r.code),
} as const;

// ─────────────────────────────── Validación ───────────────────────────────

/** Minúsculas, sin acentos y con espacios simples, para comparar lo que dice la gente. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.,\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickString(value: unknown, allowed: readonly string[]): string | null {
  if (typeof value !== 'string') return null;
  const wanted = normalizeText(value);
  if (!wanted) return null;
  return allowed.find((code) => normalizeText(code) === wanted) ?? null;
}

/**
 * Deja pasar SOLO los campos permitidos y SOLO valores de las listas cerradas.
 * Cualquier otra cosa (un nombre, un monto, un valor inventado, un campo extra) se descarta.
 * Se usa con lo que devuelva cualquier proveedor de IA, porque su salida no es de confianza.
 */
export function sanitizeLotDraft(raw: unknown): LotDraft {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_LOT_DRAFT };
  const input = raw as Record<string, unknown>;

  const category = pickString(input.category, LOT_FIELD_RULES.category);
  const variety = category ? pickString(input.variety, LOT_FIELD_RULES.variety(category)) : null;
  const location = pickString(input.location, LOT_FIELD_RULES.location);
  const volumeRange =
    typeof input.volumeRange === 'number' && (LOT_FIELD_RULES.volumeRange as readonly number[]).includes(input.volumeRange)
      ? input.volumeRange
      : null;

  return { category, variety, location, volumeRange };
}

// ─────────────────────────────── Extractor por reglas ───────────────────────────────

function containsWord(text: string, word: string): boolean {
  return new RegExp(`(^|\\s)${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|[.,]|$)`).test(text);
}

/** Devuelve la única opción mencionada; si no hay ninguna o hay más de una, `null` (no está claro). */
function findSingle<T extends ClosedOption>(text: string, options: readonly T[]): T | null {
  const found = options.filter((o) => o.words.some((w) => containsWord(text, w)));
  return found.length === 1 ? found[0] : null;
}

const NUMBER_WORDS: Record<string, number> = {
  medio: 0.5, media: 0.5, un: 1, una: 1, uno: 1, par: 2, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
  siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, quince: 15, veinte: 20, treinta: 30,
  cuarenta: 40, cincuenta: 50, cien: 100, ciento: 100, doscientos: 200, trescientos: 300, quinientos: 500, mil: 1000,
};

/** Kilos aproximados por unidad. Un costal de café pergamino pesa alrededor de 50 kg. */
const UNIT_KG: Record<string, number> = {
  kg: 1, kilo: 1, kilos: 1, kilogramo: 1, kilogramos: 1,
  litro: 1, litros: 1,
  arroba: 11.5, arrobas: 11.5,
  costal: 50, costales: 50, bulto: 50, bultos: 50, saco: 50, sacos: 50,
  cubeta: 19, cubetas: 19, garrafa: 20, garrafas: 20,
  tonelada: 1000, toneladas: 1000,
};

function parseQuantity(token: string): number | null {
  if (/^\d+([.,]\d+)?$/.test(token)) return Number(token.replace(',', '.'));
  return NUMBER_WORDS[token] ?? null;
}

/** Busca "<cantidad> [de] <unidad>". Si hay dos cantidades distintas o falta la unidad, `null`. */
function findVolumeRange(text: string): number | null {
  const tokens = text.replace(/[,]/g, ' ').split(' ').filter(Boolean);
  const kilos = new Set<number>();
  for (let i = 0; i < tokens.length; i++) {
    const qty = parseQuantity(tokens[i]);
    if (qty === null) continue;
    let j = i + 1;
    if (tokens[j] === 'de') j++;
    const perUnit = UNIT_KG[tokens[j]];
    if (perUnit !== undefined) kilos.add(qty * perUnit);
  }
  if (kilos.size !== 1) return null;
  const kg = [...kilos][0];
  return VOLUME_RANGES.find((r) => kg >= r.minKg && kg < r.maxKg)?.code ?? null;
}

/**
 * Extractor sin IA, por palabras de las listas cerradas. Lo usa el proveedor simulado y sirve para
 * probar las reglas sin llamar a nadie. Por construcción solo puede devolver valores de las listas,
 * así que nunca devuelve un nombre de persona.
 */
export function extractLotByRules(text: string): LotDraft {
  if (typeof text !== 'string') return { ...EMPTY_LOT_DRAFT };
  const clean = normalizeText(text);
  if (!clean) return { ...EMPTY_LOT_DRAFT };

  const category = findSingle(clean, LOT_CATEGORIES);
  const variety = category ? findSingle(clean, category.varieties) : null;
  const municipality = findSingle(clean, LOT_MUNICIPALITIES);
  const region = municipality ? null : findSingle(clean, LOT_REGIONS);

  return sanitizeLotDraft({
    category: category?.code ?? null,
    variety: variety?.code ?? null,
    location: municipality?.code ?? region?.code ?? null,
    volumeRange: findVolumeRange(clean),
  });
}

/** Frase para leer en voz alta lo que se entendió (ADR-006, D3, paso 4). */
export function describeLotDraft(draft: LotDraft): string {
  const category = LOT_CATEGORIES.find((c) => c.code === draft.category);
  const parts: string[] = [];
  if (category) {
    const variety = category.varieties.find((v) => v.code === draft.variety);
    parts.push(variety ? `${category.label} ${variety.label.toLowerCase()}` : category.label);
  }
  const range = VOLUME_RANGES.find((r) => r.code === draft.volumeRange);
  if (range) parts.push(range.label);
  const place = [...LOT_MUNICIPALITIES, ...LOT_REGIONS].find((m) => m.code === draft.location);
  if (place) parts.push(`de ${place.label}`);
  return parts.length ? `Entendí: ${parts.join(', ')}. ¿Es correcto?` : 'No entendí los datos del lote. ¿Me los dice otra vez?';
}
