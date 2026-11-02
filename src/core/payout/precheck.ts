/**
 * Revisión previa en el teléfono (100 % sin conexión) de los datos requeridos
 * para el alta de retiros por SPEI con Etherfuse (ADR-004, D9; Issue #145).
 *
 * Reglas de diseño:
 * - Solo usa reglas públicas (formatos oficiales y dígitos verificadores de RENAPO, SAT y ABM/Banxico).
 * - No hace peticiones de red ni consulta RENAPO, el SAT ni servicios de terceros.
 * - No guarda nada en localStorage, sessionStorage, IndexedDB ni archivos.
 * - Todos los mensajes están en español sencillo, pensados para que la promotora o la artesana
 *   los lean en voz alta, sin tecnicismos como "checksum", "regex" o "invalid".
 */

import { CLABE_BANKS } from './clabeBanks';
import {
  ETHERFUSE_OCCUPATION_CONSULTED_AT,
  ETHERFUSE_OCCUPATION_OPTIONS,
  type OccupationOption,
} from './etherfuseOccupations';

export { CLABE_BANKS, ETHERFUSE_OCCUPATION_CONSULTED_AT, ETHERFUSE_OCCUPATION_OPTIONS };
export type { OccupationOption };

export interface PrecheckResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface ClabePrecheckResult extends PrecheckResult {
  bankCode?: string;
  bankName?: string;
}

export interface NamePrecheckResult extends PrecheckResult {
  normalizedName: string;
  normalizedFirstName: string;
  normalizedLastName: string;
}

export interface IdPhotoInput {
  /** Tamaño del archivo en bytes. */
  byteLength: number;
  /** Ancho de la imagen en píxeles. */
  width: number;
  /** Alto de la imagen en píxeles. */
  height: number;
  /** Tipo MIME opcional (por ejemplo, 'image/jpeg' o 'image/png'). */
  mimeType?: string;
  /**
   * Puntaje opcional de nitidez (0 a 100) calculado en el dispositivo.
   * Si es menor a 15, la imagen se considera borrosa.
   */
  sharpnessScore?: number;
  /**
   * Muestras opcionales de brillo (0 a 255) para estimar si la foto salió borrosa
   * o con reflejo de luz.
   */
  luminanceSamples?: readonly number[];
}

const RENAPO_STATES = new Set<string>([
  'AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH',
  'DF', 'DG', 'GT', 'GR', 'HG', 'JC', 'MC', 'MN',
  'MS', 'NT', 'NL', 'OC', 'PL', 'QT', 'QR', 'SP',
  'SL', 'SR', 'TC', 'TS', 'TL', 'VZ', 'YN', 'ZS',
  'NE',
]);

const CURP_CHARSET = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const RFC_CHARSET = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ';

const GENERIC_RFCS = new Set<string>(['XAXX010101000', 'XEXX010101000']);

const INTERNAL_CONSONANTS = new Set<string>([
  'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
  'N', 'Ñ', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z',
]);

function isAsciiDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function isSpanishLetter(ch: string): boolean {
  return (ch >= 'A' && ch <= 'Z') || ch === 'Ñ';
}

function isValidYyMmDd(yymmdd: string): boolean {
  if (yymmdd.length !== 6) return false;
  for (let i = 0; i < 6; i++) {
    if (!isAsciiDigit(yymmdd[i])) return false;
  }
  const yy = Number(yymmdd.slice(0, 2));
  const mm = Number(yymmdd.slice(2, 4));
  const dd = Number(yymmdd.slice(4, 6));
  if (mm < 1 || mm > 12 || dd < 1) return false;
  const daysByMonth = [31, yy % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dd <= daysByMonth[mm - 1];
}

/**
 * Calcula el dígito verificador oficial de la CURP (posición 18) a partir de los primeros 17 caracteres.
 */
export function computeCurpCheckDigit(first17: string): number {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const idx = CURP_CHARSET.indexOf(first17[i]);
    if (idx < 0) return -1;
    sum += idx * (18 - i);
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * 1. Revisa una CURP: 18 caracteres, estructura oficial y dígito verificador en la posición 18.
 */
export function checkCurp(curp: string): PrecheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const clean = (curp ?? '').trim().toUpperCase();

  if (!clean) {
    return {
      ok: false,
      errors: ['Falta escribir la CURP.'],
      warnings,
    };
  }

  if (clean.length < 18) {
    const missing = 18 - clean.length;
    errors.push(
      missing === 1
        ? 'A la CURP le falta un carácter. Debe tener 18 letras y números.'
        : `A la CURP le faltan ${missing} caracteres. Debe tener 18 letras y números.`,
    );
    return { ok: false, errors, warnings };
  }

  if (clean.length > 18) {
    const extra = clean.length - 18;
    errors.push(
      extra === 1
        ? 'A la CURP le sobra un carácter. Debe tener 18 letras y números.'
        : `A la CURP le sobran ${extra} caracteres. Debe tener 18 letras y números.`,
    );
    return { ok: false, errors, warnings };
  }

  for (let i = 0; i < 4; i++) {
    if (!isSpanishLetter(clean[i]) && clean[i] !== 'X') {
      errors.push('Las primeras 4 posiciones de la CURP deben ser letras de los apellidos y del nombre.');
      break;
    }
  }

  const birthPart = clean.slice(4, 10);
  if (!isValidYyMmDd(birthPart)) {
    errors.push('La fecha de nacimiento dentro de la CURP (posiciones 5 a 10) no corresponde a un año, mes y día reales.');
  }

  const sexChar = clean[10];
  if (sexChar !== 'H' && sexChar !== 'M' && sexChar !== 'X') {
    errors.push('La posición 11 de la CURP debe ser H, M o X.');
  }

  const stateCode = clean.slice(11, 13);
  if (!RENAPO_STATES.has(stateCode)) {
    errors.push('Las letras del estado de nacimiento en la CURP (posiciones 12 y 13) no existen en el catálogo nacional.');
  }

  for (let i = 13; i < 16; i++) {
    if (!INTERNAL_CONSONANTS.has(clean[i])) {
      errors.push('Las posiciones 14 a 16 de la CURP deben ser consonantes de los apellidos y del nombre.');
      break;
    }
  }

  const centuryChar = clean[16];
  if (!isAsciiDigit(centuryChar) && !(centuryChar >= 'A' && centuryChar <= 'Z')) {
    errors.push('El penúltimo carácter de la CURP debe ser una letra o un número.');
  }

  const checkChar = clean[17];
  if (!isAsciiDigit(checkChar)) {
    errors.push('El último carácter de la CURP debe ser un número del 0 al 9.');
  } else if (errors.length === 0) {
    const expectedDigit = computeCurpCheckDigit(clean.slice(0, 17));
    if (Number(checkChar) !== expectedDigit) {
      errors.push('El último número de la CURP no coincide. Revisa letra por letra que esté igual que en la credencial.');
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calcula el carácter verificador oficial del RFC de persona física (posición 13) según el Anexo 20 del SAT.
 */
export function computeRfcCheckChar(first12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const idx = RFC_CHARSET.indexOf(first12[i]);
    if (idx < 0) return '';
    sum += idx * (13 - i);
  }
  const rem = sum % 11;
  if (rem === 0) return '0';
  const diff = 11 - rem;
  if (diff === 10) return 'A';
  return String(diff);
}

/**
 * 2. Revisa un RFC de persona física: 13 caracteres, formato, rechazo de RFC genérico y dígito verificador de la homoclave.
 */
export function checkRfc(rfc: string): PrecheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const clean = (rfc ?? '').trim().toUpperCase();

  if (!clean) {
    return {
      ok: false,
      errors: ['Falta escribir el RFC.'],
      warnings,
    };
  }

  if (GENERIC_RFCS.has(clean)) {
    return {
      ok: false,
      errors: ['Ese RFC es de público en general y no sirve para cobrar en el banco. Se necesita el RFC propio con homoclave.'],
      warnings,
    };
  }

  if (clean.length < 13) {
    const missing = 13 - clean.length;
    errors.push(
      missing === 3
        ? 'Al RFC le faltan los 3 últimos caracteres de la homoclave. Debe tener 13 caracteres en total.'
        : `Al RFC le faltan ${missing} caracteres. El RFC de una persona debe tener 13 letras y números.`,
    );
    return { ok: false, errors, warnings };
  }

  if (clean.length > 13) {
    const extra = clean.length - 13;
    errors.push(
      extra === 1
        ? 'Al RFC le sobra un carácter. El RFC de una persona debe tener 13 letras y números.'
        : `Al RFC le sobran ${extra} caracteres. El RFC de una persona debe tener 13 letras y números.`,
    );
    return { ok: false, errors, warnings };
  }

  for (let i = 0; i < 4; i++) {
    const ch = clean[i];
    if (!isSpanishLetter(ch) && ch !== '&') {
      errors.push('Las primeras 4 posiciones del RFC deben ser letras de los apellidos y del nombre.');
      break;
    }
  }

  const birthPart = clean.slice(4, 10);
  if (!isValidYyMmDd(birthPart)) {
    errors.push('La fecha de nacimiento dentro del RFC (posiciones 5 a 10) no corresponde a un año, mes y día reales.');
  }

  for (let i = 10; i < 12; i++) {
    const ch = clean[i];
    if (!isAsciiDigit(ch) && !(ch >= 'A' && ch <= 'Z')) {
      errors.push('Los primeros dos caracteres de la homoclave del RFC (posiciones 11 y 12) deben ser letras o números.');
      break;
    }
  }

  const lastChar = clean[12];
  if (!isAsciiDigit(lastChar) && lastChar !== 'A') {
    errors.push('El último carácter del RFC debe ser un número del 0 al 9 o la letra A.');
  } else if (errors.length === 0) {
    const expectedChar = computeRfcCheckChar(clean.slice(0, 12));
    if (lastChar !== expectedChar) {
      errors.push('El último carácter de la homoclave del RFC no coincide. Revisa tu Constancia de Situación Fiscal.');
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 3. Compara los primeros 10 caracteres de la CURP y del RFC.
 * Normalmente coinciden; si no coinciden, devuelve un aviso (`warnings`) y no un error (`ok: true`),
 * porque existen excepciones legítimas entre RENAPO y el SAT.
 */
export function checkCurpRfcMatch(curp: string, rfc: string): PrecheckResult {
  const cleanCurp = (curp ?? '').trim().toUpperCase();
  const cleanRfc = (rfc ?? '').trim().toUpperCase();

  if (cleanCurp.length < 10 || cleanRfc.length < 10) {
    return {
      ok: false,
      errors: ['Escribe primero la CURP y el RFC completos para poder compararlos.'],
      warnings: [],
    };
  }

  if (cleanCurp.slice(0, 10) !== cleanRfc.slice(0, 10)) {
    return {
      ok: true,
      errors: [],
      warnings: [
        'Las primeras 10 letras y números de la CURP y del RFC no coinciden. Revisa si hay algún error al escribir; si así vienen en sus documentos oficiales, puedes continuar.',
      ],
    };
  }

  return {
    ok: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Calcula el dígito verificador de una CLABE (posición 18) con los pesos 3, 7 y 1.
 */
export function computeClabeCheckDigit(first17: string): number {
  const weights = [3, 7, 1];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const digit = Number(first17[i]);
    if (!Number.isInteger(digit) || digit < 0 || digit > 9) return -1;
    sum += (digit * weights[i % 3]) % 10;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * 4. Revisa una cuenta CLABE: 18 dígitos, dígito verificador (pesos 3, 7, 1) y nombre del banco
 * a partir de los 3 primeros dígitos (`CLABE_BANKS`).
 */
export function checkClabe(clabe: string): ClabePrecheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const clean = (clabe ?? '').trim();

  if (!clean) {
    return {
      ok: false,
      errors: ['Falta escribir los 18 números de la cuenta CLABE.'],
      warnings,
    };
  }

  for (let i = 0; i < clean.length; i++) {
    if (!isAsciiDigit(clean[i])) {
      return {
        ok: false,
        errors: ['La cuenta CLABE solo debe llevar números, sin espacios, guiones ni letras.'],
        warnings,
      };
    }
  }

  if (clean.length < 18) {
    const missing = 18 - clean.length;
    return {
      ok: false,
      errors: [
        missing === 1
          ? 'A la CLABE le falta un número. Debe tener 18 números.'
          : `A la CLABE le faltan ${missing} números. Debe tener 18 números.`,
      ],
      warnings,
    };
  }

  if (clean.length > 18) {
    const extra = clean.length - 18;
    return {
      ok: false,
      errors: [
        extra === 1
          ? 'A la CLABE le sobra un número. Debe tener 18 números.'
          : `A la CLABE le sobran ${extra} números. Debe tener 18 números.`,
      ],
      warnings,
    };
  }

  const bankCode = clean.slice(0, 3);
  const bankName = CLABE_BANKS[bankCode];
  if (!bankName) {
    errors.push('Los primeros 3 números de la CLABE no corresponden a un banco registrado en México. Revisa tu estado de cuenta.');
  }

  const expectedDigit = computeClabeCheckDigit(clean.slice(0, 17));
  if (Number(clean[17]) !== expectedDigit) {
    errors.push('El último número de la CLABE no coincide. Revisa número por número en tu estado de cuenta o contrato del banco.');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    bankCode,
    bankName,
  };
}

/**
 * 5. Normaliza nombre(s) y apellidos tal como deben enviarse para el cotejo bancario y con la INE:
 * - Convierte a MAYÚSCULAS y quita espacios repetidos al inicio, en medio y al final.
 * - Qué hacemos con acentos y con la Ñ, y por qué:
 *   En los padrones del INE, RENAPO y en las transferencias SPEI (Banxico), los nombres se escriben
 *   en mayúsculas sin acentos gráficos ni diéresis en las vocales (`ÁÉÍÓÚÜ` -> `AEIOUU`) para evitar
 *   rechazos por diferencias de codificación entre bancos. En cambio, la letra `Ñ` es una letra
 *   distinta en el alfabeto oficial mexicano (INE/RENAPO/SAT) y se conserva como `Ñ`.
 */
export function normalizeName(nombre: string, apellidos: string): NamePrecheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const stripVowelAccents = (value: string): string =>
    value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .replace(/Á/g, 'A')
      .replace(/À/g, 'A')
      .replace(/Ä/g, 'A')
      .replace(/É/g, 'E')
      .replace(/È/g, 'E')
      .replace(/Ë/g, 'E')
      .replace(/Í/g, 'I')
      .replace(/Ì/g, 'I')
      .replace(/Ï/g, 'I')
      .replace(/Ó/g, 'O')
      .replace(/Ò/g, 'O')
      .replace(/Ö/g, 'O')
      .replace(/Ú/g, 'U')
      .replace(/Ù/g, 'U')
      .replace(/Ü/g, 'U');

  const normalizedFirstName = stripVowelAccents(nombre ?? '');
  const normalizedLastName = stripVowelAccents(apellidos ?? '');

  if (!normalizedFirstName) {
    errors.push('Falta escribir el nombre tal como aparece en la credencial INE.');
  }
  if (!normalizedLastName) {
    errors.push('Falta escribir los apellidos tal como aparecen en la credencial INE.');
  }

  const hasDisallowedChars = (value: string): boolean => {
    for (let i = 0; i < value.length; i++) {
      const ch = value[i];
      if (!isSpanishLetter(ch) && ch !== ' ' && ch !== '.' && ch !== '-') {
        return true;
      }
    }
    return false;
  };

  if (normalizedFirstName && hasDisallowedChars(normalizedFirstName)) {
    errors.push('El nombre solo debe llevar letras y espacios, sin números.');
  }
  if (normalizedLastName && hasDisallowedChars(normalizedLastName)) {
    errors.push('Los apellidos solo deben llevar letras y espacios, sin números.');
  }

  const normalizedName = [normalizedFirstName, normalizedLastName].filter(Boolean).join(' ');

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    normalizedName,
    normalizedFirstName,
    normalizedLastName,
  };
}

/**
 * 6. Revisa el formato del correo electrónico con mensajes sencillos en español.
 */
export function checkEmail(email: string): PrecheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const clean = (email ?? '').trim();

  if (!clean) {
    return {
      ok: false,
      errors: ['Falta escribir el correo electrónico.'],
      warnings,
    };
  }

  if (clean.includes(' ')) {
    errors.push('El correo electrónico no debe tener espacios.');
  }

  const atParts = clean.split('@');
  if (atParts.length !== 2) {
    errors.push('El correo electrónico debe llevar un símbolo @ en medio (por ejemplo, nombre@correo.com).');
    return { ok: false, errors, warnings };
  }

  const [localPart, domainPart] = atParts;
  if (!localPart) {
    errors.push('Falta escribir la primera parte del correo antes del símbolo @.');
  }

  if (!domainPart || !domainPart.includes('.')) {
    errors.push('Al correo le falta el final después del símbolo @ (por ejemplo, gmail.com o outlook.com).');
  } else {
    const domainPieces = domainPart.split('.');
    const hasEmptyPiece = domainPieces.some((piece) => piece.length === 0);
    const lastPiece = domainPieces[domainPieces.length - 1] ?? '';
    if (hasEmptyPiece || lastPiece.length < 2) {
      errors.push('El final del correo electrónico está incompleto. Revisa lo que va después del punto.');
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

const MIN_ID_PHOTO_BYTES = 15_000;
const MAX_ID_PHOTO_BYTES = 4_000_000;
const MIN_ID_PHOTO_LONG_SIDE = 600;
const MIN_ID_PHOTO_SHORT_SIDE = 400;
const MIN_SHARPNESS_SCORE = 15;

function computeSampleContrastScore(samples: readonly number[]): number {
  if (samples.length < 2) return 100;
  let diffSum = 0;
  for (let i = 1; i < samples.length; i++) {
    diffSum += Math.abs(samples[i] - samples[i - 1]);
  }
  return diffSum / (samples.length - 1);
}

/**
 * 7. Revisa las fotos de ambos lados de la credencial INE (frente y vuelta):
 * - Que estén presentes las dos caras.
 * - Que cumplan tamaño mínimo/máximo y resolución mínima para que se lean las letras.
 * - Revisión sencilla de foto borrosa a partir de `sharpnessScore` o `luminanceSamples`.
 */
export function checkIdPhotos(photos: {
  front?: IdPhotoInput | null;
  back?: IdPhotoInput | null;
}): PrecheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const front = photos?.front ?? null;
  const back = photos?.back ?? null;

  if (!front) {
    errors.push('Falta tomar la foto del frente de la credencial INE.');
  }
  if (!back) {
    errors.push('Falta tomar la foto de la parte de atrás de la credencial INE.');
  }

  const validateSide = (side: IdPhotoInput, label: string) => {
    if (side.byteLength < MIN_ID_PHOTO_BYTES) {
      errors.push(`La foto ${label} de la INE pesa muy poco y no se distingue bien. Tómala más de cerca y con buena luz.`);
    } else if (side.byteLength > MAX_ID_PHOTO_BYTES) {
      errors.push(`La foto ${label} de la INE es muy pesada. Acércate un poco y vuelve a tomarla.`);
    }

    const longSide = Math.max(side.width, side.height);
    const shortSide = Math.min(side.width, side.height);
    if (longSide < MIN_ID_PHOTO_LONG_SIDE || shortSide < MIN_ID_PHOTO_SHORT_SIDE) {
      errors.push(
        `La foto ${label} de la INE es muy pequeña y no se alcanzan a leer los datos. Acerca más el teléfono a la credencial.`,
      );
    }

    if (typeof side.sharpnessScore === 'number' && side.sharpnessScore < MIN_SHARPNESS_SCORE) {
      errors.push(
        `La foto ${label} de la INE se ve borrosa. Pon la credencial sobre una mesa con buena luz y sin mover el teléfono.`,
      );
    } else if (side.luminanceSamples && side.luminanceSamples.length >= 4) {
      const contrast = computeSampleContrastScore(side.luminanceSamples);
      if (contrast < 8) {
        errors.push(
          `La foto ${label} de la INE se ve borrosa o empañada. Limpia la cámara y vuelve a tomarla sobre una mesa.`,
        );
      }
    }
  };

  if (front) {
    validateSide(front, 'del frente');
  }
  if (back) {
    validateSide(back, 'de atrás');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 8. Devuelve el menú corto de ocupaciones en español sencillo mapeado a los códigos de Etherfuse.
 */
export function occupationOptions(): readonly OccupationOption[] {
  return ETHERFUSE_OCCUPATION_OPTIONS;
}
