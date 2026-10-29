---
name: stellar-soroban-rwa
description: Engineering guide for Yucu's architecture v2 on Stellar and Soroban. Covers attestations on Attest Protocol with the Yucu index and rules (resolvers), the voice and text attestation engine, @stellar/stellar-sdk on the server, storage TTL, fee-bump sponsorship, SEP-10 sign-in, and Trustless Work milestone escrows.
---

# 🌟 Stellar & Soroban Guide for Yucu (architecture v2)

Reference patterns for building Yucu on **Stellar** and **Soroban (Rust/WASM)**.

> **Project rules win over this guide.** Read [`AGENTS.md`](../../AGENTS.md), [ADR-003](../../docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md), [ADR-004](../../docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), [ADR-005](../../docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md), [ADR-006](../../docs/adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md) and [ADR-007](../../docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) first. Non-custodial: the server never generates, stores or receives user keys; every transaction follows prepare → sign on the phone → submit. The UI only talks to the ports in `src/core/chain/`.

---

## 1. The layers

```
┌───────────────────────────────────────────────────────────────────────────┐
│ PEOPLE        artisan · group · buyer · brand · AI assistants (MCP)       │
├───────────────────────────────────────────────────────────────────────────┤
│ APPS          PWA chat (voice or text) · public verifier · issuer console │
├───────────────────────────────────────────────────────────────────────────┤
│ PORTS         WalletPort · LotRegistryPort · AttestationPort · EscrowPort │
│ (src/core/)   PayoutPort · AI, catalog and session ports                  │
├───────────────────────────────────────────────────────────────────────────┤
│ SERVER        prepares unsigned txs · AI drafts · off-chain data          │
│ (server.ts)   no user keys, no funds  (docs/arquitectura/SERVIDOR.md)     │
├───────────────────────────────────────────────────────────────────────────┤
│ STELLAR       lot_passport · perpetual_royalties                          │
│               Attest Protocol (base) → Yucu index → Yucu rules            │
│               Trustless Work escrow · MicoPay HTLC                        │
├───────────────────────────────────────────────────────────────────────────┤
│ OFF STELLAR   pesos: cash (MicoPay) or SPEI (Etherfuse), behind PayoutPort│
└───────────────────────────────────────────────────────────────────────────┘
```

**Principle (ADR-007): AI speaks, the person signs, the chain proves.** AI transcribes and drafts; it never signs, never issues on its own and never certifies.

---

## 2. Attestations: Attest Protocol is the base

Yucu **does not deploy its own attestation registry** (ADR-005, D10). `contracts/attestation_registry` is practice material only.

| Layer | Who builds it | Issues |
|---|---|---|
| [Attest Protocol](https://github.com/daccred/attestprotocol): stores, revokes and validates (audited, v2 on mainnet and testnet; v3 will include the changes Yucu proposed) | daccred | [daccred/attestprotocol#126–#129](https://github.com/daccred/attestprotocol/issues/126) |
| **Yucu index** (*resolver*): lists by subject, attester and recipient, plus counters, with no indexer | Students | #162 |
| **Yucu rules** (*resolver* chained by the index): allowed issuers, artisan consent, co-signing | Students | #163 |
| Spec: `value` format, manifests, test vectors | Students | #140 |
| `AttestationPort` + simulated version | Students | #141 |

### 2.1 Index rules you must not break (ADR-005, D2)

* **Only accept calls from the Attest Protocol contract.** Store its address in `__constructor` and call `require_auth()` on it. Otherwise anyone could fill the lists with garbage.
* **No reentrancy.** While Attest waits for `onattest`, neither the index nor the rules can call Attest again, and the rules cannot call the index again. The index keeps its own `Status(uid)` and passes the state of the `ref_uid` attestation to the rules.
* **No admin, no `upgrade`.** A fix is a new deployment.
* **No personal data.** Counters and keys never hold region, product or person; content goes as a **salted hash**.

Simplified shape (check the real resolver trait and argument types in Attest Protocol's source before writing code):

```rust
// Sketch only: names and types must match Attest Protocol's resolver interface (#162).
#[contractimpl]
impl YucuIndex {
    pub fn __constructor(env: Env, attest: Address) {
        env.storage().instance().set(&Key::Attest, &attest);
    }

    pub fn onattest(env: Env, uid: BytesN<32>, schema_uid: BytesN<32>, attester: Address, recipient: Address, value: String) -> bool {
        let attest: Address = env.storage().instance().get(&Key::Attest).unwrap();
        attest.require_auth(); // only Attest Protocol may call
        // parse `yucu:1:<subject_ref>:<salted hash>[:<ref_uid>]` (spec #140)
        // append uid to BySubject / ByAttester / ByRecipient, store Status(uid), bump SchemaStats
        // if the schema has rules: call them with the attestation and the Status of ref_uid
        true
    }
}
```

### 2.2 The `value` format (ADR-005, D3)

```
yucu:1:<subject_ref, 64 hex>:<salted hash of the content, 64 hex>[:<ref_uid, 64 hex>]
```

* `subject_ref = sha256("lot:" + code)`, `"item:"`, `"sale:"`…
* The salt is **random and mandatory**: values with few options ("25 kg", a municipality) are easy to guess by brute force.
* `ref_uid` chains origin → sale → delivery → resale.

---

## 3. The voice and text engine (ADR-007)

Each schema has a public **manifest** (JSON; its hash is stored in the schema definition). The engine follows it, so a new schema needs no new code.

```json
{
  "schema": "origen-de-lote",
  "fields": {
    "categoria": { "type": "enum", "values": ["cafe", "mezcal", "textil"], "privacy": "public" },
    "foto":      { "type": "file", "privacy": "hash-only" },
    "nombre":    { "privacy": "forbidden" }
  },
  "voice": { "confirm": { "es": "Entendí: {categoria}. ¿Es correcto?" } },
  "signer": "producer"
}
```

Flow: the person speaks or types → AI transcribes (#154) → the extractor fills **only** the manifest's fields; anything unclear stays empty (#164) → the app reads it back with big Yes / No buttons (#155) → the person signs with `AttestationPort`. `forbidden` fields are dropped even if said aloud. Audio is never stored (ADR-006, D5).

Buyers ask in plain language and get an answer that cites the attestation, or "I don't know" (#165). AI assistants of shops and brands use the **MCP server** (#166).

---

## 4. Soroban storage and rent (TTL)

1. **Persistent** (`env.storage().persistent()`): origin, ownership, index lists. Extend the TTL; an archived entry can be restored, so the verifier says "archived, can be restored", never "does not exist" (ADR-005, D7).
2. **Instance** (`env.storage().instance()`): contract configuration (for example, the Attest Protocol address).
3. **Temporary** (`env.storage().temporary()`): data that may disappear. Many transit readings (weight, moisture) are **not** written one by one: an issuer signs them off chain (SEP-53) and anchors one Merkle root (ADR-005, D8).

TTL is measured in ledgers (~5 s each), not seconds, and capped by the network's `max_entry_ttl`. Measure the real cost on testnet before fixing sizes; do not write cost figures without that measurement.

---

## 5. Server side with `@stellar/stellar-sdk`

Only code under `server.ts` and `src/server/` imports the SDK (or the port adapters in `src/core/chain/`). Routes go in `src/server/routes/`, one file per area ([`SERVIDOR.md`](../../docs/arquitectura/SERVIDOR.md)).

```typescript
import { rpc, Networks } from '@stellar/stellar-sdk';

const sorobanServer = new rpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = Networks.TESTNET; // testnet only until ADR-004 section 5 is resolved
```

### 5.1 Fee-bump sponsorship (CAP-15), so the artisan pays nothing

The sponsor key belongs to the platform, lives only in the server's `.env` and only pays fees. Before wrapping, check the inner transaction against the allow-list of #94, or anyone could drain the sponsor.

```typescript
import { Keypair, Transaction, TransactionBuilder } from '@stellar/stellar-sdk';

const innerTx = TransactionBuilder.fromXDR(userSignedXdr, networkPassphrase);
if (!(innerTx instanceof Transaction)) throw new Error('Expected an inner transaction');
// assertAllowedByWhitelist(innerTx) (#94)
const sponsor = Keypair.fromSecret(process.env.STELLAR_SPONSOR_SECRET!); // name proposed in #94
const feeBump = TransactionBuilder.buildFeeBumpTransaction(sponsor, '200000', innerTx, networkPassphrase);
feeBump.sign(sponsor);
await sorobanServer.sendTransaction(feeBump);
```

Counters (per account, per day) go in shared storage, never in memory: on Vercel each request may hit a different instance ([`BASE_DE_DATOS.md`](../../docs/arquitectura/BASE_DE_DATOS.md), section 4).

---

## 6. Standards Yucu uses

| Standard | Use in Yucu |
|---|---|
| **CAP-15 fee-bump** | The platform pays fees; the artisan never needs XLM (#94) |
| **SEP-10** | Sign-in by signing a challenge, with no passwords or phone numbers (#157) |
| **SEP-53** | Off-chain signed attestations; ed25519 only (ADR-005, D8) |
| **SEP-41 / Stellar Asset Contract** | USDC in the escrow and in withdrawals |
| **x402** | Optional pay-per-verification for AI agents, never charged to the artisan (ADR-007, D6) |

Yucu does **not** become an anchor (SEP-24/38): that would mean holding people's money. Pesos go through `PayoutPort` providers (ADR-004, D9).

---

## 7. Trustless Work milestone escrow (ADR-001, ADR-004 D8)

Use **Trustless Work** through `EscrowPort`. `contracts/fair_escrow` is teaching material only.

1. The buyer funds the escrow in USDC from their own wallet, after their app checks receivers, amounts, fee and roles on chain.
2. Milestones come from a template, 1 to N. The default is **one milestone (100 %)** paid when the buyer confirms receipt. Templates live in `src/config/protocolFees.ts`; never hard-code percentages.
3. The artisan receives each milestone in her own account and releases it with her PIN; the group marks "shipped" and never touches money; the buyer approves; the platform receives only its fee, on top of the price; a third party resolves disputes.
4. No Tequio in the escrow (D10). Tequio exists only on resales through `perpetual_royalties`.

---

## 8. Stellar Raven MCP for AI coding assistants

The repository is configured for **Stellar Raven** (`https://raven.stellar.buzz/mcp`, see `mcp.json`): semantic search over Stellar docs and SEPs, and read-only queries against testnet and mainnet state.

```bash
claude mcp add --transport http stellar-raven "https://raven.stellar.buzz/mcp"
```
