import {
  checkClabe,
  checkCurp,
  checkCurpRfcMatch,
  checkEmail,
  checkIdPhotos,
  checkRfc,
  computeClabeCheckDigit,
  computeCurpCheckDigit,
  computeRfcCheckChar,
  ETHERFUSE_OCCUPATION_CONSULTED_AT,
  normalizeName,
  occupationOptions,
} from '../core/payout/precheck';

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string): void {
  if (condition) {
    console.log(`  ✅ [CORRECTO] ${description}`);
    passed++;
  } else {
    console.error(`  ❌ [FALLO] ${description}`);
    failed++;
  }
}

const FORBIDDEN_JARGON = ['checksum', 'regex', 'invalid'];

function hasNoJargon(messages: readonly string[]): boolean {
  const joined = messages.join(' ').toLowerCase();
  return FORBIDDEN_JARGON.every((word) => !joined.includes(word));
}

function runTests(): void {
  console.log('================================================================================');
  console.log('   PRUEBAS: REVISIÓN PREVIA DE DATOS BANCARIOS (CURP, RFC, CLABE, INE) (#145)  ');
  console.log('================================================================================\n');

  // Datos sintéticos de prueba (inventados, sin datos personales reales)
  const curpBase17 = 'PRBA850515MOCRRN0';
  const curpDigit = computeCurpCheckDigit(curpBase17);
  const validCurp = `${curpBase17}${curpDigit}`;
  const wrongDigit = (curpDigit + 1) % 10;
  const invalidDigitCurp = `${curpBase17}${wrongDigit}`;

  console.log('📍 1. VALIDACIÓN DE CURP (18 CARACTERES Y DÍGITO VERIFICADOR)');
  const curpOk = checkCurp(validCurp);
  assert(curpOk.ok && curpOk.errors.length === 0, 'CURP sintética válida con dígito verificador correcto es aceptada');

  const curpBadDigit = checkCurp(invalidDigitCurp);
  assert(
    !curpBadDigit.ok && curpBadDigit.errors.length > 0 && hasNoJargon(curpBadDigit.errors),
    'CURP con el último dígito cambiado es rechazada con mensaje claro en español',
  );

  const curpShort = checkCurp(validCurp.slice(0, 17));
  assert(
    !curpShort.ok && curpShort.errors.some((e) => e.includes('falta un carácter')) && hasNoJargon(curpShort.errors),
    'CURP de 17 caracteres indica que le falta un carácter',
  );

  const curpBadState = checkCurp(`PRBA850515MZZRRN0${computeCurpCheckDigit('PRBA850515MZZRRN0')}`);
  assert(
    !curpBadState.ok && curpBadState.errors.some((e) => e.includes('estado')) && hasNoJargon(curpBadState.errors),
    'CURP con clave de entidad inexistente es rechazada',
  );

  console.log('\n📍 2. VALIDACIÓN DE RFC (PERSONA FÍSICA, HOMOCLAVE Y RECHAZO DE GENÉRICO)');
  const rfcBase12 = 'PRBA850515AB';
  const rfcCheck = computeRfcCheckChar(rfcBase12);
  const validRfc = `${rfcBase12}${rfcCheck}`;
  const alteredLastChar = rfcCheck === '0' ? '1' : '0';
  const invalidHomoclaveRfc = `${rfcBase12}${alteredLastChar}`;

  const rfcOk = checkRfc(validRfc);
  assert(rfcOk.ok && rfcOk.errors.length === 0, 'RFC sintético válido de 13 caracteres es aceptado');

  const rfcBadHomoclave = checkRfc(invalidHomoclaveRfc);
  assert(
    !rfcBadHomoclave.ok && rfcBadHomoclave.errors.length > 0 && hasNoJargon(rfcBadHomoclave.errors),
    'RFC con el dígito verificador de la homoclave alterado es rechazado',
  );

  const rfcGeneric = checkRfc('XAXX010101000');
  assert(
    !rfcGeneric.ok && rfcGeneric.errors.some((e) => e.includes('público en general')) && hasNoJargon(rfcGeneric.errors),
    'RFC genérico XAXX010101000 es rechazado explícitamente',
  );

  const rfcWithoutHomoclave = checkRfc('PRBA850515');
  assert(
    !rfcWithoutHomoclave.ok &&
      rfcWithoutHomoclave.errors.some((e) => e.includes('homoclave')) &&
      hasNoJargon(rfcWithoutHomoclave.errors),
    'RFC de 10 caracteres sin homoclave es rechazado indicando que faltan 3 caracteres',
  );

  console.log('\n📍 3. COINCIDENCIA ENTRE CURP Y RFC (AVISO SIN BLOQUEAR)');
  const matchSame = checkCurpRfcMatch(validCurp, validRfc);
  assert(
    matchSame.ok && matchSame.errors.length === 0 && matchSame.warnings.length === 0,
    'CURP y RFC con los mismos primeros 10 caracteres pasan sin avisos ni errores',
  );

  const otherRfcBase12 = 'OTRA900101AB';
  const otherRfc = `${otherRfcBase12}${computeRfcCheckChar(otherRfcBase12)}`;
  const matchDifferent = checkCurpRfcMatch(validCurp, otherRfc);
  assert(
    matchDifferent.ok &&
      matchDifferent.errors.length === 0 &&
      matchDifferent.warnings.length === 1 &&
      hasNoJargon(matchDifferent.warnings),
    'CURP y RFC con primeros 10 caracteres distintos devuelven aviso (warning) pero no error (ok: true)',
  );

  const matchIncomplete = checkCurpRfcMatch('PRBA85', validRfc);
  assert(
    !matchIncomplete.ok && matchIncomplete.errors.length === 1 && hasNoJargon(matchIncomplete.errors),
    'Comparación con datos incompletos pide escribir primero CURP y RFC completos',
  );

  console.log('\n📍 4. VALIDACIÓN DE CLABE (18 DÍGITOS, PESOS 3-7-1 Y BANCO)');
  const clabeBase17 = '01261000123456789';
  const clabeDigit = computeClabeCheckDigit(clabeBase17);
  const validClabe = `${clabeBase17}${clabeDigit}`;
  const badClabeDigit = (clabeDigit + 1) % 10;
  const invalidClabe = `${clabeBase17}${badClabeDigit}`;

  const clabeOk = checkClabe(validClabe);
  assert(
    clabeOk.ok && clabeOk.bankCode === '012' && clabeOk.bankName === 'BBVA México',
    `CLABE válida pasa y devuelve el banco (${clabeOk.bankName})`,
  );

  const clabeBadDigit = checkClabe(invalidClabe);
  assert(
    !clabeBadDigit.ok && clabeBadDigit.errors.length > 0 && hasNoJargon(clabeBadDigit.errors),
    'CLABE con un dígito cambiado es rechazada',
  );

  const clabeMissingOne = checkClabe(validClabe.slice(0, 17));
  assert(
    !clabeMissingOne.ok &&
      clabeMissingOne.errors.includes('A la CLABE le falta un número. Debe tener 18 números.') &&
      hasNoJargon(clabeMissingOne.errors),
    'CLABE de 17 dígitos devuelve mensaje exacto "A la CLABE le falta un número. Debe tener 18 números."',
  );

  const unknownBankBase17 = '99961000123456789';
  const unknownBankClabe = `${unknownBankBase17}${computeClabeCheckDigit(unknownBankBase17)}`;
  const clabeUnknownBank = checkClabe(unknownBankClabe);
  assert(
    !clabeUnknownBank.ok &&
      clabeUnknownBank.errors.some((e) => e.includes('banco registrado')) &&
      hasNoJargon(clabeUnknownBank.errors),
    'CLABE con código de banco inexistente es rechazada',
  );

  console.log('\n📍 5. NORMALIZACIÓN DE NOMBRE Y APELLIDOS (ACENTOS Y LETRA Ñ)');
  const nameOk = normalizeName('  artesana   unión ', '  núñez   peña  ');
  assert(
    nameOk.ok &&
      nameOk.normalizedFirstName === 'ARTESANA UNION' &&
      nameOk.normalizedLastName === 'NUÑEZ PEÑA' &&
      nameOk.normalizedName === 'ARTESANA UNION NUÑEZ PEÑA',
    'normalizeName pasa a mayúsculas, quita espacios dobles y acentos en vocales, y conserva la Ñ',
  );

  const nameInvalid = normalizeName('', 'APELLIDO 123');
  assert(
    !nameInvalid.ok && nameInvalid.errors.length === 2 && hasNoJargon(nameInvalid.errors),
    'normalizeName rechaza nombre vacío o apellidos con números',
  );

  console.log('\n📍 6. VALIDACIÓN DE CORREO ELECTRÓNICO');
  const emailOk = checkEmail('cooperativa.demo@comunidad.org.mx');
  assert(emailOk.ok && emailOk.errors.length === 0, 'Correo electrónico válido es aceptado');

  const emailBad = checkEmail('correo sin arroba');
  assert(
    !emailBad.ok && emailBad.errors.length > 0 && hasNoJargon(emailBad.errors),
    'Correo sin @ y con espacios es rechazado con explicación sencilla',
  );

  console.log('\n📍 7. REVISIÓN DE FOTOS DE LA CREDENCIAL INE (FRENTE, VUELTA, RESOLUCIÓN Y NITIDEZ)');
  const goodPhoto = {
    byteLength: 180_000,
    width: 1200,
    height: 800,
    sharpnessScore: 45,
  };
  const photosOk = checkIdPhotos({ front: goodPhoto, back: goodPhoto });
  assert(photosOk.ok && photosOk.errors.length === 0, 'Fotos de frente y vuelta nítidas y con buen tamaño son aceptadas');

  const missingBack = checkIdPhotos({ front: goodPhoto, back: null });
  assert(
    !missingBack.ok &&
      missingBack.errors.some((e) => e.includes('atrás de la credencial INE')) &&
      hasNoJargon(missingBack.errors),
    'Falta la foto de atrás de la INE -> devuelve error claro en español',
  );

  const blurryFront = checkIdPhotos({
    front: { ...goodPhoto, sharpnessScore: 5 },
    back: goodPhoto,
  });
  assert(
    !blurryFront.ok && blurryFront.errors.some((e) => e.includes('borrosa')) && hasNoJargon(blurryFront.errors),
    'Foto borrosa es detectada y rechazada con recomendación de apoyarse en una mesa',
  );

  const tinyResolution = checkIdPhotos({
    front: { byteLength: 50_000, width: 320, height: 200 },
    back: goodPhoto,
  });
  assert(
    !tinyResolution.ok &&
      tinyResolution.errors.some((e) => e.includes('muy pequeña')) &&
      hasNoJargon(tinyResolution.errors),
    'Foto con resolución menor al mínimo es rechazada',
  );

  console.log('\n📍 8. MENÚ DE OCUPACIONES PARA ETHERFUSE');
  const occupations = occupationOptions();
  assert(
    occupations.length >= 4 &&
      occupations.some((o) => o.label === 'Artesana' && o.etherfuseCode.length > 0) &&
      occupations.some((o) => o.label === 'Productora de café') &&
      ETHERFUSE_OCCUPATION_CONSULTED_AT === '2026-10-28',
    'occupationOptions devuelve etiquetas en español sencillo con código de Etherfuse y fecha de consulta',
  );

  console.log('\n--------------------------------------------------------------------------------');
  console.log(`TOTAL PRUEBAS: ${passed + failed} | APROBADAS: ${passed} | FALLIDAS: ${failed}`);
  console.log('--------------------------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
