> **Roadmap histórico (octubre de 2026). Las issues vigentes están en GitHub y en #152 ("Por dónde empezar").** La arquitectura vigente está en [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) (atestaciones sobre Attest Protocol; `attestation_registry` es solo material de práctica) y [ADR-007](../adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) (motor de voz: la IA prepara, la persona firma; ningún oráculo emite ni certifica). Donde este documento los contradiga, mandan los ADR.

# 💧 Yucu Protocol: Decentralized Attestation, AI Oracle & Trustless Work Escrow Roadmap
### *Engineering Tasks & Milestones for Open-Source Contributors, Drips Network & Stellar Community Fund*

* **Repository:** `Open-Hub-Tec/yucu`  
* **Academic Institution:** Instituto Tecnológico de Tlaxiaco (TecNM - Oaxaca, Mexico)  
* **Territorial Scope:** Heroica Ciudad de Tlaxiaco, Santa María Yucuhiti, San Cristóbal Amoltepec, San Juan Mixtepec, San Juan Ñumí  
* **Associated ADRs:** [ADR-001 (Trustless Work Escrow)](../adr/ADR-001-TRUSTLESS-WORK-ESCROW.md), [ADR-002 (Offline-First PWA & Rural Identity)](../adr/ADR-002-OFFLINE-FIRST-PWA-AND-RURAL-IDENTITY.md)  
* **Official Specifications:** [MVP Specification](../MVP_SPECIFICATION.md) • [Architecture Specification](../ARCHITECTURE.md) • [Protocol Specification](../PROTOCOL_SPECIFICATION.md)

---

## 🗺️ Architectural Dependency Graph

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        RAÍZ ATTESTATION PROTOCOL DEPENDENCY GRAPH                      │
├─────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ LAYER 1: DID & IAM      │ LAYER 2: OFFLINE & AI    │ LAYER 4: SOROBAN & ESCROW         │
├─────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ [US-101] #18            │ [US-201] #21             │ [US-401] #26                      │
│ Zero-Seed SMS OTP & PWA │ Offline ACID IndexedDB   │ Trustless Work Milestone Escrow   │
│                         │                          │                                   │
│ [US-102] #19            │ [US-202] #22             │ [US-402] #27                      │
│ Physical QR Card (Elder)│ Acoustic Voice Oracle    │ Perpetual Royalties & Tequio      │
│                         │                          │                                   │
│ [US-103] #20            │ [US-203] #23             │ [US-403] #28                      │
│ Gasless Fee-Bump Relay  │ ISO/IEC 18004 Vector QR  │ Consumer SDK & B2B Showcase       │
└─────────────────────────┴──────────────────────────┴───────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               LAYER 5: PRODUCTION VALIDATION & FIELD PILOT (TLAXIACO)                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [US-501] #29: 50-Producer Validated Pilot in Tlaxiaco (Coffee, Honey, Textiles, Palma) │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏆 COMPLETED MILESTONES (Phase 0: Field Research & Usability Audit)

### ✅ Milestone 1.1 / Issue #1: Field Pain & Middlemen Exploitation Validation
* **Status:** Resolved & Merged via PR #31
* **Evidence:** `HITO_1.1_INVESTIGACION_CAMPO.pdf` *(archivo privado del equipo, ver [PRIVACIDAD.md](../research/PRIVACIDAD.md))* & [`docs/research/HITO_1.1_VALIDACION_CAMPO.md`](../research/HITO_1.1_VALIDACION_CAMPO.md)
* **Outcomes:** 5 student brigades audited 79+ indigenous producers across 4 mountain communities in Oaxaca (Mixtepec, Xochixtlán, Ñumí, Tijaltepec). Documented +1000% markups by coyotes and wages of $1.00-$2.00 MXN/hr.

### ✅ Milestone 1.2 / Issue #2: Elder-Accessibility & Cognitive Friction Audit
* **Status:** Resolved & Merged via PR #30, PR #39 & PR #42
* **Evidence:** [`docs/ux-testing/HITO_1.2_AUDITORIA_FRICCION_UX.md`](../ux-testing/HITO_1.2_AUDITORIA_FRICCION_UX.md)
* **Outcomes:** Multi-community field usability testing with a Triqui weaver (56), a palm weaver (68) and an embroiderer from San Pablo Tijaltepec. Proven that 112px touch targets, single-tap voice recording in *Tu'un Savi*, and physical Hang-Tag QR codes achieve 100% task completion with 0% data loss.

---

## 🟢 SPRINT 1: RURAL ZERO-SEED IDENTITY & ACCOUNT ABSTRACTION

### 📌 Issue #18: `[US-101]` Zero-Seed Rural Identity: Passwordless SMS OTP & Offline PWA Session Attestation
* **Target Component:** `src/core/auth/RaizAuthEngine.ts` & `src/components/RaizAuthModal.tsx`
* **Labels:** `identity`, `authentication`, `pwa`, `phase-1`
* **Estimated Bounty:** 200 USDC / Drips Tier 1 (1–2 days)
* **Architecture Alignment (ADR-002):** Open W3C standards with zero messaging platform fees. Allows smallholders to authenticate via standard Mexican mobile numbers (+52) or community profiles with zero seed phrases or complex passwords, issuing verifiable session tokens.

### 📌 Issue #19: `[US-102]` Physical Attestation Credential: NFC & QR Community Identity Cards for Elderly Producers
* **Target Component:** `src/core/auth/RaizAuthEngine.ts` (Method: `qr_card`)
* **Labels:** `hardware`, `identity`, `elder-mode`, `phase-1`
* **Estimated Bounty:** 250 USDC / Drips Tier 1 (2–3 days)
* **Goal:** Provides physical cryptographic identity cards for illiterate and elder producers (50–85 years old) in Tlaxiaco. Promoters scan the card to authenticate lots without requiring personal smartphones.

### 📌 Issue #20: `[US-103]` Account Abstraction & Fee-Bump Relay: Autonomous Keypair Management & Gas Sponsorship on Stellar
* **Target Component:** `src/core/crypto/CryptoEngine.ts` & Fee-Bump Relay
* **Labels:** `stellar`, `account-abstraction`, `soroban`, `phase-1`
* **Estimated Bounty:** 350 USDC / Drips Tier 2 (3–4 days)
* **Goal:** Derives deterministic Stellar Ed25519 keypairs and sponsors 100% of network fees using Stellar CAP-0015 Fee-Bump transactions, ensuring zero transaction costs for rural producers.

---

## 🟡 SPRINT 2: OFFLINE-FIRST ENGINE & INDIGENOUS VOICE AI ORACLES

### 📌 Issue #21: `[US-201]` Offline-First Attestation Buffer: ACID IndexedDB Persistence & Cryptographic Batch Sync for Mountain Fields
* **Target Component:** `src/utils/offlineStorage.ts` & `src/core/sync/SyncEngine.ts`
* **Labels:** `offline-first`, `indexeddb`, `sync`, `phase-2`
* **Estimated Bounty:** 350 USDC / Drips Tier 2 (3–5 days)
* **Goal:** Guarantees zero data loss in disconnected mountain plots (Yucuhiti, Mixtepec) through an ACID transactional outbox in IndexedDB with automatic cryptographic synchronization upon network reconnection.

### 📌 Issue #22: `[US-202]` AI Voice Oracle: Acoustic Indigenous Speech-to-Attestation in Tu'un Savi (Mixtec) & Rural Spanish
* **Target Component:** `src/core/ai/RaizAIOracles.ts` (`AIVoiceOracle`) & `src/utils/audioRecorder.ts`
* **Labels:** `ai-oracle`, `tuun-savi`, `multimodal-ai`, `phase-2`
* **Estimated Bounty:** 400 USDC / Drips Tier 3 (4–5 days)
* **Goal:** Leverages 24kbps Opus compression and Google Gemini multimodal audio to parse oral harvest registrations in Mixtec (*Tu'un Savi*) and rural Spanish into structured cryptographic lot payloads.

### 📌 Issue #23: `[US-203]` Cryptographic Physical-to-Digital Twin: ISO/IEC 18004 Vector Hang-Tag QR Anchor for Agricultural Lots
* **Target Component:** `src/components/ArtisanQrTagModal.tsx` & `src/utils/qrCode.ts`
* **Labels:** `qr-tag`, `rwa`, `traceability`, `phase-2`
* **Estimated Bounty:** 250 USDC / Drips Tier 1 (2–3 days)
* **Goal:** Generates pure SVG high-contrast vector hang-tags for physical coffee bags, honey drums, and textiles, linking physical commodities to the public Digital Passport without requiring external libraries.

---

## 🟣 SPRINT 3: HYBRID SETTLEMENT & LAST-MILE FIAT DISBURSEMENT

### 📌 Issue #24: `[US-301]` Multi-Anchor Settlement Rail: Direct SPEI Fiat Payout via Etherfuse & MXNe Banxico Integration
* **Target Component:** `src/core/settlement/HybridSettlementOrchestrator.ts` & `src/components/MyPaymentsModal.tsx`
* **Labels:** `payments`, `spei`, `etherfuse`, `mexico`, `phase-3`
* **Estimated Bounty:** 450 USDC / Drips Tier 3 (4–6 days)
* **Goal:** Converts international buyer USDC into Mexican Pesos (MXNe) via Etherfuse and issues direct Banxico SPEI wire transfers to Banco del Bienestar and local credit union debit cards.

### 📌 Issue #25: `[US-302]` Decentralized Cash-Out Rail: MicoPay Rural Cash Liquidity Gateway for Unbanked Producers
* **Target Component:** `src/core/settlement/HybridSettlementOrchestrator.ts` & `src/components/MyPaymentsModal.tsx`
* **Labels:** `payments`, `cash-out`, `micopay`, `rural`, `phase-3`
* **Estimated Bounty:** 400 USDC / Drips Tier 3 (3–5 days)
* **Goal:** Enables unbanked elderly smallholders to receive instant physical cash payouts in their local community or cooperative warehouse upon verified lot delivery.

---

## 🔵 SPRINT 4: SOROBAN SMART CONTRACTS & TRUSTLESS WORK ESCROW

### 📌 Issue #26: `[US-401]` Soroban Smart Contract Escrow: Milestone-Based Trustless Work Integration (ADR-001)
* **Target Component:** `src/core/blockchain/TrustlessWorkEscrowAdapter.ts` & `contracts/lot_passport/src/lib.rs`
* **Labels:** `soroban`, `smart-contracts`, `trustless-work`, `escrow`, `phase-4`
* **Estimated Bounty:** 500 USDC / Drips Tier 4 (5–7 days)
* **Architecture Alignment (ADR-001):** Integrates **Trustless Work**'s audited Soroban escrow architecture with a 2-stage milestone schedule:
  * **Milestone 1 (30% Harvest Advance):** Automatically disbursed upon Yucu origin attestation verification (`0x01_ORIGIN`).
  * **Milestone 2 (70% Final Settlement):** Disbursed upon physical delivery verification at the Tlaxiaco municipal warehouse (`0x04_DELIVERY`).
  * **Arbitration:** Tlaxiaco Municipal Cooperative configured as designated arbiter for weight/moisture disputes.

### 📌 Issue #27: `[US-402]` Soroban Smart Contract: Perpetual Royalties & Tequio Fund (Automated 10% Resale Distribution)
* **Target Component:** `contracts/perpetual_royalties/src/lib.rs`
* **Labels:** `soroban`, `royalties`, `textiles`, `governance`, `phase-4`
* **Estimated Bounty:** 450 USDC / Drips Tier 3 (4–5 days)
* **Goal:** Enforces automated 8% secondary market resale royalties to female artisans and routes 2% to the collective community infrastructure fund (*Tequio Comunal*).

### 📌 Issue #28: `[US-403]` Protocol Registry & Consumer SDK: Verifiable Credential Showcase & B2B Buyer Settlement Portal
* **Target Component:** `src/components/BuyerShowcaseScreen.tsx` & `@yucu-protocol/sdk`
* **Labels:** `sdk`, `b2b-portal`, `showcase`, `phase-4`
* **Estimated Bounty:** 350 USDC / Drips Tier 2 (3–4 days)
* **Goal:** Connects specialty coffee roasters, European importers, and ethical fashion boutiques directly with certified Tlaxiaco communities through verifiable on-chain audits.

---

## 🔴 SPRINT 5: PRODUCTION VALIDATION PILOT (TLAXIACO, OAXACA)

### 📌 Issue #29: `[US-501]` Production Field Validation: 50-Producer MVP Pilot in Tlaxiaco, Oaxaca & Protocol v1.2.0 Release
* **Target Territory:** Tlaxiaco, Santa María Yucuhiti, San Cristóbal Amoltepec, San Juan Mixtepec, San Juan Ñumí
* **Labels:** `field-test`, `community-validation`, `production-release`, `phase-5`
* **Estimated Bounty:** 600 USDC / Drips Tier 4 (7–10 days)
* **Goal:** Validates the end-to-end Attestation Protocol in real field conditions with **at least 50 active indigenous producers** across specialty coffee, wild honey, palm crafts, and backstrap loom textiles, fulfilling the official field metrics defined in `docs/MVP_SPECIFICATION.md`:
  1. 50 active producers onboarding live lots on Soroban.
  2. 0% data loss under offline parcel conditions.
  3. Total registration time under 180 seconds via voice.
  4. Zero seed-phrase friction for elderly farmers.
  5. 100% of validated lots anchored with verified SHA-256 hashes on Stellar.

---

## 🌟 SPRINT 6: STELLAR SOROBAN RWA ATTESTATION ENGINE v1.2.0 (LIVE ARCHITECTURE)

### 📌 Issue #75: `[RWA/Soroban]` Almacenamiento Jerárquico con TTL y Contrato AttestationRegistry
* **Target Component:** `contracts/attestation_registry/src/lib.rs`
* **Labels:** `soroban`, `smart-contracts`, `rwa`, `attestations`
* **Goal:** Implementación del patrón de dos niveles de almacenamiento (Temporary Storage para telemetría transitoria a $0.00001 XLM vs Persistent Storage con `extend_ttl` para sellos canónicos de origen), superando el *state bloat* crónico de Ethereum EAS.

### 📌 Issue #76: `[AI/Oracles]` Enjambre de 6 Agentes Autónomos de Atestación Multimodal (YucuAgentSwarm)
* **Target Component:** `src/core/agents/YucuAgentSwarm.ts`
* **Labels:** `ai-oracles`, `agent-swarm`, `sentinel-2`, `scaa`
* **Goal:** Orquestación de 6 micro-oráculos especializados: `IndigenousVoiceAgent` (Tu'un Savi), `SCAACuppingVisionAgent` (>85 pts), `SentinelEUDRSatelliteAgent` (Copernicus), `DPPCircularityAgent`, `IndigenousIPGuardianAgent` y `SettlementSolverAgent`.

### 📌 Issue #77: `[Compliance/DPP]` Pasaporte Digital de Producto Europeo (ESPR 2026), Insetting de Carbono y GS1 Digital Link
* **Target Component:** `docs/standards/YUCU_RWA_ATTESTATION_SPEC.md` & `server.ts`
* **Labels:** `eudr`, `dpp`, `compliance`, `gs1`
* **Goal:** Esquema `0x05_DPP_CIRCULARITY` que calcula 2.4 kg CO2e netos secuestrados por kg de café bajo sombra y resuelve identificadores estándar **GS1 Digital Link (ISO 22005)** y **W3C Verifiable Credentials**.

### 📌 Issue #78: `[Cultural/IP]` Escudo de Propiedad Intelectual Colectiva Indígena y Regalías Perpetuas (8% + 2% Tequio)
* **Target Component:** `src/core/policy/FairTradeEngine.ts` & Esquema `0x06_INDIGENOUS_IP`
* **Labels:** `cultural-heritage`, `royalties`, `indigenous-rights`, `soroban`
* **Goal:** Cumplimiento con la Ley Federal de Protección del Patrimonio Cultural de los Pueblos Indígenas (2022), registro del `WeaveGrammarDigest` y reparto irrevocable de regalías (8% artesana + 2% Tequio).

### 📌 Issue #79: `[DevTools/Hooks]` Biblioteca de React Hooks (@yucu-protocol/react) y Widget Embebible `<YucuPassportBadge />`
* **Target Component:** `src/core/hooks/useYucuProtocol.ts` & `src/components/YucuPassportBadge.tsx`
* **Labels:** `developer-tools`, `react`, `hooks`, `widgets`
* **Goal:** Provee `useYucuAttestation`, `useYucuDigitalPassport`, el widget embebible para e-commerce (Shopify/WooCommerce) y el Gateway de APIs REST `/api/v1/protocol/*`.

### 📌 Issue #80: `[Education/TecNM]` Skills Pedagógicas y Scaffolder CLI (npm run scaffold) para Estudiantes Residentes
* **Target Component:** `skills/student-*` & `scripts/scaffold-product-module.ts`
* **Labels:** `education`, `tecnm`, `open-hub`, `developer-experience`
* **Goal:** 4 guías prácticas en Rust/Soroban, atestaciones RWA, PWA offline y GitHub, más el CLI `npm run scaffold` para acelerar el desarrollo estudiantil en el TecNM.

### 📌 Issue #71: `[Stellar/SDK]` Integración Oficial de `@stellar/stellar-sdk` v17.3 y Conexión Live a Soroban RPC Testnet
* **Target Component:** `src/core/blockchain/StellarLiveClient.ts`
* **Labels:** `stellar`, `soroban`, `sdk`, `core-engine` (Cerrado - Completado)

### 📌 Issue #40: `[AI/MCP]` Servidor Oficial Stellar Raven MCP y Skills para Asistentes de Código en Soroban
* **Target Component:** `.cursor/mcp.json`, `mcp.json`, `skills/stellar-soroban-rwa/SKILL.md`
* **Labels:** `ai`, `mcp`, `soroban`, `developer-experience` (Cerrado - Completado)
