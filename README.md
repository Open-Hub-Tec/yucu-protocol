<div align="center">

# Yucu Protocol

**Speak, confirm, sign: voice-first attestations and non-custodial payments for artisans and smallholder producers of the Mixteca region of Oaxaca, built on Stellar, Soroban and Attest Protocol.**

[![CI](https://github.com/Open-Hub-Tec/yucu-protocol/actions/workflows/ci.yml/badge.svg)](https://github.com/Open-Hub-Tec/yucu-protocol/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](./LICENSE)
[![Network: Stellar testnet](https://img.shields.io/badge/Stellar-testnet%20only-black.svg?logo=stellar)](./contracts/deployments/testnet.json)
[![Status: prototype](https://img.shields.io/badge/status-prototype-orange.svg)](#implementation-status)

[What it is](#what-yucu-is) · [Principles](#design-principles) · [Voice and text](#from-voice-to-a-signed-attestation) · [How it works](#how-it-works) · [Architecture](#architecture) · [Status](#implementation-status) · [Roadmap](#roadmap) · [Quickstart](#quickstart) · [Contributing](#contributing) · [Docs](#documentation)

</div>

> **Prototype.** Yucu runs on Stellar **testnet** only. The contracts have not been audited, no fees are charged, and several modules are still simulated. The [status table](#implementation-status) says exactly what is real.

---

## What Yucu is

Artisans and small producers in the Mixteca highlands sell through intermediaries who set the price, while their work is copied and resold without attribution. Most have no bank account, and many are older people with little digital experience.

Yucu gives each artisan three things, without ever showing her a wallet, a crypto asset or a key, and without forms: **she speaks or types in a chat, AI drafts what she said and reads it back, and she signs.**

1. **A lot passport.** She registers her lot (a textile, a harvest) by voice or text and signs it herself. Anyone who scans the QR on the piece can check its origin on Stellar without trusting Yucu.
2. **Payment in pesos, directly to her.** Buyers in Mexico pay her directly in pesos. Buyers abroad pay into a protected escrow that releases to her own account, and she cashes out in pesos at a local shop.
3. **Royalties on resales.** When a piece is resold through the contract, a share goes back to her, and a community share (Tequio) goes to an account the community controls.

The lot passport lives in Yucu's `lot_passport` contract. Every other claim (community origin, consent, collaboration, delivery, weighing) is an **attestation** on [Attest Protocol](https://github.com/daccred/attestprotocol), the audited attestation registry already on Stellar mainnet. Yucu does not deploy its own registry ([ADR-005](./docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md), D10). On top of it, Yucu adds:

* an **open index**: lists by lot, issuer and account, plus counters, kept on chain, so nobody has to trust an indexer;
* **Yucu's rules**: who may issue, the artisan's consent, co-signing;
* a **voice and text engine** ([ADR-007](./docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md)) that turns what a person says into an attestation **she signs**, and answers questions with a source on chain.

Attest Protocol accepted the changes Yucu proposed for its v3 ([daccred/attestprotocol#126–#129](https://github.com/daccred/attestprotocol/issues/126)). The design is documented and split into issues; the code is not built yet.

The name comes from *yuku*, "mountain" in Tu'un Savi (Mixtec). The project is developed by students of the Instituto Tecnológico de Tlaxiaco (TecNM) through GitHub issues.

---

## Design principles

These rules are binding for every contribution ([`AGENTS.md`](./AGENTS.md)).

| Principle | What it means in practice | Decided in |
|---|---|---|
| **Non-custodial** | The server never generates, stores or receives private keys, and never holds funds. Every transaction follows **prepare → sign on the phone → submit**. | [ADR-003](./docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md) |
| **The artisan only sees pesos** | She has her own Stellar account, but the interface never shows "wallet", USDC, addresses or hashes. | [ADR-004](./docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) D1 |
| **She signs, nobody signs for her** | With her own phone, or with her QR card on a field promoter's phone; the key is erased afterwards. The group never receives her money. | ADR-004 D3, D4, D10 |
| **Minimum data on chain** | Municipality (not the exact community), closed categories, volume ranges, a photo hash. No names, no amounts. | ADR-004 D5, [`PRIVACIDAD.md`](./docs/research/PRIVACIDAD.md) |
| **The artisan never pays** | Platform fees are added on top of her price and paid by buyers or businesses. | ADR-004 D11 |
| **AI drafts, the person signs** | AI transcribes, fills only the fields the schema allows, and reads them back. It never signs, never issues on its own and never certifies. | [ADR-007](./docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) D3 |
| **Nothing fake** | Simulated results carry `source: 'simulated'` and a visible demo badge. Hashes, ledgers and certifications are never invented. | `AGENTS.md` rule 3 |
| **One source for percentages** | Fees, royalties and Tequio come only from [`src/config/protocolFees.ts`](./src/config/protocolFees.ts), which must match the contracts. | `AGENTS.md` rule 7 |

---

## From voice to a signed attestation

In the field interviews, a Mixtec speaker said that for an older person "it may be easier to speak and record an audio than to write", and a honey producers' union already reports "by word of mouth or WhatsApp" ([ADR-006](./docs/adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md)). So the app is a chat, and the principle is: **AI speaks, the person signs, the chain proves.**

```
1. She speaks or types     "I have 20 kilos of coffee from Yosondúa, October harvest"
2. AI drafts               transcribes and fills only the schema's fields;
                           anything unclear stays empty and is asked again (#154, #164)
3. The app reads it back   big Yes / No buttons; she can fix a field by voice or by touch (#155)
4. She signs               PIN or QR card; no fee to pay (#94), queued if there is no signal (#99)
5. The chain proves        lot passport, or attestation on Attest Protocol + Yucu index;
                           anyone can verify (#142)
```

**Any attestation can work this way.** Each schema has a public **manifest** (a JSON whose hash is stored in the schema): what to ask, which fields are public, hash-only or forbidden, how to read it back, and who signs and co-signs. The engine follows the manifest, so a new schema needs no new code.

| Attestation | Issued by | By voice or text |
|---|---|---|
| Lot origin | The group | Yes; the photo is taken with the camera |
| Consent | **The artisan** | Yes; she hears what she authorizes, and can revoke it the same way |
| Collaboration | A brand | Yes; requires the artisan's current consent, each party signs on their own phone |
| Delivery | Buyer or group | Yes: "it arrived" → confirm → sign |
| Transit (weight, moisture) | Group or promoter | Yes; exact figures are read back and can be corrected by touch |
| AI opinion | Yucu's AI service | Not voice: always shown as an AI suggestion, never as a certification |

Buyers get the same low friction: they **ask in plain language** ("where does this coffee come from?") and the verifier answers citing the attestation on chain, or says it does not know (#165). Assistants of shops and brands can verify through an **MCP server** (#166).

Limits, stated plainly: Spanish first; Mixtec (Tu'un Savi) is under evaluation in a field test (#158). The engine is described as general-purpose only after a second, non-craft business works with its manifest alone (#167).

---

## How it works

### Who signs what

| Actor | Role | Signs with |
|---|---|---|
| **Artisan** | Registers her lots, receives and releases payments, cashes out | Her phone (non-exportable key + PIN) or her QR card on a promoter's phone ([#91](https://github.com/Open-Hub-Tec/yucu-protocol/issues/91), [#117](https://github.com/Open-Hub-Tec/yucu-protocol/issues/117)) |
| **Certifier** | Co-signs the lot registration | Their own account (ADR-003 D6) |
| **Community group** | Accompanies registration, marks orders as shipped, seals heritage items | Its own account; **never receives sales money** |
| **Buyer** | Pays; approves delivery in a protected purchase | Their own wallet, e.g. Freighter ([#115](https://github.com/Open-Hub-Tec/yucu-protocol/issues/115)) |
| **Dispute resolver** | Decides disputed escrows | A trusted third party, never Yucu ([#103](https://github.com/Open-Hub-Tec/yucu-protocol/issues/103)) |
| **Yucu server** | Prepares unsigned transactions, runs the AI that drafts, stores off-chain data | **No keys, no funds** |

### Where the money goes

| Situation | Path | On Stellar |
|---|---|---|
| **Buyer in Mexico** | Pays the artisan directly in pesos (SPEI or cash on delivery) | Only the lot passport |
| **Buyer abroad (protected purchase)** | USDC from the buyer's wallet → [Trustless Work](https://trustlesswork.com) escrow → released to the artisan's own account → cash-out in pesos | Passport + escrow |
| **Cash-out in pesos** | Behind a single `PayoutPort` ([#112](https://github.com/Open-Hub-Tec/yucu-protocol/issues/112)): cash at a local agent shop (MicoPay, in development), SPEI for artisans with RFC and a bank account (Etherfuse, with on-device data checks and assisted onboarding: [#145](https://github.com/Open-Hub-Tec/yucu-protocol/issues/145), [#146](https://github.com/Open-Hub-Tec/yucu-protocol/issues/146)); MoneyGram Ramps and Pago46 are being evaluated | Withdrawal signed by the artisan |
| **Resale of a piece** | Through `perpetual_royalties`: royalty to the artisan and Tequio to a community account. Only a resale that pays the royalty transfers ownership in the passport ([#110](https://github.com/Open-Hub-Tec/yucu-protocol/issues/110), [#137](https://github.com/Open-Hub-Tec/yucu-protocol/issues/137)) | Royalty payment + new owner |

The default protected purchase has **one milestone**: the group marks it shipped, the buyer approves, and the artisan releases the payment to herself. Platform fees go to a legally constituted entity, and **no fee will be charged on mainnet** before a tax and legal review ([questions](./docs/sostenibilidad/PREGUNTAS_CONTADOR_Y_ABOGADO.md)).

---

## Architecture

![Layers: people, apps, ports, prepare and sign, Stellar, and payments outside Stellar](./docs/arquitectura/yucu-capas.svg)

The apps talk **only to the ports** in [`src/core/chain/ports.ts`](./src/core/chain/ports.ts). No component imports `@stellar/stellar-sdk` or calls Trustless Work directly.

| Port | Responsibility | Real implementation |
|---|---|---|
| `WalletPort` | Device key, QR card or external wallet (`kind`) | [#91](https://github.com/Open-Hub-Tec/yucu-protocol/issues/91), [#117](https://github.com/Open-Hub-Tec/yucu-protocol/issues/117), [#115](https://github.com/Open-Hub-Tec/yucu-protocol/issues/115) |
| `LotRegistryPort` | Register and read lot passports | [#92](https://github.com/Open-Hub-Tec/yucu-protocol/issues/92), [#93](https://github.com/Open-Hub-Tec/yucu-protocol/issues/93) |
| `EscrowPort` | Protected purchase on Trustless Work | [#96](https://github.com/Open-Hub-Tec/yucu-protocol/issues/96) |
| `PayoutPort` | Cash-out in pesos | [#112](https://github.com/Open-Hub-Tec/yucu-protocol/issues/112), [#114](https://github.com/Open-Hub-Tec/yucu-protocol/issues/114), [#145](https://github.com/Open-Hub-Tec/yucu-protocol/issues/145), [#146](https://github.com/Open-Hub-Tec/yucu-protocol/issues/146) |
| `AttestationPort` | Issue, revoke, verify and list attestations on Attest Protocol and the Yucu index | [#141](https://github.com/Open-Hub-Tec/yucu-protocol/issues/141) (design in ADR-005) |

Each port has a demo implementation ([`SimulatedChain.ts`](./src/core/chain/SimulatedChain.ts)) so the UI can be built before the real one exists. More diagrams, including the signing flow and the money flow, are in [`docs/arquitectura/`](./docs/arquitectura/README.md).

### Server and database

The Express server ([`server.ts`](./server.ts)) prepares unsigned transactions, talks to providers that need a secret key (Gemini, Trustless Work, Etherfuse) and stores what does not belong on chain. Teams follow two guides: [`SERVIDOR.md`](./docs/arquitectura/SERVIDOR.md) (one route file per area, one error format, no important state in memory, tests without external calls) and [`BASE_DE_DATOS.md`](./docs/arquitectura/BASE_DE_DATOS.md) (PostgreSQL tables, what is **never** stored, photos stripped of GPS before hashing). People are `G…` addresses: no names, phones or IDs. Login is a signed challenge (SEP-10), with no passwords ([#157](https://github.com/Open-Hub-Tec/yucu-protocol/issues/157)). Deployment to Vercel with a preview per PR: [#170](https://github.com/Open-Hub-Tec/yucu-protocol/issues/170).

### Attestations

| Layer | What | Issues |
|---|---|---|
| Base | Attest Protocol (audited; v2 on mainnet and testnet, v3 with Yucu's changes) | [daccred/attestprotocol#126–#129](https://github.com/daccred/attestprotocol/issues/126) |
| Yucu index and rules | Soroban *resolvers*: lists, counters, consent, co-signing | [#162](https://github.com/Open-Hub-Tec/yucu-protocol/issues/162), [#163](https://github.com/Open-Hub-Tec/yucu-protocol/issues/163) |
| Specification and manifests | Field format, manifests, test vectors | [#140](https://github.com/Open-Hub-Tec/yucu-protocol/issues/140) |
| Engine | AI port, extractor, read-back, conversational verifier, MCP | [#154](https://github.com/Open-Hub-Tec/yucu-protocol/issues/154), [#155](https://github.com/Open-Hub-Tec/yucu-protocol/issues/155), [#164](https://github.com/Open-Hub-Tec/yucu-protocol/issues/164), [#165](https://github.com/Open-Hub-Tec/yucu-protocol/issues/165), [#166](https://github.com/Open-Hub-Tec/yucu-protocol/issues/166) |

### Smart contracts

Soroban contracts in Rust, in a single workspace under [`contracts/`](./contracts/). Deployed on **testnet** on 2026-10-26 (IDs in [`testnet.json`](./contracts/deployments/testnet.json)).

| Contract | Purpose | Testnet ID |
|---|---|---|
| `lot_passport` | Lot registration signed by the producer and the certifier | [`CAPXWY…`](https://stellar.expert/explorer/testnet/contract/CAPXWYKU5GESGPZ57LNRCLOVHSBGDOZQVAWC6CWIQ655RSZ2ZGZI2BO7) |
| `perpetual_royalties` | Heritage items, resales, royalty and Tequio | [`CCNPTD…`](https://stellar.expert/explorer/testnet/contract/CCNPTDDVW3RW53YQACZ2UFFHVLUJXNCMZ3TSK7TB552SUU6DDL26FRKU) |
| `attestation_registry` | **Practice material only.** Not redeployed and not for mainnet: attestations move to Attest Protocol (ADR-005) | [`CAIYZN…`](https://stellar.expert/explorer/testnet/contract/CAIYZNZIFHFU357CVFC5UF2YNHBI7KPVORPOGHOBN2HBI4EDQQGIUNHT) |
| `fair_escrow` | **Teaching material only.** The real escrow is Trustless Work | [`CCVDEQ…`](https://stellar.expert/explorer/testnet/contract/CCVDEQ64Q4PJX73HLLPL3OYXLW4ARA652I34ZYIDQDXYQDQVJNLFSAQB) |

A single redeployment is planned once [#110](https://github.com/Open-Hub-Tec/yucu-protocol/issues/110) lands (constructors, closed data fields, admin-only `upgrade`, token allow-list, royalty checks).

---

## Implementation status

This is a working prototype. Every PR that changes a module's status must update this table.

| Module | Status | What it really does today |
|---|---|---|
| PWA (React + Vite, service worker) | ✅ Real | Installable app; assets cached for offline use. |
| Offline storage ([`offlineStorage.ts`](./src/utils/offlineStorage.ts)) | ✅ Real | Saves lots in IndexedDB (localStorage fallback). |
| Soroban contracts ([`contracts/`](./contracts/)) | ✅ Real, testnet | 4 contracts with tests. Not audited, not on mainnet; redeployment pending [#110](https://github.com/Open-Hub-Tec/yucu-protocol/issues/110). |
| Chain ports ([`src/core/chain/`](./src/core/chain/)) | 🟡 Architecture ready | Ports and demo implementation with tests. The real implementations are open issues. |
| Protocol fees ([`protocolFees.ts`](./src/config/protocolFees.ts)) | 🟡 Test values | Aligned with the contracts; final values depend on the tax and legal review. |
| Hosting | 🟡 Google AI Studio only | Vercel with previews per PR is open ([#170](https://github.com/Open-Hub-Tec/yucu-protocol/issues/170)). |
| Server and database design ([`SERVIDOR.md`](./docs/arquitectura/SERVIDOR.md), [`BASE_DE_DATOS.md`](./docs/arquitectura/BASE_DE_DATOS.md)) | 🟡 Documented | Routes, tables and rules are specified; the code is open issues. |
| Attestations on Attest Protocol and voice engine | 🟡 Documented | ADR-005 and ADR-007 plus issues #140–#167; nothing built yet. |
| Chat, image analysis, transcription ([`server.ts`](./server.ts)) | 🟡 Experimental | Records real audio and calls Gemini when `GEMINI_API_KEY` is set. Voice does **not** register a lot yet ([#155](https://github.com/Open-Hub-Tec/yucu-protocol/issues/155)). Without the key, some replies are invented (a "verified" transcription, fixed image diagnoses); to be fixed in [#154](https://github.com/Open-Hub-Tec/yucu-protocol/issues/154). Use the free Google AI Studio tier only with invented data ([ADR-006](./docs/adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md), D1). |
| Catalog and data ([`mockData.ts`](./src/data/mockData.ts)) | 🔴 Demo only | No database yet: buyer products are fictional demo data, and registered lots live only in app state ([#156](https://github.com/Open-Hub-Tec/yucu-protocol/issues/156)). |
| Public API `/api/v1/*`, `useYucuProtocol` hooks, `YucuPassportBadge` | 🔴 Simulated | The endpoints return fixed or random values; the hooks and the badge consume them. Not a real verification service yet. |
| `SorobanAdapter.ts`, `StellarLiveClient.ts` | 🔴 Simulated / partial | Fake hashes or `simulated: true`; to be replaced by the ports ([#105](https://github.com/Open-Hub-Tec/yucu-protocol/issues/105), [#109](https://github.com/Open-Hub-Tec/yucu-protocol/issues/109)). |
| `TrustlessWorkEscrowAdapter.ts` | 🔴 Simulated | In-memory escrows; to be replaced by the real `EscrowPort` ([#96](https://github.com/Open-Hub-Tec/yucu-protocol/issues/96)). |
| `HybridSettlementOrchestrator.ts` | 🔴 Simulated | Fixed exchange rates and locally generated SPEI folios; to be replaced by `PayoutPort`. |
| `RaizAIOracles.ts`, `YucuAgentSwarm.ts` | 🔴 Simulated | Fixed scores and `CERTIFIED` results; no satellite or lab data. |
| `SyncEngine.ts`, `RaizAuthEngine.ts` | 🔴 Simulated | `setTimeout` sync; fixed OTP and placeholder addresses. |
| `CryptoEngine.ts` | 🔴 To fix | Hash fallback is not real SHA-256 ([#120](https://github.com/Open-Hub-Tec/yucu-protocol/issues/120)). |

**Not a certification.** Quality, EUDR, carbon or "AI certified" labels shown in the app are demonstrations. Yucu does not issue official certifications.

---

## Roadmap

Work is organized as GitHub issues. Implementation order for the non-custodial core:

```
#110 contracts ─▶ #92 prepare ─┐
#91 wallet ─────────────────────┼─▶ #93 register a real lot ─▶ #98 / #99
#94 fee sponsorship ────────────┘
#91 ─▶ #117 QR card · #112 payouts ─▶ #114 · #145 ─▶ #146 SPEI · #96 escrow ─▶ #119
#110 ─▶ #137 royalty recipient
Attestations: #140 spec ─▶ #141 port ─▶ #142 verifier · #143 issuer console · #148 artisan view · #151 impact page
              #140 ─▶ #162 index ─▶ #163 rules
Voice engine: #154 AI port ─▶ #155 voice registration · #164 extractor ─▶ #165 verifier · #166 MCP ─▶ #167 second business
Server:       #170 Vercel · #156 database ─▶ #157 sign-in
Independent: #120 real SHA-256 · #121 buyer privacy · #106 no fake verifications · #108 honest texts
```

| Track | Status | Key issues and documents |
|---|---|---|
| **Phase 1: lot passport** | Accepted design; app integration in progress | #91, #92, #93, #97, #99, #110 |
| **Phase 2: protected purchase and cash-out** | Testnet design | #96, #112, #114, #115, #116, #119, #145, #146 |
| **Resale royalties** | Contract on testnet; hardening open | #110, #137 |
| **Attestations and voice engine** | Draft ADRs; built on Attest Protocol, whose v3 changes were accepted | [ADR-005](./docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md), [ADR-007](./docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md), #140–#143, #148, #151, #154, #155, #158, #162–#167 |
| **Server, data and hosting** | Documented; code open | [`SERVIDOR.md`](./docs/arquitectura/SERVIDOR.md), [`BASE_DE_DATOS.md`](./docs/arquitectura/BASE_DE_DATOS.md), #106, #154, #156, #157, #170 |
| **Validation** | Field work | The problem is supported by exploratory interviews with artisans and 14 buyers ([`HITO_1.3`](./docs/ux-testing/HITO_1.3_VALIDACION_COMPRADORES.md)). The only usability score measured so far is SUS 55, below the 68 benchmark, with 3 students acting as buyers; to be retested with real users. Buyers ([#68](https://github.com/Open-Hub-Tec/yucu-protocol/issues/68)), brands ([#131](https://github.com/Open-Hub-Tec/yucu-protocol/issues/131)), disputes ([#103](https://github.com/Open-Hub-Tec/yucu-protocol/issues/103)) |
| **Before mainnet** | Open | Legal entity, tax and legal opinion, threat model, audit, community consent |

---

## Quickstart

Requires Node 22 ([`.nvmrc`](./.nvmrc)). Rust and the Stellar CLI are only needed for the contracts.

```bash
git clone https://github.com/Open-Hub-Tec/yucu-protocol.git
cd yucu-protocol
nvm use
npm ci
cp .env.example .env    # optional: GEMINI_API_KEY for the AI features (free tier: invented data only, ADR-006 D1)
npm run dev             # http://localhost:3000
```

Checks that must pass before opening a PR:

```bash
npm run lint     # TypeScript, no errors
npm test         # TypeScript tests
npm run build    # production build

# Only if you changed contracts/
cd contracts
cargo fmt --all
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
```

---

## Contributing

Yucu is built by TecNM Tlaxiaco students working from GitHub issues. Contributions may be recognized through [Drips Wave](https://www.drips.network/wave) when the issue is part of an active Wave.

1. Read [`AGENTS.md`](./AGENTS.md) (it applies to people and AI assistants alike), [`CONTRIBUTING.md`](./CONTRIBUTING.md) and the ADRs the issue mentions.
2. Ask to be assigned **before** you start; one team per issue.
3. Work on a branch `feat/issue-<n>-<topic>` or `fix/issue-<n>-<topic>`; `main` is protected.
4. Add a positive and a negative test for every new rule.
5. Open the PR with `Resolves #<n>`, and be ready to explain your code: a PR you cannot explain is not merged, even if it works.

**Privacy and security.** Never commit names of interviewed people, phone numbers, addresses, keys (`S…`) or API keys. Audio, video, photos of people and PDFs do not go into `docs/research/`, `docs/ux-testing/` or `public/videos/` (CI rejects them). See [`PRIVACIDAD.md`](./docs/research/PRIVACIDAD.md).

**AI assistants.** The repository is configured for the [Stellar Raven](https://raven.stellar.buzz/mcp) MCP server ([`mcp.json`](./mcp.json)). AI-generated code is welcome only when it is tested and the contributor understands it.

---

## Documentation

| Topic | Document |
|---|---|
| Architecture: layers, ports, signing and money flow | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), [`docs/arquitectura/`](./docs/arquitectura/README.md) |
| Server guide and database model | [`SERVIDOR.md`](./docs/arquitectura/SERVIDOR.md), [`BASE_DE_DATOS.md`](./docs/arquitectura/BASE_DE_DATOS.md) |
| ADR-001: Trustless Work escrow | [`ADR-001`](./docs/adr/ADR-001-TRUSTLESS-WORK-ESCROW.md) |
| ADR-002: offline-first PWA and rural identity; communication channels | [`ADR-002 (PWA)`](./docs/adr/ADR-002-OFFLINE-FIRST-PWA-AND-RURAL-IDENTITY.md), [`ADR-002 (channels)`](./docs/adr/ADR-002-COMMUNICATION-CHANNELS-AND-WHATSAPP-ALTERNATIVES.md) |
| ADR-003: non-custodial design and Trustless Work | [`ADR-003`](./docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md) |
| ADR-004: payments in pesos without a wallet | [`ADR-004`](./docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) |
| ADR-005: attestations on Attest Protocol, with an open index (draft) | [`ADR-005`](./docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) |
| ADR-006: off-chain data and AI (draft) | [`ADR-006`](./docs/adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md) |
| ADR-007: voice and text attestation engine (draft) | [`ADR-007`](./docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) |
| Sustainability: open tax and legal questions | [`docs/sostenibilidad/`](./docs/sostenibilidad/PREGUNTAS_CONTADOR_Y_ABOGADO.md) |
| Field research and privacy rules | [`docs/research/`](./docs/research/), [`PRIVACIDAD.md`](./docs/research/PRIVACIDAD.md) |
| Usability testing and field guides | [`docs/ux-testing/`](./docs/ux-testing/) |
| Student guides | [`docs/guides/`](./docs/guides/), [`docs/estudiantes/`](./docs/estudiantes/) |
| Earlier attestation drafts (**obsolete**, superseded by ADR-005) | [`docs/standards/`](./docs/standards/) |

---

## Team

* **Institution:** Instituto Tecnológico de Tlaxiaco (TecNM), Ingeniería en Sistemas Computacionales. Oaxaca, Mexico.
* **Faculty advisor and maintainer:** Mtro. José Alfredo Román Cruz.
* **Contributors:** student teams of Open Hub TecNM Campus Tlaxiaco ([contributors](https://github.com/Open-Hub-Tec/yucu-protocol/graphs/contributors)).
* **License:** [MIT](./LICENSE).
