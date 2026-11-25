// W53 #182: el componente "Escuchar" usa español de México si existe;
// sin voz en español muestra el aviso (modo texto) y no falla.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  elegirVoz,
  planearLectura,
  IDIOMA_LECTURA,
  VELOCIDAD_LECTURA,
  type VozDisponible,
} from '../core/voz/elegirVoz';
import { TEXTOS_ESCUCHAR } from '../textos/campo';

const voz = (lang: string, name = lang): VozDisponible => ({ lang, name });

describe('elegirVoz', () => {
  it('prefiere español de México aunque haya otros españoles antes en la lista', () => {
    const voces = [voz('en-US'), voz('es-ES'), voz('es-US'), voz('es-MX', 'Paulina')];
    assert.equal(elegirVoz(voces)?.name, 'Paulina');
  });

  it('reconoce es_MX con guion bajo y mayúsculas distintas (algunos Android)', () => {
    assert.equal(elegirVoz([voz('en-GB'), voz('ES_mx', 'Android')])?.name, 'Android');
  });

  it('sin es-MX, usa una variante latinoamericana antes que la de España', () => {
    assert.equal(elegirVoz([voz('es-ES'), voz('es-US')])?.lang, 'es-US');
  });

  it('sin variante latinoamericana, usa cualquier español', () => {
    assert.equal(elegirVoz([voz('fr-FR'), voz('es-ES')])?.lang, 'es-ES');
  });

  it('sin ninguna voz en español devuelve null', () => {
    assert.equal(elegirVoz([voz('en-US'), voz('fr-FR'), voz('pt-BR')]), null);
  });

  it('con una lista vacía, nula o con voces raras devuelve null sin fallar', () => {
    assert.equal(elegirVoz([]), null);
    assert.equal(elegirVoz(null), null);
    assert.equal(elegirVoz(undefined), null);
    const rara = [{ name: 'sin idioma' }] as unknown as VozDisponible[];
    assert.doesNotThrow(() => elegirVoz(rara));
    assert.equal(elegirVoz(rara), null);
  });
});

describe('planearLectura', () => {
  it('con voz es-MX lee en es-MX y un poco más lento', () => {
    const plan = planearLectura({ getVoices: () => [voz('en-US'), voz('es-MX', 'Paulina')] });
    assert.equal(plan.modo, 'voz');
    if (plan.modo !== 'voz') return;
    assert.equal(plan.voz.name, 'Paulina');
    assert.equal(plan.idioma, IDIOMA_LECTURA);
    assert.ok(plan.velocidad < 1, 'la velocidad es menor a la normal');
    assert.equal(plan.velocidad, VELOCIDAD_LECTURA);
  });

  it('con otra voz en español, respeta el idioma de esa voz', () => {
    const plan = planearLectura({ getVoices: () => [voz('es-ES')] });
    assert.equal(plan.modo, 'voz');
    if (plan.modo === 'voz') assert.equal(plan.idioma, 'es-ES');
  });

  it('sin voz en español pasa a modo texto con el aviso', () => {
    const plan = planearLectura({ getVoices: () => [voz('en-US')] });
    assert.deepEqual(plan, { modo: 'texto', motivo: 'sin-voz-espanol' });
    assert.match(TEXTOS_ESCUCHAR.sinVoz, /no tiene voz en español/);
  });

  it('sin speechSynthesis en el navegador pasa a modo texto sin fallar', () => {
    assert.deepEqual(planearLectura(null), { modo: 'texto', motivo: 'sin-sintesis' });
    assert.deepEqual(planearLectura(undefined), { modo: 'texto', motivo: 'sin-sintesis' });
  });

  it('si pedir las voces lanza un error, no falla: pasa a modo texto', () => {
    const roto = {
      getVoices: (): VozDisponible[] => {
        throw new Error('speechSynthesis no disponible');
      },
    };
    assert.doesNotThrow(() => planearLectura(roto));
    assert.deepEqual(planearLectura(roto), { modo: 'texto', motivo: 'sin-sintesis' });
  });
});
