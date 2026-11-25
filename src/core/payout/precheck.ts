/**
 * Verificación previa (pre-check) fuera de línea para datos de retiro bancario SPEI (Etherfuse).
 * 
 * Contexto:
 * Para cobrar por SPEI con Etherfuse (ADR-004, D9), la artesana necesita CURP, RFC,
 * CLABE a su nombre, correo y fotos de su INE. Si un dato está mal escrito, Etherfuse
 * rechaza el alta y la persona tiene que volver a empezar.
 * 
 * Este módulo realiza todas las validaciones en el teléfono, sin conexión y con reglas públicas,
 * devolviendo mensajes breves en lenguaje llano sin tecnicismos para que la promotora los lea en voz alta.
 * 
 * Reglas de diseño (AGENTS.md y ADR-004):
 * - No hace peticiones de red ni consulta RENAPO, SAT o terceros.
 * - No almacena datos en localStorage, IndexedDB ni archivos.
 * - Sin palabras técnicas como "checksum", "regex", "invalid" o "paridad".
 */

import { getBankByCode } from './clabeBanks';
import {
  ETHERFUSE_OCCUPATIONS,
  ETHERFUSE_OCCUPATIONS_FETCH_DATE,
  type EtherfuseOccupation,
} from './etherfuseOccupations';

export interface PrecheckResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface CurpCheckResult extends PrecheckResult {
  curp?: string;
}

export interface RfcCheckResult extends PrecheckResult {
  rfc?: string;
  isPersonaFisica?: boolean;
}

export interface ClabeCheckResult extends PrecheckResult {
  clabe?: string;
  bankCode?: string;
  bankName?: string;
}

export interface NameNormalizationResult extends PrecheckResult {
  normalized: string;
}

export interface EmailCheckResult extends PrecheckResult {
  email?: string;
}

export interface PhotoInfo {
  data?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  isBlurry?: boolean;
}

export interface IdPhotosInput {
  front?: PhotoInfo | string | null;
  back?: PhotoInfo | string | null;
}

export interface IdPhotosCheckResult extends PrecheckResult {
  frontOk: boolean;
  backOk: boolean;
}

export interface OccupationsResult extends PrecheckResult {
  options: readonly EtherfuseOccupation[];
  fetchDate: string;
}

// Diccionario oficial RENAPO para cálculo del dígito verificador de la CURP
const CURP_CHARS = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

// Mapeo oficial SAT para cálculo de la homoclave / dígito verificador del RFC
const RFC_CHAR_VALUES: Readonly<Record<string, number>> = Object.freeze({
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18,
  'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, '&': 24, 'O': 25, 'P': 26, 'Q': 27,
  'R': 28, 'S': 29, 'T': 30, 'U': 31, 'V': 32, 'W': 33, 'X': 34, 'Y': 35, 'Z': 36,
  ' ': 37, 'Ñ': 38,
});

// Expresión regular para estructura oficial de CURP mexicana
const CURP_PATTERN =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/;

// Expresión regular para estructura de RFC de persona física (13 caracteres)
const RFC_PERSONA_FISICA_PATTERN =
  /^[A-ZÑ&]{4}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[A-Z0-9]{2}[0-9A]$/;

// RFCs genéricos del SAT que no corresponden a una persona individual
const GENERIC_RFCS = new Set(['XAXX010101000', 'XEXX010101000']);

/**
 * 1. Revisa que la CURP tenga 18 caracteres, formato oficial mexicano y dígito verificador correcto.
 */
export function checkCurp(curpRaw: string): CurpCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const curp = (curpRaw ?? '').trim().toUpperCase();

  if (!curp) {
    errors.push('Escribe la CURP de la persona.');
    return { ok: false, errors, warnings };
  }

  if (curp.length !== 18) {
    errors.push('A la CURP le faltan o le sobran caracteres; debe tener exactamente 18 letras y números.');
    return { ok: false, errors, warnings };
  }

  if (!CURP_PATTERN.test(curp)) {
    errors.push('La CURP no tiene la estructura oficial (debe incluir letras de los apellidos y nombre, fecha de nacimiento, sexo, clave de estado y consonantes).');
    return { ok: false, errors, warnings };
  }

  // Comprobación del dígito verificador (posición 18)
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = curp[i];
    const val = CURP_CHARS.indexOf(char);
    if (val === -1) {
      errors.push('La CURP contiene un caracter que no forma parte del alfabeto oficial.');
      return { ok: false, errors, warnings };
    }
    sum += val * (18 - i);
  }

  const remainder = sum % 10;
  const expectedDigit = (10 - remainder) % 10;
  const actualDigit = Number(curp[17]);

  if (actualDigit !== expectedDigit) {
    errors.push('El último número de la CURP no coincide con el cálculo oficial; revisa si hay algún número o letra cambiado.');
    return { ok: false, errors, warnings };
  }

  return { ok: true, errors: [], warnings: [], curp };
}

/**
 * 2. Revisa que el RFC sea de persona física (13 caracteres), no sea genérico y coincida su clave final.
 */
export function checkRfc(rfcRaw: string): RfcCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rfc = (rfcRaw ?? '').trim().toUpperCase();

  if (!rfc) {
    errors.push('Escribe el RFC de la persona.');
    return { ok: false, errors, warnings, isPersonaFisica: false };
  }

  if (GENERIC_RFCS.has(rfc)) {
    errors.push('El RFC ingresado es el genérico (XAXX010101000); para retiros bancarios se requiere el RFC personal de la artesana.');
    return { ok: false, errors, warnings, isPersonaFisica: false };
  }

  if (rfc.length !== 13) {
    errors.push('El RFC de persona física debe tener exactamente 13 caracteres (4 letras, 6 números de fecha y 3 de la clave final).');
    return { ok: false, errors, warnings, isPersonaFisica: false };
  }

  if (!RFC_PERSONA_FISICA_PATTERN.test(rfc)) {
    errors.push('El RFC no tiene la estructura de persona física (4 letras, 6 números de fecha de nacimiento y 3 de la clave final).');
    return { ok: false, errors, warnings, isPersonaFisica: false };
  }

  // Comprobación del dígito de la homoclave (posición 13) según regla del SAT
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const char = rfc[i];
    const val = RFC_CHAR_VALUES[char];
    if (val === undefined) {
      errors.push('El RFC contiene un caracter no admitido en el cálculo del SAT.');
      return { ok: false, errors, warnings, isPersonaFisica: false };
    }
    sum += val * (13 - i);
  }

  const remainder = sum % 11;
  let expectedChar: string;
  if (remainder === 0) {
    expectedChar = '0';
  } else if (11 - remainder === 10) {
    expectedChar = 'A';
  } else {
    expectedChar = String(11 - remainder);
  }

  if (rfc[12] !== expectedChar) {
    errors.push('El último caracter del RFC no coincide con la clave final del SAT; revisa que esté bien copiado de tu constancia.');
    return { ok: false, errors, warnings, isPersonaFisica: false };
  }

  return { ok: true, errors: [], warnings: [], rfc, isPersonaFisica: true };
}

/**
 * 3. Compara los primeros 10 caracteres de la CURP y del RFC.
 * Si no coinciden, emite un aviso (warning) sin bloquear, ya que existen excepciones legítimas en el registro civil o SAT.
 */
export function checkCurpRfcMatch(curpRaw: string, rfcRaw: string): PrecheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const curp10 = (curpRaw ?? '').trim().slice(0, 10).toUpperCase();
  const rfc10 = (rfcRaw ?? '').trim().slice(0, 10).toUpperCase();

  if (!curp10 || !rfc10) {
    warnings.push('Falta ingresar la CURP o el RFC para comprobar que correspondan a la misma persona.');
    return { ok: true, errors, warnings };
  }

  if (curp10 !== rfc10) {
    warnings.push('Los primeros 10 caracteres de la CURP y del RFC no coinciden; revisa que ambos correspondan a la misma persona.');
  }

  return { ok: true, errors, warnings };
}

/**
 * 4. Revisa que la CLABE tenga 18 dígitos, comprueba su dígito de control ponderado (3, 7, 1)
 * y devuelve el nombre de la institución bancaria a partir de los 3 primeros dígitos.
 */
export function checkClabe(clabeRaw: string): ClabeCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const clabe = (clabeRaw ?? '').trim();

  if (!clabe) {
    errors.push('Escribe la cuenta CLABE interbancaria.');
    return { ok: false, errors, warnings };
  }

  if (!/^\d+$/.test(clabe)) {
    errors.push('La CLABE solo debe contener números, sin letras, espacios ni guiones.');
    return { ok: false, errors, warnings };
  }

  if (clabe.length !== 18) {
    errors.push('A la CLABE le faltan o le sobran números; debe tener exactamente 18 dígitos.');
    return { ok: false, errors, warnings };
  }

  // Ponderación estándar Banxico / ABM: pesos 3, 7, 1 periódicos
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const digit = Number(clabe[i]);
    sum += (digit * weights[i]) % 10;
  }

  const controlDigit = (10 - (sum % 10)) % 10;
  const actualControl = Number(clabe[17]);

  if (actualControl !== controlDigit) {
    errors.push('El último número de la CLABE no coincide con los anteriores; comprueba que no falte ni sobre ningún número.');
    return { ok: false, errors, warnings };
  }

  const bankCode = clabe.slice(0, 3);
  const bankName = getBankByCode(bankCode);

  if (!bankName) {
    warnings.push(`El banco con clave ${bankCode} no aparece en el catálogo habitual, pero la cuenta puede ser válida si es una caja de ahorro o cooperativa local.`);
  }

  return {
    ok: true,
    errors: [],
    warnings,
    clabe,
    bankCode,
    bankName,
  };
}

/**
 * 5. Normaliza nombres y apellidos para transferencias bancarias y SPEI.
 * 
 * ¿Por qué se normalizan los acentos y qué se hace con la Ñ?
 * Los sistemas de los bancos mexicanos, el CEP (Comprobante Electrónico de Pago) de Banxico
 * y las transferencias SPEI comparan el nombre del beneficiario eliminando los acentos diacríticos
 * (Á, É, Í, Ó, Ú, Ü -> A, E, I, O, U) para evitar discrepancias de codificación entre sistemas (ASCII vs UTF-8).
 * Sin embargo, la letra "Ñ" es una letra propia y fundamental del alfabeto en México y en apellidos
 * de comunidades oaxaqueñas (como Peña, Nuñez, Zavaleta, etc.). Se preserva la letra "Ñ" en mayúscula
 * tal como la reconoce el SAT y las instituciones financieras modernas, al tiempo que se limpian
 * espacios dobles y se convierte todo a mayúsculas uniformes.
 */
export function normalizeName(
  nombre: string,
  apellidos?: string
): NameNormalizationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const rawFull = [nombre ?? '', apellidos ?? ''].filter(Boolean).join(' ').trim();

  if (!rawFull) {
    errors.push('Escribe el nombre y apellidos de la persona tal como aparecen en su credencial de elector (INE).');
    return { ok: false, errors, warnings, normalized: '' };
  }

  // Reemplazo de vocales con acento preservando expresamente la Ñ
  let normalized = rawFull
    .toUpperCase()
    .replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[ÚÙÜÛ]/g, 'U')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    ok: true,
    errors: [],
    warnings: [],
    normalized,
  };
}

/**
 * 6. Revisa el formato básico de correo electrónico para avisos de retiro y comprobantes.
 */
export function checkEmail(emailRaw: string): EmailCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const email = (emailRaw ?? '').trim();

  if (!email) {
    errors.push('Escribe un correo electrónico para enviarte los avisos de tu retiro.');
    return { ok: false, errors, warnings };
  }

  // Formato general de correo: sin tecnicismos en el mensaje de error
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    errors.push('El correo electrónico no tiene la forma habitual (debe incluir el signo @ y la terminación, por ejemplo: persona@correo.com).');
    return { ok: false, errors, warnings };
  }

  return { ok: true, errors: [], warnings: [], email };
}

/**
 * 7. Revisa que ambas caras de la credencial (INE) estén presentes y tengan tamaño y claridad suficiente.
 * 
 * Mejora futura documentada:
 * En una siguiente versión se puede agregar la estimación de varianza laplaciana (Laplacian variance)
 * mediante Canvas en el navegador para detectar fotos borrosas en el teléfono antes de cargarlas.
 */
export function checkIdPhotos(photos: IdPhotosInput): IdPhotosCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hasFront = Boolean(photos?.front);
  const hasBack = Boolean(photos?.back);

  if (!hasFront) {
    errors.push('Falta la foto del frente de la credencial (INE).');
  }

  if (!hasBack) {
    errors.push('Falta la foto del reverso de la credencial (INE).');
  }

  // Inspección de calidad / tamaño si se proporciona el objeto con detalles
  if (hasFront && typeof photos.front === 'object' && photos.front !== null) {
    if (photos.front.sizeBytes !== undefined && photos.front.sizeBytes < 10240) {
      errors.push('La foto del frente es demasiado pequeña; toma una foto más clara donde se lean bien los datos.');
    }
    if (
      (photos.front.width !== undefined && photos.front.width < 400) ||
      (photos.front.height !== undefined && photos.front.height < 300)
    ) {
      errors.push('La resolución de la foto del frente es muy baja para distinguir las letras.');
    }
    if (photos.front.isBlurry) {
      warnings.push('La foto del frente se percibe borrosa; sugerimos tomarla de nuevo con buena luz y sin mover el teléfono.');
    }
  }

  if (hasBack && typeof photos.back === 'object' && photos.back !== null) {
    if (photos.back.sizeBytes !== undefined && photos.back.sizeBytes < 10240) {
      errors.push('La foto del reverso es demasiado pequeña; toma una foto más clara.');
    }
    if (
      (photos.back.width !== undefined && photos.back.width < 400) ||
      (photos.back.height !== undefined && photos.back.height < 300)
    ) {
      errors.push('La resolución de la foto del reverso es muy baja.');
    }
    if (photos.back.isBlurry) {
      warnings.push('La foto del reverso se percibe borrosa; sugerimos tomarla de nuevo.');
    }
  }

  const ok = errors.length === 0;
  return {
    ok,
    errors,
    warnings,
    frontOk: hasFront,
    backOk: hasBack,
  };
}

/**
 * 8. Menú de opciones de ocupación en lenguaje llano mapeadas a códigos del sandbox de Etherfuse.
 */
export function occupationOptions(): OccupationsResult {
  return {
    ok: true,
    errors: [],
    warnings: [],
    options: ETHERFUSE_OCCUPATIONS,
    fetchDate: ETHERFUSE_OCCUPATIONS_FETCH_DATE,
  };
}
