/**
 * Yucu attestation *content* conventions (ADR-005 D3, ADR-007 D1).
 * Attest Protocol alone computes schema_uid and attestation uid; these helpers do not.
 */
export type SubjectKind = 'lot' | 'item' | 'addr' | 'sale';
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const utf8 = new TextEncoder();
const HASH_HEX = /^[a-f0-9]{64}$/;

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer);
  return hex(new Uint8Array(digest));
}

/** RFC 8785 JSON Canonicalization Scheme for JSON-compatible, I-JSON input. */
export function canonicalJson(value: JsonValue): string {
  if (value === null) return 'null';
  if (typeof value === 'string') {
    // I-JSON rejects unpaired Unicode surrogates.
    if (/(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF])/.test(value)) {
      throw new TypeError('Unpaired Unicode surrogate is not valid I-JSON');
    }
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value))) {
      throw new TypeError('JSON number must be finite and I-JSON safe');
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return `{${Object.keys(value).sort().map(key => `${canonicalJson(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  throw new TypeError('Input must contain only JSON values');
}

/** hash of UTF-8 literal '<kind>:<value>'; no trimming or Unicode normalization. */
export async function subjectFor(kind: SubjectKind, value: string): Promise<string> {
  if (!(['lot', 'item', 'addr', 'sale'] as string[]).includes(kind)) {
    throw new TypeError('Unknown subject prefix');
  }
  if (typeof value !== 'string' || value.length === 0) throw new TypeError('Subject value is required');
  return sha256(utf8.encode(`${kind}:${value}`));
}

/** Salt must be generated randomly by the caller (>=16 bytes); vectors use fixed salts only. */
export async function contentHash(content: JsonValue, salt: Uint8Array): Promise<string> {
  if (!(salt instanceof Uint8Array) || salt.byteLength < 16) {
    throw new TypeError('Salt must contain at least 16 bytes');
  }
  const body = utf8.encode(canonicalJson(content));
  const data = new Uint8Array(salt.byteLength + body.byteLength);
  data.set(salt, 0);
  data.set(body, salt.byteLength);
  return sha256(data);
}

/** SHA-256 of canonical UTF-8 manifest JSON. */
export async function manifestHash(manifest: JsonValue): Promise<string> {
  return sha256(utf8.encode(canonicalJson(manifest)));
}

/** Contract-readable value. These are NOT Attest Protocol attestation identifiers. */
export function attestationValue(subjectRef: string, saltedHash: string, refUid?: string): string {
  for (const [field, value] of [['subjectRef', subjectRef], ['saltedHash', saltedHash], ...(refUid === undefined ? [] : [['refUid', refUid]])]) {
    if (!HASH_HEX.test(value)) throw new TypeError(`${field} must be 32 bytes in lowercase hex`);
  }
  return `yucu:1:${subjectRef}:${saltedHash}${refUid === undefined ? '' : `:${refUid}`}`;
}

/** Pure reference model of the per-subject 0-based counter (no contract state). */
export function subjectIndexEntries(uids: string[]): { n: number; uid: string }[] {
  return uids.map((uid, n) => {
    if (!HASH_HEX.test(uid)) throw new TypeError('uid must be 32 bytes in lowercase hex');
    return { n, uid };
  });
}
