# Yucu Attestation Interoperability Specification (v1 draft)

**Scope:** Yucu `value`, public schema manifests and optional resolver-index conventions. **Issue:** [#140](https://github.com/Open-Hub-Tec/yucu-protocol/issues/140). The index contract is implemented separately in #162; this document does **not** claim it has been deployed.

## 1. Architecture and source of authority

The **Architecture v2** notice at the top of issue #140 overrides its old instructions for implementing a new attestation core. Per [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md), **Attest Protocol** is the authoritative registry and computes both `schema_uid` and attestation `uid`. Yucu does **not** compute or replace those IDs; it defines the content of the base `value` field, a public manifest for every schema, and a separately implemented resolver index.

A base **Schema** has a definition, authority, optional resolver and revocability and is identified by Attest Protocol's `schema_uid`. A base **Attestation** records its Attest-generated `uid`, `schema_uid`, attester, recipient, value, expiration and revocation state. The precise ABI is upstream; the additional Yucu index stores derived records and does not supplant the base.

### 1.1 UID algorithm belongs to Attest Protocol

For the exact upstream calculation, consult [`generate_schema_uid`](https://github.com/daccred/attestprotocol/blob/6a87b7be9/contracts/stellar/protocol/src/utils.rs#L39-L61) and [`generate_attestation_uid`](https://github.com/daccred/attestprotocol/blob/6a87b7be9/contracts/stellar/protocol/src/utils.rs#L99-L130). Upstream uses typed Soroban XDR for addresses, the optional resolver (`None` is *not* an empty address) and nonce (`u64`). Consumers must read the authoritative ID from Attest Protocol rather than reproduce an old Yucu domain-prefix formula. `ref_uid` in `value` is not an input to base UID derivation.

| Feature | Attest Protocol v2 | Yucu v1 |
| --- | --- | --- |
| UIDs | Generated on-chain by Attest Protocol | Stored as returned, never rederived |
| Subject | v2 binds attestation to attester | `subject_ref` in the `value` string |
| Payload | Attest `String` | Fixed-format `yucu:1:...` |
| Related UID | Not a native field in v2 | Optional `ref_uid` in `value` |
| Lists | Upstream off-chain indexer | Proposed separate on-chain resolver index |
| Voice and privacy | Not the base's concern | Public JSON manifests tied to schema by hash |

## 2. Exact byte and hash conventions

All Yucu digest values are **SHA-256**, encoded as **64 lowercase hexadecimal characters** (32 raw bytes). All text is UTF-8 without BOM. No trimming, case folding, or Unicode normalization occurs automatically.

**Subject:** `subject_ref = SHA256(UTF8(kind + ":" + value))`, with `kind` **exactly** one of `lot`, `item`, `addr`, `sale`. Empty values and other kinds are rejected. The bytes of `lot:ABC` differ from `item:ABC`.

**Canonical JSON:** serialize `content` and each public schema `manifest` using [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785). Object keys are sorted using UTF-16 code units, arrays preserve order, numbers use ECMAScript JSON formatting, insignificant whitespace is omitted, and I-JSON-compatible input is required (finite numbers, safe integer representation, no undefined or unpaired Unicode surrogate). No Unicode normalization is imposed.

**Randomly salted content:** each *real* attestation obtains a **new cryptographically random salt of at least 16 bytes**. `salted_hash = SHA256(salt_bytes || UTF8(JCS(content)))`. `||` denotes raw byte concatenation. If the salt is shorter than 16 bytes, reject it. Only the resulting digest is placed in the `value` field: low-entropy municipality/volume data must not be exposed to dictionary attacks. Public fixed fixture salts in the vectors are **not suitable for real attestations**.

**Manifest hash:** `manifest_hash = SHA256(UTF8(JCS(manifest)))`, with no salt. ADR-005 D4 places this digest in the corresponding Attest Protocol schema definition. A changed field, privacy classification or language prompt changes the digest.

### 2.1 Contract-readable value

```text
yucu:1:<subject_ref:64-lowercase-hex>:<salted_hash:64-lowercase-hex>[:<ref_uid:64-lowercase-hex>]
```

The ASCII prefix is `yucu:1:`. Without `ref_uid`, this is exactly **136 ASCII bytes**; with `ref_uid`, **201 ASCII bytes**. `ref_uid` links an existing Attest-generated attestation (such as an artisan's consent or a sale). Reject unknown versions, uppercase hex, missing components or extra segments. A well-formed `value` is **not** evidence that the on-chain record exists or is valid.

## 3. Manifest format

The five public files in [`schemas/`](schemas/) define `origen-comunitario`, `consentimiento`, `colaboracion`, `entrega` and `transito` (ADR-005 D4).

Each contains `schema`, `version`, `signer`, `cosigner` (nullable), `rules`, `fields` and `voice`. **Every field must declare `privacy`** as `public` (may be shown under the application's privacy policy), `hash-only` (must not be put in plaintext on-chain) or `forbidden` (extraction discards the field). No field asks for people's names, phone numbers, GPS coordinates or precise addresses. A municipality is represented **only by a municipality code**. The `voice.ask.es` and `voice.confirm.es` texts guide questions and explicit human confirmation. Mixtec support remains unverified; no unsupported language is claimed.

The manifest's signer and rules are specifications, *not* a substitute for on-chain auth checks. The AI only prepares and reads back a draft; the person confirms and signs (ADR-007 D2–D3). No personal information, audio, secret keys, invented ledger hashes or purported certifications are stored in these fixtures.

## 4. Resolver index key specification (for future #162)

Only calls authenticated as the configured Attest Protocol contract may mutate the resolver. Store the authorized contract ID in its constructor and enforce `require_auth()`. The following is a **proposed exact Soroban contracttype representation** to implement in #162:

```rust
#[contracttype]
pub enum SubjectKey {
    Digest(BytesN<32>),
    Account(Address),
}
#[contracttype]
pub enum IndexKey {
    BySubject(SubjectKey, u32), SubjectCount(SubjectKey),
    ByAttester(Address, u32), AttesterCount(Address),
    ByRecipient(Address, u32), RecipientCount(Address),
    Status(BytesN<32>), SchemaStats(BytesN<32>),
}
```

Soroban `#[contracttype]` serialization produces a typed XDR `ScVal`. A variant key is `ScVal::Vec` containing the `ScVal::Symbol` variant name followed by the typed fields in declared order. The nested `SubjectKey` is another tagged vector. `Digest` and UIDs use `ScVal::Bytes` (exactly 32 bytes), address uses `ScVal::Address` (not an ASCII `G...` string), and an ordinal uses `ScVal::U32` (not `u64` nor text). Before deploying, a real Soroban contract and client should compare generated XDR fixture keys.

- `SubjectCount(subject)` begins at 0. Successful issuance stores `BySubject(subject,n) -> uid` at the old count and increments the count. Thus occupied `n` indices for each subject are **consecutive from zero**. The per-attester and per-recipient counters follow the same rule, storing `ByAttester(attester,n)` and `ByRecipient(recipient,n)`. The older issue wording `ByAttester(attester,nonce)` denotes this per-attester *index ordinal*, not necessarily Attest Protocol's UID nonce.
- `Status(uid) -> {schema_uid, attester, subject, expiration_time, revoked}` uses `BytesN<32>` UIDs, `Address` attester, `SubjectKey` subject, `u64` expiration and boolean revoked. It starts unrevoked and changes only after a successful revocation; expiration is checked on read.
- `SchemaStats(schema_uid) -> {total:u64, revoked:u64}` increments `total` after a successful issuance and increments `revoked` **once** after a successful first revocation. A failed, reverted or repeated revocation changes neither counter. It covers only schemas configured with the resolver. Do not store a region, product or person in a counter.

The read functions `list_by_subject(subject,start,limit)`, `list_by_attester(attester,start,limit)`, and `list_by_recipient(recipient,start,limit)` return ordered UIDs in zero-based inclusive range `[start, min(start+limit,count))`. `limit` must be positive and bounded; a start outside the count yields `[]`. Revoked records remain in historical lists; clients check `Status` separately. An implementation must cap pages to avoid excessive Soroban resource usage.

**No reentrancy:** While Attest calls the resolver, the resolver cannot call Attest again. For a `ref_uid` chain, use the locally maintained `Status(ref_uid)` when checking rules (ADR-005 D2). Resolver setup `configure(schema_uid,rules)` verifies schema authority outside issuance; the index has no administrator or upgrade. Records created without this resolver cannot be magically backfilled.

### 4.1 Direct ledger query

A read-only client can encode the proposed `BySubject(Digest(...),0)` key as XDR and call `getLedgerEntries` against the deployed resolver's **persistent** contract-data entries. Batches must contain no more than **200 keys**. This is illustrative, not evidence of a deployed resolver:

```ts
import { Address, rpc, xdr } from '@stellar/stellar-sdk';
const client = new rpc.Server('https://soroban-testnet.stellar.org');
const subject = Buffer.from(subjectRefHex, 'hex'); // 32 raw bytes
const subjectKey = xdr.ScVal.scvVec([
  xdr.ScVal.scvSymbol('Digest'), xdr.ScVal.scvBytes(subject),
]);
const indexKey = xdr.ScVal.scvVec([
  xdr.ScVal.scvSymbol('BySubject'), subjectKey, xdr.ScVal.scvU32(0),
]);
const ledgerKey = xdr.LedgerKey.contractData({
  contract: new Address(indexContractId).toScAddress(),
  key: indexKey,
  durability: xdr.ContractDataDurability.persistent(),
});
const response = await client.getLedgerEntries(ledgerKey);
// For multiple records, split requests into chunks of <= 200 keys.
```

### 4.2 Event topics

Soroban permits **up to four** event topics. The future Yucu index proposes fixed-order `(event_name:Symbol, schema_uid:BytesN<32>, attester:Address, subject:SubjectKey)` for `attest` and `revoke`. If an implementation mirrors `register_schema`, it uses the same order with a **reserved** zero-digest `SubjectKey::Digest` to represent no subject. Schema registration itself is owned by Attest Protocol: these are proposed index events, **not** an assertion that Attest v2 emits them. No event topic contains plaintext community data.

## 5. Validity and alternative systems

A usable attestation must **exist**, be **unrevoked**, be **unexpired**, and match the **expected schema** and **expected subject**; dependent `ref_uid` consent must still be valid. A hash match alone proves none of these. Attest's `is_valid_for` is a v3 proposal, not yet a v2 guarantee; adapters must make the checks explicitly on v2.

| Criterion | Ethereum Attestation Service (EAS) | Attest Protocol + proposed Yucu index |
| --- | --- | --- |
| Base | EVM attestation registry | Soroban Attest Protocol registry |
| Validity | `isAttestationValid` checks that UID exists ([EAS.sol L381–383](https://github.com/ethereum-attestation-service/eas-contracts/blob/master/contracts/EAS.sol#L381-L383)) | Yucu adapter also verifies expiration, revocation, expected subject/schema |
| Revocation | Direct and delegated requests ([EAS.sol L238–253](https://github.com/ethereum-attestation-service/eas-contracts/blob/master/contracts/EAS.sol#L238-L253)) | The artisan issues and may revoke their consent; dependencies check its status |
| Delegation | First-class delegated attest/revoke ([EAS.sol L103–111](https://github.com/ethereum-attestation-service/eas-contracts/blob/master/contracts/EAS.sol#L103-L111)) | Soroban native authorization; fee sponsorship to be separately tested |
| Search | Mature off-chain indexing and explorers | Proposed optional on-chain `BySubject` / `ByAttester` lists |
| Content | Arbitrary `data` bytes | Yucu places only digests in `value` |

**EAS advantages:** established tooling, broad EVM deployment, delegated issuance, off-chain attestations, SDKs and third-party integrations. Yucu's planned index benefits are **not yet proven by deployment**. No blockchain can verify a real-world claim's truth solely from its hash.

## 6. Six test vectors and worked example

[`vectors/attestation-ids.json`](vectors/attestation-ids.json) contains six deterministic *public test fixtures* with input `kind`, subject, content, salt, schema and optional `refUid`; expected output is `subjectRef`, `saltedHash`, `manifestHash` and `value`. These are **not** Attest UID test vectors or live ledger attestations.

Example `origin-lot`:

1. UTF-8 encode literal `lot:LOTE-001`, then SHA-256 -> `86a08345c37654fd3020790b0266bea12c7e344ff290f8bafd6db0ae8a812e18`.
2. JCS-canonicalize the example content, UTF-8 encode it, and prepend the **fixture-only** 16-byte salt `00112233445566778899aabbccddeeff`.
3. SHA-256 of concatenated bytes -> `262cbe3729e57964c1a02b34c86e30778db36bfd0cd78e1c7ab32065403a2c06`.
4. JCS-canonicalize `schemas/origen-comunitario.json` and hash its UTF-8 -> `d8c9c643c034b123e3f5c9b0084fff2224483b05633ddbbfc88b75acce60abcf`.
5. Concatenate `yucu:1:`, subject hash, `:`, content hash (no optional reference). The resulting string must equal the vector's `value`.

The reference implementation lives in `src/core/attestations/ids.ts`, uses WebCrypto with **no new dependencies**, and intentionally does not implement base Attest Protocol's UIDs. Tests in `src/tests/attestation_ids.test.ts` cover six vectors, different salts, negative cases and consecutive zero-based subject indices in a pure model; the actual index and RPC integration tests belong to #162.

## References

- [ADR-003](../adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md)
- [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md)
- [ADR-007](../adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md)
- [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785)
- [Attest Protocol source](https://github.com/daccred/attestprotocol)
- [EAS.sol](https://github.com/ethereum-attestation-service/eas-contracts/blob/master/contracts/EAS.sol)
