// Pruebas unitarias de la revisión previa de datos de retiro (CURP, RFC, CLABE, INE)
// para Etherfuse SPEI (#145, ADR-004, D9).
// Datos 100% ficticios para pruebas (AGENTS.md, regla 5).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkCurp,
  checkRfc,
  checkCurpRfcMatch,
  checkClabe,
  normalizeName,
  checkEmail,
  checkIdPhotos,
  occupationOptions,
} from '../core/payout/precheck';
import { getBankByCode } from '../core/payout/clabeBanks';
import { ETHERFUSE_OCCUPATIONS_FETCH_DATE } from '../core/payout/etherfuseOccupations';

// Datos ficticios generados con reglas oficiales del Registro Civil y SAT
// CURP ficticia válida para VECJ880326HDFRRN0 (dígito 8)
const VALID_CURP = 'VECJ880326HDFRRN08';
const INVALID_DIGIT_CURP = 'VECJ880326HDFRRN09';

// RFC ficticio válido persona física para VECJ880326XX (clave final 1)
const VALID_RFC = 'VECJ880326XX1';
const ALTERED_HOMOCLAVE_RFC = 'VECJ880326XX9';
const GENERIC_RFC = 'XAXX010101000';

// CLABE ficticia válida de 18 dígitos: banco 002 (Banamex), plaza 010, cuenta 07770419660, control 0
const VALID_CLABE = '002010077704196600';
const ALTERED_CLABE = '002010077704196601';

// CLABE Banco del Bienestar (166): banco 166, plaza 180, cuenta 01234567890
// Ponderación: control calculado
const BIENESTAR_CLABE_17 = '16618001234567890';
// pesos: 3,7,1, 3,7,1, 3,7,1, 3,7,1, 3,7,1, 3,7
// 1*3 + 6*7(42->2) + 6*1(6) + 1*3(3) + 8*7(56->6) + 0*1(0) + 0*3(0) + 1*7(7) + 2*1(2) + 3*3(9) + 4*7(28->8) + 5*1(5) + 6*3(18->8) + 7*7(49->9) + 8*1(8) + 9*3(27->7) + 0*7(0)
// sum mod 10 = (3+2+6+3+6+0+0+7+2+9+8+5+8+9+8+7+0) = 83 -> 3. (10 - 3) = 7.
const VALID_BIENESTAR_CLABE = '166180012345678907';

describe('Revisión previa de CURP (#145)', () => {
  it('una CURP válida pasa sin errores', () => {
    const res = checkCurp(VALID_CURP);
    assert.equal(res.ok, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.curp, VALID_CURP);
  });

  it('la misma CURP con el último dígito alterado falla', () => {
    const res = checkCurp(INVALID_DIGIT_CURP);
    assert.equal(res.ok, false);
    assert.ok(res.errors.length > 0);
    assert.match(res.errors[0], /último número de la CURP/i);
  });

  it('una CURP con longitud menor o mayor a 18 falla', () => {
    const shortRes = checkCurp('VECJ880326HDFRRN0');
    assert.equal(shortRes.ok, false);
    assert.ok(shortRes.errors.length > 0);

    const longRes = checkCurp('VECJ880326HDFRRN088');
    assert.equal(longRes.ok, false);
    assert.ok(longRes.errors.length > 0);
  });

  it('una CURP con estructura incorrecta falla', () => {
    const res = checkCurp('123456789012345678');
    assert.equal(res.ok, false);
    assert.ok(res.errors.length > 0);
  });

  it('una CURP vacía devuelve mensaje claro', () => {
    const res = checkCurp('');
    assert.equal(res.ok, false);
    assert.ok(res.errors.length > 0);
  });
});

describe('Revisión previa de RFC (#145)', () => {
  it('un RFC de persona física válido pasa sin errores', () => {
    const res = checkRfc(VALID_RFC);
    assert.equal(res.ok, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.isPersonaFisica, true);
  });

  it('un RFC con homoclave alterada falla', () => {
    const res = checkRfc(ALTERED_HOMOCLAVE_RFC);
    assert.equal(res.ok, false);
    assert.ok(res.errors.length > 0);
    assert.match(res.errors[0], /último caracter del RFC/i);
  });

  it('el RFC genérico XAXX010101000 es rechazado', () => {
    const res = checkRfc(GENERIC_RFC);
    assert.equal(res.ok, false);
    assert.ok(res.errors.length > 0);
    assert.match(res.errors[0], /genérico/i);
  });

  it('un RFC con longitud distinta a 13 falla', () => {
    const res = checkRfc('VECJ880326XX');
    assert.equal(res.ok, false);
    assert.ok(res.errors.length > 0);
  });
});

describe('Coincidencia entre CURP y RFC (#145)', () => {
  it('CURP y RFC de la misma persona no generan advertencias ni errores', () => {
    const res = checkCurpRfcMatch(VALID_CURP, VALID_RFC);
    assert.equal(res.ok, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.warnings.length, 0);
  });

  it('CURP y RFC de personas distintas emiten advertencia (warning) sin bloquear', () => {
    const DIFFERENT_RFC = 'GOMP850101AB2';
    const res = checkCurpRfcMatch(VALID_CURP, DIFFERENT_RFC);
    assert.equal(res.ok, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.warnings.length, 1);
    assert.match(res.warnings[0], /primeros 10 caracteres/i);
  });
});

describe('Revisión previa de CLABE (#145)', () => {
  it('una CLABE válida de 18 dígitos pasa y devuelve el banco', () => {
    const res = checkClabe(VALID_CLABE);
    assert.equal(res.ok, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.bankCode, '002');
    assert.match(res.bankName ?? '', /BANAMEX/i);
  });

  it('una CLABE del Banco del Bienestar (166) pasa y devuelve la institución', () => {
    const res = checkClabe(VALID_BIENESTAR_CLABE);
    assert.equal(res.ok, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.bankCode, '166');
    assert.match(res.bankName ?? '', /Banco del Bienestar/i);
  });

  it('una CLABE con un dígito alterado falla', () => {
    const res = checkClabe(ALTERED_CLABE);
    assert.equal(res.ok, false);
    assert.ok(res.errors.length > 0);
    assert.match(res.errors[0], /último número de la CLABE/i);
  });

  it('una CLABE con menos o más de 18 dígitos falla', () => {
    const resShort = checkClabe('00201007770419660');
    assert.equal(resShort.ok, false);
    assert.ok(resShort.errors.length > 0);

    const resLetters = checkClabe('00201007770419660A');
    assert.equal(resLetters.ok, false);
    assert.ok(resLetters.errors.length > 0);
  });
});

describe('Normalización de nombres y apellidos (#145)', () => {
  it('convierte a mayúsculas y quita espacios redundantes', () => {
    const res = normalizeName('  maría   elena  ', 'lópez   pérez  ');
    assert.equal(res.ok, true);
    assert.equal(res.normalized, 'MARIA ELENA LOPEZ PEREZ');
  });

  it('elimina acentos de vocales para concordancia SPEI pero conserva la letra Ñ', () => {
    const res = normalizeName('BEATRIZ', 'PEÑA NUÑEZ');
    assert.equal(res.ok, true);
    assert.equal(res.normalized, 'BEATRIZ PEÑA NUÑEZ');
    assert.ok(res.normalized.includes('Ñ'));
  });

  it('falla si el nombre está vacío', () => {
    const res = normalizeName('');
    assert.equal(res.ok, false);
    assert.ok(res.errors.length > 0);
  });
});

describe('Revisión de correo electrónico (#145)', () => {
  it('un correo con formato válido pasa', () => {
    const res = checkEmail('artesana.oaxaca@ejemplo.com');
    assert.equal(res.ok, true);
    assert.equal(res.errors.length, 0);
  });

  it('un correo mal formado falla con mensaje en lenguaje llano', () => {
    const res = checkEmail('artesana_sin_arroba.com');
    assert.equal(res.ok, false);
    assert.ok(res.errors.length > 0);
    assert.match(res.errors[0], /signo @/i);
  });
});

describe('Revisión de fotos de identificación INE (#145)', () => {
  it('si falta el reverso de la credencial emite error', () => {
    const res = checkIdPhotos({ front: 'data:image/jpeg;base64,frente...' });
    assert.equal(res.ok, false);
    assert.equal(res.backOk, false);
    assert.ok(res.errors.some((e) => e.includes('reverso')));
  });

  it('si falta el frente de la credencial emite error', () => {
    const res = checkIdPhotos({ back: 'data:image/jpeg;base64,reverso...' });
    assert.equal(res.ok, false);
    assert.equal(res.frontOk, false);
    assert.ok(res.errors.some((e) => e.includes('frente')));
  });

  it('con ambas caras presentes y tamaño adecuado pasa', () => {
    const res = checkIdPhotos({
      front: { sizeBytes: 50000, width: 800, height: 600 },
      back: { sizeBytes: 48000, width: 800, height: 600 },
    });
    assert.equal(res.ok, true);
    assert.equal(res.errors.length, 0);
    assert.equal(res.frontOk, true);
    assert.equal(res.backOk, true);
  });

  it('alerta foto borrosa como advertencia sin impedir el registro', () => {
    const res = checkIdPhotos({
      front: { sizeBytes: 50000, width: 800, height: 600, isBlurry: true },
      back: { sizeBytes: 48000, width: 800, height: 600 },
    });
    assert.equal(res.ok, true);
    assert.ok(res.warnings.some((w) => w.includes('borrosa')));
  });
});

describe('Opciones de ocupación de Etherfuse (#145)', () => {
  it('devuelve opciones en español con fecha del sandbox', () => {
    const res = occupationOptions();
    assert.equal(res.ok, true);
    assert.ok(res.options.length > 0);
    assert.equal(res.fetchDate, ETHERFUSE_OCCUPATIONS_FETCH_DATE);

    const artisan = res.options.find((o) => o.code === 'ARTISAN');
    assert.ok(artisan);
    assert.match(artisan.label, /artesana/i);
  });
});

describe('Criterio de honestidad y lenguaje llano (#145)', () => {
  it('ningún mensaje de error contiene tecnicismos como "checksum", "regex" o "invalid"', () => {
    const forbiddenWords = ['checksum', 'regex', 'invalid', 'paridad'];
    const results = [
      checkCurp('INVALIDO'),
      checkRfc('INVALIDO'),
      checkClabe('123'),
      checkEmail('correo_malo'),
      checkIdPhotos({}),
      normalizeName(''),
    ];

    for (const r of results) {
      for (const err of r.errors) {
        for (const word of forbiddenWords) {
          assert.equal(
            err.toLowerCase().includes(word),
            false,
            `El mensaje "${err}" contiene la palabra prohibida "${word}"`
          );
        }
      }
    }
  });

  it('banco no encontrado retorna undefined de forma segura sin lanzar error', () => {
    assert.equal(getBankByCode('999'), undefined);
  });
});
