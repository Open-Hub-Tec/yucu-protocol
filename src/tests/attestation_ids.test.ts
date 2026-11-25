import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  attestationValue, canonicalJson, contentHash, manifestHash,
  subjectFor, subjectIndexEntries,
  type JsonValue, type SubjectKind,
} from '../core/attestations/ids';

interface Case {
  id: string;
  kind: SubjectKind;
  subject: string;
  schema: string;
  saltHex: string;
  content: JsonValue;
  refUid?: string;
  subjectRef: string;
  saltedHash: string;
  manifestHash: string;
  value: string;
}
const cases = (JSON.parse(readFileSync('docs/standards/vectors/attestation-ids.json', 'utf8')) as { cases: Case[] }).cases;
const fromHex = (h: string) => Uint8Array.from(Buffer.from(h, 'hex'));
const manifest = (s: string) => JSON.parse(readFileSync(`docs/standards/schemas/${s}.json`, 'utf8')) as JsonValue;

for (const v of cases) {
  test(`deterministic vectors: ${v.id}`, async () => {
    assert.equal(await subjectFor(v.kind, v.subject), v.subjectRef);
    assert.equal(await contentHash(v.content, fromHex(v.saltHex)), v.saltedHash);
    assert.equal(await manifestHash(manifest(v.schema)), v.manifestHash);
    assert.equal(attestationValue(v.subjectRef, v.saltedHash, v.refUid), v.value);
  });
}

test('the allowed prefixes work and unsupported prefixes fail', async () => {
  for (const kind of ['lot', 'item', 'addr', 'sale'] as const) {
    assert.match(await subjectFor(kind, 'A'), /^[a-f0-9]{64}$/);
  }
  await assert.rejects(subjectFor('person' as SubjectKind, 'A'), /Unknown subject prefix/);
  await assert.rejects(subjectFor('lot', ''), /required/);
});

test('altering one byte of the subject changes its SHA-256 digest', async () => {
  assert.notEqual(await subjectFor('lot', 'LOT-001'), await subjectFor('lot', 'LOT-002'));
  assert.notEqual(await subjectFor('lot', 'LOT-001'), await subjectFor('item', 'LOT-001'));
});

test('same content and different salts yield different hashes; short salts fail', async () => {
  const content = { municipio_codigo: '201', categoria: 'cafe' };
  const a = new Uint8Array(16);
  const b = new Uint8Array(16).fill(1);
  assert.notEqual(await contentHash(content, a), await contentHash(content, b));
  await assert.rejects(contentHash(content, new Uint8Array(15)), /16 bytes/);
});

test('canonical JSON is key-order independent; non-JSON values are rejected', async () => {
  const a: JsonValue = { z: [2, 3], a: { ñ: 'valor', x: 1 } };
  const b: JsonValue = { a: { x: 1, ñ: 'valor' }, z: [2, 3] };
  assert.equal(canonicalJson(a), canonicalJson(b));
  assert.equal(await contentHash(a, new Uint8Array(16)), await contentHash(b, new Uint8Array(16)));
  assert.throws(() => canonicalJson(Number.NaN), /finite/);
  assert.throws(() => canonicalJson({ secret: undefined } as unknown as JsonValue), /JSON values/);
});

test('value encodes exactly two 32-byte hashes plus optional ref_uid', () => {
  const h = 'f'.repeat(64);
  assert.equal(attestationValue(h, h), `yucu:1:${h}:${h}`);
  assert.equal(attestationValue(h, h, h), `yucu:1:${h}:${h}:${h}`);
  assert.throws(() => attestationValue('GG', h), /lowercase hex/);
  assert.throws(() => attestationValue(h, h, 'ABC'), /lowercase hex/);
});

test('BySubject indices start at zero and stay contiguous; invalid UIDs fail', () => {
  const indexed = subjectIndexEntries(['a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64)]);
  assert.deepEqual(indexed.map(x => x.n), [0, 1, 2]);
  assert.deepEqual(subjectIndexEntries([]), []);
  assert.throws(() => subjectIndexEntries(['invalid']), /lowercase hex/);
});

test('all five schema manifests declare privacy, voice texts and no personal fields', () => {
  const names = ['origen-comunitario', 'consentimiento', 'colaboracion', 'entrega', 'transito'];
  for (const name of names) {
    const m = manifest(name) as { fields: Record<string, { privacy: string }>; voice: { ask: { es: string }; confirm: { es: string } } };
    assert.ok(m.voice.ask.es && m.voice.confirm.es);
    assert.ok(Object.keys(m.fields).length > 0);
    for (const [key, value] of Object.entries(m.fields)) {
      assert.ok(['public', 'hash-only', 'forbidden'].includes(value.privacy), `privacy: ${name}.${key}`);
      assert.doesNotMatch(key, /nombre|name|telefono|phone|coordinate|coordenad|direccion|address/i);
    }
  }
  const missing = { fields: { lot: { type: 'string' } } };
  assert.equal('privacy' in missing.fields.lot, false);
});
