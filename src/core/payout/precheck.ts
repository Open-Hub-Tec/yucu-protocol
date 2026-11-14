/**
 * Revisión previa en el teléfono (sin conexión) para los datos de retiro por SPEI
 * con Etherfuse (ADR-004, D9).
 *
 * Reglas:
 * - Solo usa formatos públicos y dígitos verificadores oficiales (CURP, RFC, CLABE).
 * - Nunca consulta RENAPO, el SAT ni servicios externos, ni guarda nada en el dispositivo.
 * - Todos los mensajes están en español sencillo, pensados para que la promotora los lea
 *   en voz alta junto con la artesana, sin palabras técnicas.
 */

import { lookupBankByClabePrefix } from './banks';
import {
  ETHERFUSE_OCCUPATION_CATALOG,
  type OccupationOption,
} from './occupations';

export interface PrecheckResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface ClabePrecheckResult extends PrecheckResult {
  bankCode?: string;
  bankName?: string;
}

export interface NormalizedNameResult extends PrecheckResult {
  fullName: string;
  givenNames: string;
  surnames: string;
}

export interface IdPhotoMetadata {
  /** Tamaño del archivo en bytes */
  sizeBytes: number;
  /** Ancho de la imagen en píxeles */
  width: number;
  /** Alto de la imagen en píxeles */
  height: number;
  /**
   * Puntaje opcional de nitidez (p. ej. varianza del operador Laplaciano).
   * Si se proporciona y es menor a 40, se avisa que la foto se ve borrosa.
   */
  sharpnessScore?: number;
}

export interface IdPhotosInput {
  front?: IdPhotoMetadata | null;
  back?: IdPhotoMetadata | null;
}

export interface OccupationOptionsResult extends PrecheckResult {
  options: readonly OccupationOption[];
}

const VALID_MEXICAN_STATES = new Set([
  'AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH',
  'DF', 'DG', 'GT', 'GR', 'HG', 'JC', 'MC', 'MN',
  'MS', 'NT', 'NL', 'OC', 'PL', 'QT', 'QR', 'SP',
  'SL', 'SR', 'TC', 'TS', 'TL', 'VZ', 'YN', 'ZS',
  'NE',
]);

const CURP_CHARSET = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const RFC_CHARSET = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ';

const GENERIC_RFCS = new Set(['XAXX010101000', 'XEXX010101000']);

/**
 * Comprueba que los 6 dígitos AAMMDD correspondan a un mes (01-12) y día posibles del calendario.
 */
function hasValidSixDigitDate(yymmdd: string): boolean {
  if (!/^\d{6}$/.test(yymmdd)) {
    return false;
  }
  const yy = Number(yymmdd.slice(0, 2));
  const mm = Number(yymmdd.slice(2, 4));
  const dd = Number(yymmdd.slice(4, 6));

  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return false;
  }

  const daysByMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (dd > daysByMonth[mm - 1]) {
    return false;
  }

  // En febrero con día 29, el año de dos dígitos debe ser bisiesto (múltiplo de 4).
  if (mm === 2 && dd === 29 && yy % 4 !== 0) {
    return false;
  }

  return true;
}

/**
 * Calcula el último número verificador oficial de una CURP de 18 caracteres.
 */
export function computeCurpVerificationDigit(first17: string): string {
  let sum = 0;
  for (let i = 0; i < 17; i += 1) {
    const idx = CURP_CHARSET.indexOf(first17[i]);
    if (idx < 0) {
      return '';
    }
    sum += idx * (18 - i);
  }
  const digit = (10 - (sum % 10)) % 10;
  return String(digit);
}

/**
 * 1. Revisa la CURP: 18 caracteres, estructura oficial y último número verificador (posición 18).
 */
export function checkCurp(curp: string): PrecheckResult {
  const cleaned = (curp || '').trim().toUpperCase();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!cleaned) {
    errors.push('Falta escribir la CURP.');
    return { ok: false, errors, warnings };
  }

  if (cleaned.length < 18) {
    errors.push(`A la CURP le faltan letras o números: tiene ${cleaned.length} y deben ser 18.`);
    return { ok: false, errors, warnings };
  }

  if (cleaned.length > 18) {
    errors.push(`A la CURP le sobran letras o números: tiene ${cleaned.length} y deben ser 18.`);
    return { ok: false, errors, warnings };
  }

  const prefixLetters = cleaned.slice(0, 4);
  const birthDate = cleaned.slice(4, 10);
  const sexLetter = cleaned.slice(10, 11);
  const stateCode = cleaned.slice(11, 13);
  const internalConsonants = cleaned.slice(13, 16);
  const homoclaveChar = cleaned.slice(16, 17);
  const lastDigit = cleaned.slice(17, 18);

  if (!/^[A-ZÑ][AEIOUX][A-ZÑ]{2}$/.test(prefixLetters)) {
    errors.push('Las primeras 4 letras de la CURP no coinciden con las iniciales del nombre y apellidos.');
  }

  if (!hasValidSixDigitDate(birthDate)) {
    errors.push('La fecha de nacimiento dentro de la CURP (posiciones 5 a 10) tiene un mes o día que no existe.');
  }

  if (!/^[HMX]$/.test(sexLetter)) {
    errors.push('La letra de sexo en la posición 11 de la CURP debe ser H, M o X.');
  }

  if (!VALID_MEXICAN_STATES.has(stateCode)) {
    errors.push('Las dos letras del estado de nacimiento en la CURP (posiciones 12 y 13) no corresponden a ningún estado.');
  }

  if (!/^[B-DF-HJ-NP-TV-ZÑ]{3}$/.test(internalConsonants)) {
    errors.push('Las letras en las posiciones 14 a 16 de la CURP deben ser tres consonantes.');
  }

  if (!/^[0-9A-Z]$/.test(homoclaveChar)) {
    errors.push('El carácter en la posición 17 de la CURP debe ser una letra o un número.');
  }

  if (!/^\d$/.test(lastDigit)) {
    errors.push('El último carácter de la CURP (posición 18) debe ser un número del 0 al 9.');
  }

  if (errors.length === 0) {
    const expectedDigit = computeCurpVerificationDigit(cleaned.slice(0, 17));
    if (lastDigit !== expectedDigit) {
      errors.push(
        'El último número de la CURP no coincide con el resto de las letras. Revisa letra por letra con la credencial del INE.'
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calcula el carácter verificador oficial (posición 13) de un RFC de persona física.
 */
export function computeRfcVerificationChar(first12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const idx = RFC_CHARSET.indexOf(first12[i]);
    if (idx < 0) {
      return '';
    }
    sum += idx * (13 - i);
  }
  const remainder = sum % 11;
  if (remainder === 0) {
    return '0';
  }
  const complement = 11 - remainder;
  if (complement === 10) {
    return 'A';
  }
  return String(complement);
}

/**
 * 2. Revisa el RFC de persona física: 13 caracteres, estructura, homoclave verificada
 *    y rechazo del RFC genérico `XAXX010101000`.
 */
export function checkRfc(rfc: string): PrecheckResult {
  const cleaned = (rfc || '').trim().toUpperCase();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!cleaned) {
    errors.push('Falta escribir el RFC.');
    return { ok: false, errors, warnings };
  }

  if (GENERIC_RFCS.has(cleaned)) {
    errors.push(
      'Ese RFC es genérico para ventas al público en general. Para cobrar por transferencia necesitas el RFC personal que viene en tu constancia del SAT.'
    );
    return { ok: false, errors, warnings };
  }

  if (cleaned.length < 13) {
    errors.push(
      `Al RFC le faltan letras o números: tiene ${cleaned.length} y el de una persona debe tener 13 (con los 3 últimos de la homoclave).`
    );
    return { ok: false, errors, warnings };
  }

  if (cleaned.length > 13) {
    errors.push(`Al RFC le sobran letras o números: tiene ${cleaned.length} y deben ser 13.`);
    return { ok: false, errors, warnings };
  }

  const prefixLetters = cleaned.slice(0, 4);
  const birthDate = cleaned.slice(4, 10);
  const homoclaveBody = cleaned.slice(10, 12);
  const lastChar = cleaned.slice(12, 13);

  if (!/^[A-ZÑ&]{4}$/.test(prefixLetters)) {
    errors.push('Las primeras 4 posiciones del RFC deben ser letras de los apellidos y nombre.');
  }

  if (!hasValidSixDigitDate(birthDate)) {
    errors.push('La fecha de nacimiento dentro del RFC (posiciones 5 a 10) tiene un mes o día que no existe.');
  }

  if (!/^[A-Z0-9]{2}$/.test(homoclaveBody) || !/^[0-9A]$/.test(lastChar)) {
    errors.push('Los últimos 3 caracteres del RFC (la homoclave) tienen una letra o símbolo no permitido.');
  }

  if (errors.length === 0) {
    const expectedLast = computeRfcVerificationChar(cleaned.slice(0, 12));
    if (lastChar !== expectedLast) {
      errors.push(
        'El último carácter del RFC no coincide con el resto de los datos. Revisa los últimos 3 caracteres en tu constancia fiscal.'
      );
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
 *    Si no coinciden, devuelve una advertencia (`warnings`), no un error (`ok: true`),
 *    porque existen excepciones reales cuando el SAT o el Registro Civil corrigieron una letra.
 */
export function checkCurpRfcMatch(curp: string, rfc: string): PrecheckResult {
  const cleanCurp = (curp || '').trim().toUpperCase();
  const cleanRfc = (rfc || '').trim().toUpperCase();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (cleanCurp.length < 10 || cleanRfc.length < 10) {
    errors.push('Escribe primero la CURP y el RFC completos para poder compararlos.');
    return { ok: false, errors, warnings };
  }

  const curpFirst10 = cleanCurp.slice(0, 10);
  const rfcFirst10 = cleanRfc.slice(0, 10);

  if (curpFirst10 !== rfcFirst10) {
    warnings.push(
      'Las primeras 10 letras y números de la CURP y del RFC no son iguales. Revisa que los dos pertenezcan a la misma persona antes de continuar.'
    );
  }

  return {
    ok: true,
    errors,
    warnings,
  };
}

/**
 * Calcula el último dígito verificador de una CLABE de 18 números (ponderadores 3, 7, 1).
 */
export function computeClabeVerificationDigit(first17Digits: string): string {
  const weights = [3, 7, 1];
  let sum = 0;
  for (let i = 0; i < 17; i += 1) {
    const digit = Number(first17Digits[i]);
    if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
      return '';
    }
    const productMod10 = (digit * weights[i % 3]) % 10;
    sum += productMod10;
  }
  const controlDigit = (10 - (sum % 10)) % 10;
  return String(controlDigit);
}

/**
 * 4. Revisa la CLABE interbancaria: 18 números, último dígito verificador (pesos 3, 7, 1)
 *    y nombre del banco a partir de los primeros 3 dígitos.
 */
export function checkClabe(clabe: string): ClabePrecheckResult {
  const cleaned = (clabe || '').replace(/\s+/g, '');
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!cleaned) {
    errors.push('Falta escribir los 18 números de la CLABE bancaria.');
    return { ok: false, errors, warnings };
  }

  if (!/^\d+$/.test(cleaned)) {
    errors.push('La CLABE solo debe llevar números, sin letras ni guiones.');
    return { ok: false, errors, warnings };
  }

  if (cleaned.length < 18) {
    const diff = 18 - cleaned.length;
    errors.push(
      diff === 1
        ? 'A la CLABE le falta un número: tiene 17 y deben ser 18.'
        : `A la CLABE le faltan ${diff} números: tiene ${cleaned.length} y deben ser 18.`
    );
    return { ok: false, errors, warnings };
  }

  if (cleaned.length > 18) {
    const diff = cleaned.length - 18;
    errors.push(
      diff === 1
        ? 'A la CLABE le sobra un número: tiene 19 y deben ser 18.'
        : `A la CLABE le sobran ${diff} números: tiene ${cleaned.length} y deben ser 18.`
    );
    return { ok: false, errors, warnings };
  }

  const bankCode = cleaned.slice(0, 3);
  const bankName = lookupBankByClabePrefix(bankCode);

  if (!bankName) {
    errors.push(
      `Los primeros 3 números de la CLABE (${bankCode}) no corresponden a un banco registrado en SPEI.`
    );
  }

  const expectedLastDigit = computeClabeVerificationDigit(cleaned.slice(0, 17));
  if (cleaned[17] !== expectedLastDigit) {
    errors.push(
      'Uno de los números de la CLABE está mal escrito. Compárala número por número con tu estado de cuenta.'
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }

  return {
    ok: true,
    errors,
    warnings,
    bankCode,
    bankName,
  };
}

/**
 * 5. Limpia y pone en mayúsculas el nombre y los apellidos tal como aparecen en la INE.
 *
 * Qué se hace con los acentos y la letra Ñ, y por qué:
 * - Se quitan los acentos de las vocales (`ÁÉÍÓÚÜ` -> `AEIOUU`) porque la credencial del INE
 *   imprime el nombre en mayúsculas sin tildes y los sistemas bancarios (SPEI / CEP de Banxico)
 *   comparan el titular sin acentos.
 * - Se CONSERVA la letra `Ñ` (no se cambia por `N` ni por `X`) porque en el Registro Civil,
 *   en la credencial del INE y en el padrón de bancos mexicanos la `Ñ` es una letra distinta
 *   (por ejemplo en apellidos mixtecos o españoles como "Ñumí", "Yáñez" o "Muñoz"); cambiarla
 *   por `N` puede hacer que el banco rechace la coincidencia del nombre con la INE.
 */
export function normalizeName(nombre: string, apellidos: string): NormalizedNameResult {
  const cleanPart = (raw: string): string => {
    const protectedEnie = (raw || '')
      .trim()
      .toUpperCase()
      .replace(/Ñ/g, '__ENIE__');

    const withoutVowelAccents = protectedEnie
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/__ENIE__/g, 'Ñ');

    return withoutVowelAccents.replace(/\s+/g, ' ').trim();
  };

  const givenNames = cleanPart(nombre);
  const surnames = cleanPart(apellidos);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!givenNames) {
    errors.push('Falta escribir el nombre de pila tal como viene en la credencial del INE.');
  } else if (!/^[A-ZÑ ]+$/.test(givenNames)) {
    errors.push('El nombre solo debe llevar letras y espacios, sin números ni puntos.');
  }

  if (!surnames) {
    errors.push('Falta escribir los apellidos tal como vienen en la credencial del INE.');
  } else if (!/^[A-ZÑ ]+$/.test(surnames)) {
    errors.push('Los apellidos solo deben llevar letras y espacios, sin números ni puntos.');
  }

  const fullName = [givenNames, surnames].filter(Boolean).join(' ');

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    fullName,
    givenNames,
    surnames,
  };
}

/**
 * 6. Revisa únicamente que el correo electrónico esté bien escrito (la confirmación por código es de W35).
 */
export function checkEmail(email: string): PrecheckResult {
  const cleaned = (email || '').trim();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!cleaned) {
    errors.push('Falta escribir el correo electrónico donde llegará el código de confirmación.');
    return { ok: false, errors, warnings };
  }

  if (/\s/.test(cleaned)) {
    errors.push('El correo electrónico no debe tener espacios en blanco.');
    return { ok: false, errors, warnings };
  }

  const parts = cleaned.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    errors.push('Al correo electrónico le falta el símbolo @ o el nombre después del @ (por ejemplo: maria@gmail.com).');
    return { ok: false, errors, warnings };
  }

  const [localPart, domainPart] = parts;
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    errors.push('La primera parte del correo electrónico tiene puntos seguidos o al principio.');
    return { ok: false, errors, warnings };
  }

  const domainSegments = domainPart.split('.');
  if (
    domainSegments.length < 2 ||
    domainSegments.some((seg) => seg.length === 0) ||
    domainSegments[domainSegments.length - 1].length < 2
  ) {
    errors.push('Al correo electrónico le falta la terminación después del punto (por ejemplo: .com o .mx).');
    return { ok: false, errors, warnings };
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

const MIN_PHOTO_BYTES = 15_000;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MIN_PHOTO_WIDTH = 600;
const MIN_PHOTO_HEIGHT = 400;
const MIN_SHARPNESS_SCORE = 40;

/**
 * 7. Revisa las fotos de ambos lados de la credencial del INE: que estén presentes,
 *    que tengan tamaño y resolución suficientes para leerse y, cuando el teléfono entrega
 *    el puntaje de nitidez (`sharpnessScore`), que no estén borrosas.
 *
 * Nota de mejora futura en campo: cuando se tome la foto directamente desde el `<canvas>`
 * de la cámara en W35, se puede calcular `sharpnessScore` con la varianza de bordes sobre
 * la imagen en gris antes de comprimirla.
 */
export function checkIdPhotos(input: IdPhotosInput): PrecheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const inspectSide = (photo: IdPhotoMetadata | null | undefined, label: string) => {
    if (!photo) {
      errors.push(`Falta tomar la foto de ${label} de la credencial del INE.`);
      return;
    }

    if (photo.sizeBytes < MIN_PHOTO_BYTES) {
      errors.push(
        `La foto de ${label} de la INE pesa muy poco y no se van a distinguir las letras. Tómala de nuevo más cerca.`
      );
    } else if (photo.sizeBytes > MAX_PHOTO_BYTES) {
      errors.push(
        `La foto de ${label} de la INE es demasiado pesada. Tómala de nuevo desde la cámara de la aplicación.`
      );
    }

    const longestSide = Math.max(photo.width, photo.height);
    const shortestSide = Math.min(photo.width, photo.height);
    if (longestSide < MIN_PHOTO_WIDTH || shortestSide < MIN_PHOTO_HEIGHT) {
      errors.push(
        `La foto de ${label} de la INE salió muy pequeña. Acerca más el celular para que la credencial llene el recuadro.`
      );
    }

    if (typeof photo.sharpnessScore === 'number' && photo.sharpnessScore < MIN_SHARPNESS_SCORE) {
      errors.push(
        `La foto de ${label} de la INE se ve borrosa. Apoya los codos y tómala con buena luz del día sin reflejos.`
      );
    }
  };

  inspectSide(input?.front, 'la parte de enfrente');
  inspectSide(input?.back, 'la parte de atrás');

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 8. Devuelve el menú corto de ocupaciones en español sencillo mapeado a los códigos
 *    del sandbox de Etherfuse (`src/core/payout/occupations.ts`), conservando el formato
 *    `{ ok, errors, warnings, options }`.
 */
export function occupationOptions(): OccupationOptionsResult {
  return {
    ok: true,
    errors: [],
    warnings: [],
    options: ETHERFUSE_OCCUPATION_CATALOG,
  };
}
