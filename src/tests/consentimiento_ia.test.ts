import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  consentimientoInicial,
  puedeEnviarAIA,
  conConsentimiento,
} from '../utils/consentimientoIA';

test('el consentimiento comienza en false (nada marcado)', () => {
  const c = consentimientoInicial();
  assert.equal(c.imagen, false);
  assert.equal(c.audio, false);
});

test('con "Sí, enviar" sí se llama a la IA (positiva)', async () => {
  let llamadas = 0;
  const r = await conConsentimiento({ imagen: true, audio: false }, 'imagen', async () => {
    llamadas++;
    return 'ok';
  });
  assert.equal(r, 'ok');
  assert.equal(llamadas, 1);
});

test('con "No" no se llama a /api/analyze-image (negativa)', async () => {
  let llamadas = 0;
  const r = await conConsentimiento(consentimientoInicial(), 'imagen', async () => {
    llamadas++;
    return 'ok';
  });
  assert.equal(r, null);
  assert.equal(llamadas, 0);
});

test('con "No" no se llama a /api/transcribe-audio (negativa)', async () => {
  let llamadas = 0;
  await conConsentimiento(consentimientoInicial(), 'audio', async () => {
    llamadas++;
  });
  assert.equal(llamadas, 0);
});

test('el consentimiento de imagen no autoriza el audio', () => {
  assert.equal(puedeEnviarAIA({ imagen: true, audio: false }, 'audio'), false);
});

test('revocar el consentimiento bloquea los envíos siguientes', async () => {
  let c = { imagen: true, audio: true };
  assert.equal(puedeEnviarAIA(c, 'imagen'), true);
  c = { ...c, imagen: false }; // revoca
  let llamadas = 0;
  await conConsentimiento(c, 'imagen', async () => { llamadas++; });
  assert.equal(llamadas, 0);
});