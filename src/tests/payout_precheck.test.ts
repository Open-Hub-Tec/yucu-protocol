import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkClabe,
  checkCurp,
  checkCurpRfcMatch,
  checkEmail,
  checkIdPhotos,
  checkRfc,
  computeClabeVerificationDigit,
  computeCurpVerificationDigit,
  computeRfcVerificationChar,
  normalizeName,
  occupationOptions,
} from '../core/payout/precheck';

/**
 * Construye una CURP sintética de prueba (nunca de una persona real) calculando
 * su último dígito verificador oficial.
 */
function buildSyntheticCurp(prefix17Parts: string[]): string {
  const first17 = prefix17Parts.join('');
  return first17 + computeCurpVerificationDigit(first17);
}

/**
 * Construye un RFC sintético de prueba (persona física) calculando el carácter
 * verificador de la posición 13.
 */
function buildSyntheticRfc(first12Parts: string[]): string {
  const first12 = first12Parts.join('');
  return first12 + computeRfcVerificationChar(first12);
}

/**
 * Construye una CLABE sintética de prueba calculando su dígito de control (posición 18).
 */
function buildSyntheticClabe(bankPrefix: string, account14Digits: string): string {
  const first17 = bankPrefix + account14Digits;
  return first17 + computeClabeVerificationDigit(first17);
}

describe('W34 (#145) Revisión previa en el teléfono para retiro por SPEI (CURP, RFC, CLABE, INE)', () => {
  it('acepta una CURP sintética bien formada y rechaza la misma si cambia el último dígito', () => {
    const validCurp = buildSyntheticCurp(['GODE', '561231', 'M', 'OC', 'LRR', '0']);
    const okResult = checkCurp(validCurp);
    assert.equal(okResult.ok, true);
    assert.deepEqual(okResult.errors, []);

    const lastDigit = Number(validCurp[17]);
    const alteredLastDigit = String((lastDigit + 1) % 10);
    const tamperedCurp = validCurp.slice(0, 17) + alteredLastDigit;

    const badResult = checkCurp(tamperedCurp);
    assert.equal(badResult.ok, false);
    assert.ok(badResult.errors.length > 0);
    assert.match(badResult.errors[0], /último número de la CURP no coincide/);
  });

  it('rechaza una CURP incompleta o con fecha de nacimiento imposible', () => {
    const shortResult = checkCurp('GODE561231');
    assert.equal(shortResult.ok, false);
    assert.match(shortResult.errors[0], /faltan letras o números/);

    const badDateCurp = ['GODE', '561331', 'M', 'OC', 'LRR', '0', '1'].join('');
    const badDateResult = checkCurp(badDateCurp);
    assert.equal(badDateResult.ok, false);
    assert.match(badDateResult.errors[0], /fecha de nacimiento/);
  });

  it('acepta un RFC válido, rechaza uno con homoclave alterada y rechaza el RFC genérico XAXX010101000', () => {
    const validRfc = buildSyntheticRfc(['GODE', '561231', 'GR']);
    const okResult = checkRfc(validRfc);
    assert.equal(okResult.ok, true);
    assert.deepEqual(okResult.errors, []);

    const wrongLastChar = validRfc[12] === '8' ? '9' : '8';
    const alteredRfc = validRfc.slice(0, 12) + wrongLastChar;
    const alteredResult = checkRfc(alteredRfc);
    assert.equal(alteredResult.ok, false);
    assert.match(alteredResult.errors[0], /último carácter del RFC no coincide/);

    const genericResult = checkRfc('XAXX010101000');
    assert.equal(genericResult.ok, false);
    assert.match(genericResult.errors[0], /genérico/);
  });

  it('compara CURP y RFC: sin advertencia si coinciden y con advertencia (no error) si son de distinta persona', () => {
    const curpA = buildSyntheticCurp(['GODE', '561231', 'M', 'OC', 'LRR', '0']);
    const rfcA = buildSyntheticRfc(['GODE', '561231', 'GR']);

    const samePerson = checkCurpRfcMatch(curpA, rfcA);
    assert.equal(samePerson.ok, true);
    assert.deepEqual(samePerson.errors, []);
    assert.deepEqual(samePerson.warnings, []);

    const rfcB = buildSyntheticRfc(['MARE', '800514', 'AB']);
    const differentPerson = checkCurpRfcMatch(curpA, rfcB);
    assert.equal(differentPerson.ok, true);
    assert.deepEqual(differentPerson.errors, []);
    assert.equal(differentPerson.warnings.length, 1);
    assert.match(differentPerson.warnings[0], /primeras 10 letras y números/);
  });

  it('acepta una CLABE válida devolviendo el nombre del banco y falla si se cambia o falta un dígito', () => {
    const validClabe = buildSyntheticClabe('012', '18000011835971');
    const okClabe = checkClabe(validClabe);
    assert.equal(okClabe.ok, true);
    assert.equal(okClabe.bankCode, '012');
    assert.equal(okClabe.bankName, 'BBVA México');

    const bienestarClabe = buildSyntheticClabe('166', '61000012345678');
    const okBienestar = checkClabe(bienestarClabe);
    assert.equal(okBienestar.ok, true);
    assert.equal(okBienestar.bankName, 'Banco del Bienestar');

    // Cambiar un solo dígito invalida el dígito verificador
    const flippedDigit = validClabe[17] === '5' ? '6' : '5';
    const alteredClabe = validClabe.slice(0, 17) + flippedDigit;
    const badClabe = checkClabe(alteredClabe);
    assert.equal(badClabe.ok, false);
    assert.match(badClabe.errors[0], /Uno de los números de la CLABE está mal escrito/);

    // CLABE de 17 dígitos explica en español sencillo que falta un número
    const missingOne = checkClabe(validClabe.slice(0, 17));
    assert.equal(missingOne.ok, false);
    assert.match(missingOne.errors[0], /A la CLABE le falta un número/);
  });

  it('normaliza el nombre en mayúsculas sin espacios extra, quitando tildes y conservando la Ñ', () => {
    const normalized = normalizeName('  maría   inés ', '  yáñez   ñumí  ');
    assert.equal(normalized.ok, true);
    assert.equal(normalized.givenNames, 'MARIA INES');
    assert.equal(normalized.surnames, 'YAÑEZ ÑUMI');
    assert.equal(normalized.fullName, 'MARIA INES YAÑEZ ÑUMI');

    const missingSurname = normalizeName('Juana', '   ');
    assert.equal(missingSurname.ok, false);
    assert.match(missingSurname.errors[0], /apellidos/);
  });

  it('revisa el formato del correo electrónico y las dos caras de la credencial del INE', () => {
    assert.equal(checkEmail('artesana.mixteca@comunidad.org.mx').ok, true);
    assert.equal(checkEmail('correo-sin-arroba.com').ok, false);

    const validFront = { sizeBytes: 180_000, width: 1200, height: 800, sharpnessScore: 85 };
    const validBack = { sizeBytes: 175_000, width: 1200, height: 800, sharpnessScore: 80 };

    assert.equal(checkIdPhotos({ front: validFront, back: validBack }).ok, true);

    const missingBack = checkIdPhotos({ front: validFront, back: null });
    assert.equal(missingBack.ok, false);
    assert.match(missingBack.errors[0], /parte de atrás/);

    const blurryFront = checkIdPhotos({
      front: { ...validFront, sharpnessScore: 15 },
      back: validBack,
    });
    assert.equal(blurryFront.ok, false);
    assert.match(blurryFront.errors[0], /borrosa/);
  });

  it('devuelve el menú de ocupaciones en español sencillo y ningún mensaje usa tecnicismos prohibidos', () => {
    const menu = occupationOptions();
    assert.equal(menu.ok, true);
    assert.ok(menu.options.length >= 3);
    assert.ok(menu.options.some((o) => o.label === 'Artesana' && o.fetchedAt === '2026-10-28'));
    assert.ok(menu.options.some((o) => o.label === 'Productora de café'));
    assert.ok(menu.options.some((o) => o.label === 'Comerciante'));

    const sampleFailures = [
      checkCurp(''),
      checkCurp('ABC'),
      checkCurp(['GODE', '561231', 'M', 'OC', 'LRR', '0', '9'].join('')),
      checkRfc(''),
      checkRfc('XAXX010101000'),
      checkRfc('GODE561231GR0'),
      checkCurpRfcMatch(
        buildSyntheticCurp(['GODE', '561231', 'M', 'OC', 'LRR', '0']),
        buildSyntheticRfc(['MARE', '800514', 'AB'])
      ),
      checkClabe(''),
      checkClabe('01218000011835971'),
      checkClabe('012180000118359719'),
      normalizeName('', ''),
      checkEmail('mal_correo'),
      checkIdPhotos({ front: { sizeBytes: 1000, width: 200, height: 100, sharpnessScore: 10 }, back: null }),
    ];

    const forbiddenWords = /\b(checksum|regex|invalid|inválid[oa]|hash)\b/i;
    for (const res of sampleFailures) {
      for (const msg of [...res.errors, ...res.warnings]) {
        assert.equal(
          forbiddenWords.test(msg),
          false,
          `El mensaje contiene una palabra técnica no permitida: "${msg}"`
        );
      }
    }
  });
});
