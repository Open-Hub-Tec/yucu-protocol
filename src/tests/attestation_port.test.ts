/**
 * Pruebas del puerto de atestaciones (ADR-005 D9, issue #141).
 * Cubren el flujo preparar -> firmar -> enviar, las listas del índice y la regla de consentimiento (D6).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { subjectFor } from '../core/attestations/ids';
import { chain } from '../core/chain';
import { SimulatedAttestations, SimulatedWallet } from '../core/chain/SimulatedChain';
import type { AttestRequest } from '../core/chain/ports';

const ISSUER = 'GEMISOR-DEMO';
const OTHER = 'GOTRO-DEMO';
const ARTISAN = 'GARTESANA-DEMO';

function setup() {
  const clock = { now: 1_800_000_000_000 };
  const port = new SimulatedAttestations({ now: () => clock.now });
  const wallet = new SimulatedWallet();
  const issue = async (req: AttestRequest) => {
    const tx = await port.prepareAttest(req);
    return port.submitAttest(await wallet.sign(tx, '1234'));
  };
  return { port, clock, wallet, issue };
}

function originRequest(lotCode = 'LOTE-001'): AttestRequest {
  return {
    schemaId: 'origen-comunitario',
    issuer: ISSUER,
    lotCode,
    content: { categoria: 'cafe', municipio_codigo: '201', lote_referencia: lotCode },
  };
}

test('emitir y verificar: válido, simulado y sin contenido en claro', async () => {
  const { port, wallet } = setup();
  const tx = await port.prepareAttest(originRequest());
  assert.match(tx.summary, /atestación de origen-comunitario sobre el lote LOTE-001/);

  const receipt = await port.submitAttest(await wallet.sign(tx, '1234'));
  assert.equal(receipt.source, 'simulated');
  assert.match(receipt.attestationId, /^[a-f0-9]{64}$/);
  assert.deepEqual(await port.verify(receipt.attestationId), {
    valid: true, revoked: false, expired: false, archived: false, source: 'simulated',
  });

  const record = (await port.listForLot('LOTE-001')).items[0];
  assert.equal(record.uid, receipt.attestationId);
  assert.match(record.value, /^yucu:1:[a-f0-9]{64}:[a-f0-9]{64}$/);
  const serialized = JSON.stringify(record);
  for (const secret of ['cafe', '201', 'LOTE-001']) assert.equal(serialized.includes(secret), false);
  for (const forbidden of ['salt', 'content']) assert.equal(Object.keys(record).includes(forbidden), false);
});

test('verify con otro esquema, otro sujeto o un ID inexistente no es válido', async () => {
  const { port, issue } = setup();
  const { attestationId } = await issue(originRequest());
  const subjectRef = await subjectFor('lot', 'LOTE-001');

  assert.equal((await port.verify(attestationId, { schemaId: 'origen-comunitario', subjectRef })).valid, true);
  assert.equal((await port.verify(attestationId, { schemaId: 'consentimiento', subjectRef })).valid, false);
  const otherSubject = await subjectFor('lot', 'LOTE-999');
  assert.equal((await port.verify(attestationId, { schemaId: 'origen-comunitario', subjectRef: otherSubject })).valid, false);
  assert.deepEqual(await port.verify('f'.repeat(64)), {
    valid: false, revoked: false, expired: false, archived: false, source: 'simulated',
  });
});

test('solo quien emite puede revocar y verify lo marca como revocado', async () => {
  const { port, wallet, issue } = setup();
  const { attestationId } = await issue(originRequest());

  await assert.rejects(port.prepareRevoke(attestationId, OTHER), /Solo quien emitió/);
  const tx = await port.prepareRevoke(attestationId, ISSUER);
  assert.equal((await port.submit(await wallet.sign(tx, '1234'))).source, 'simulated');

  const result = await port.verify(attestationId);
  assert.equal(result.valid, false);
  assert.equal(result.revoked, true);
});

test('una fecha de vencimiento pasada se rechaza al preparar; vencida deja de valer', async () => {
  const { port, clock, issue } = setup();
  await assert.rejects(port.prepareAttest({ ...originRequest(), expiresAt: clock.now - 1 }), /ya venció/);

  const { attestationId } = await issue({ ...originRequest(), expiresAt: clock.now + 10_000 });
  assert.equal((await port.verify(attestationId)).valid, true);
  clock.now += 10_001;
  const result = await port.verify(attestationId);
  assert.equal(result.valid, false);
  assert.equal(result.expired, true);
  assert.equal(result.revoked, false);
});

test('dos emisiones idénticas del mismo emisor tienen UIDs distintas', async () => {
  const { port, issue } = setup();
  const first = await issue(originRequest());
  const second = await issue(originRequest());
  assert.notEqual(first.attestationId, second.attestationId);

  const list = await port.listForIssuer(ISSUER);
  assert.deepEqual(list.items.map((item) => item.uid), [first.attestationId, second.attestationId]);
});

test('listas por lote, emisor y destinatario filtran y paginan sin repetir ni saltar', async () => {
  const { port, issue } = setup();
  const first = await issue(originRequest('LOTE-A'));
  const second = await issue({ ...originRequest('LOTE-A'), content: { categoria: 'cafe', municipio_codigo: '202' } });
  const third = await issue({ ...originRequest('LOTE-B'), recipient: ARTISAN });
  const fourth = await issue({ ...originRequest('LOTE-B'), issuer: OTHER, recipient: ARTISAN });

  const lotA = await port.listForLot('LOTE-A');
  assert.equal(lotA.source, 'simulated');
  assert.deepEqual(lotA.items.map((item) => item.uid), [first.attestationId, second.attestationId]);
  const lotB = await port.listForLot('LOTE-B');
  assert.deepEqual(lotB.items.map((item) => item.uid), [third.attestationId, fourth.attestationId]);

  const page1 = await port.listForLot('LOTE-B', 0, 1);
  const page2 = await port.listForLot('LOTE-B', 1, 1);
  assert.deepEqual(page1.items.map((item) => item.uid), [third.attestationId]);
  assert.deepEqual(page2.items.map((item) => item.uid), [fourth.attestationId]);
  assert.deepEqual(
    [...page1.items, ...page2.items].map((item) => item.uid),
    lotB.items.map((item) => item.uid),
  );
  assert.deepEqual((await port.listForLot('LOTE-A', 2, 5)).items, []);

  assert.deepEqual((await port.listForIssuer(OTHER)).items.map((item) => item.uid), [fourth.attestationId]);
  assert.deepEqual((await port.listForRecipient(ARTISAN)).items.map((item) => item.uid), [third.attestationId, fourth.attestationId]);
  assert.deepEqual((await port.listForRecipient('GNADIE')).items, []);
  await assert.rejects(port.listForLot('LOTE-A', -1, 5), /paginación/);
  await assert.rejects(port.listForLot('LOTE-A', 0, 0), /paginación/);
});

test('una colaboración deja de valer si se revoca el consentimiento que referencia (D6)', async () => {
  const { port, wallet, issue } = setup();
  const consent = await issue({
    schemaId: 'consentimiento',
    issuer: ARTISAN,
    lotCode: 'PIEZA-002',
    recipient: ARTISAN,
    content: { finalidad: 'catalogo', referencia_objeto: 'PIEZA-002', vigencia_hasta: '2027-01-01' },
  });
  await assert.rejects(port.prepareAttest({
    schemaId: 'colaboracion',
    issuer: ISSUER,
    lotCode: 'PIEZA-002',
    content: { tipo_colaboracion: 'diseno' },
    refUid: 'f'.repeat(64),
  }), /referencia no existe/);

  const collaboration = await issue({
    schemaId: 'colaboracion',
    issuer: ISSUER,
    lotCode: 'PIEZA-002',
    content: { tipo_colaboracion: 'diseno', referencia_acuerdo: 'ACUERDO-003' },
    refUid: consent.attestationId,
  });
  assert.equal((await port.verify(collaboration.attestationId)).valid, true);

  const revokeTx = await port.prepareRevoke(consent.attestationId, ARTISAN);
  await port.submit(await wallet.sign(revokeTx, '1234'));
  const collaborationStatus = await port.verify(collaboration.attestationId);
  assert.equal(collaborationStatus.valid, false);
  assert.equal(collaborationStatus.revoked, false); // la colaboración en sí no se revocó
  assert.equal((await port.verify(consent.attestationId)).revoked, true);
});

test('schemaStats cuenta emisiones y revocaciones por esquema', async () => {
  const { port, wallet, issue } = setup();
  await issue(originRequest('LOTE-001'));
  const second = await issue(originRequest('LOTE-002'));
  const revokeTx = await port.prepareRevoke(second.attestationId, ISSUER);
  await port.submit(await wallet.sign(revokeTx, '1234'));

  assert.deepEqual(await port.schemaStats('origen-comunitario'), { total: 2, revoked: 1, source: 'simulated' });
  assert.deepEqual(await port.schemaStats('consentimiento'), { total: 0, revoked: 0, source: 'simulated' });
});

test('el contenido con datos personales u otros campos inválidos se rechaza', async () => {
  const { port } = setup();
  await assert.rejects(port.prepareAttest({ ...originRequest(), content: { nombre: 'valor' } }), /datos personales/);
  await assert.rejects(port.prepareAttest({ ...originRequest(), content: {} }), /objeto con campos/);
  await assert.rejects(port.prepareAttest({ ...originRequest(), issuer: 'HNO-G' }), /dirección pública/);
  await assert.rejects(port.prepareAttest({ ...originRequest(), refUid: 'ABC' }), /32 bytes/);
});

test('el objeto chain expone el puerto de atestaciones', async () => {
  assert.ok(chain.attestations);
  assert.equal((await chain.attestations.verify('f'.repeat(64))).source, 'simulated');
});
