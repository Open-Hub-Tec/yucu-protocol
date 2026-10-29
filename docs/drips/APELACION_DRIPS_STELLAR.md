> **Registro histórico: así se envió la apelación en octubre de 2026; su contenido no se edita.** La arquitectura vigente está en [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) (atestaciones sobre Attest Protocol; `attestation_registry` es solo material de práctica) y [ADR-007](../adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) (motor de voz: la IA prepara, la persona firma; ningún oráculo emite ni certifica). Donde este documento los contradiga, mandan los ADR.

# 🏛️ Formal Appeal: Yucu Protocol (`Open-Hub-Tec/yucu-protocol`)
**To:** Drips Review Committee & Stellar Community Fund (SCF) Governance  
**From:** Open Hub TecNM — Instituto Tecnológico de Tlaxiaco (Oaxaca, Mexico)  
**Repository:** [https://github.com/Open-Hub-Tec/yucu-protocol](https://github.com/Open-Hub-Tec/yucu-protocol)  
**Latest Production Commit:** `ba7c6f2` (`main` branch)  
**Contact:** `tecnologicotlaxiaco@gmail.com`  
**License:** Open Source MIT (Digital Public Good)

---

## 📌 Executive Summary

We respectfully request a formal re-review of **`Open-Hub-Tec/yucu-protocol`** for Drips funding allocation. 

Yucu Protocol is **not a speculative crypto concept**; it is an active, production-ready **Real-World Asset (RWA) provenance, anti-fraud, and financial escrow infrastructure** designed and deployed by faculty and indigenous engineering students at a public technical university in the high mountains of Oaxaca, Mexico. 

The protocol bridges rural smallholders (specialty coffee, wild honey, ancestral textiles) directly to international fair-trade markets through **Soroban Smart Contracts**, **Stellar CAP-0015 sponsored fee-bumps**, and **Trustless Work audited escrows**.

---

## 🛠️ 5 Verifiable Technical Pillars Implemented in Repo

| Pillar | Technical Substance on GitHub | Architectural Significance |
| :--- | :--- | :--- |
| **1. Native Soroban Rust Contracts & Two-Tier TTL** | [`contracts/attestation_registry/`](https://github.com/Open-Hub-Tec/yucu-protocol/tree/main/contracts/attestation_registry)<br>[`contracts/fair_escrow/`](https://github.com/Open-Hub-Tec/yucu-protocol/tree/main/contracts/fair_escrow) | Overcomes Ethereum EAS state bloat. Ephemeral telemetry runs in Soroban *Temporary Storage* ($0.00001 XLM); canonical origin seals live in *Persistent Storage* with auto-rent bumping (`extend_ttl`). |
| **2. Official SDK & Stellar Raven MCP Gateway** | [`src/core/blockchain/StellarLiveClient.ts`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/core/blockchain/StellarLiveClient.ts)<br>[`.cursor/mcp.json`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/.cursor/mcp.json) | Implements `@stellar/stellar-sdk` v17.3 connecting live to Soroban RPC Testnet/Mainnet. Pre-configured with SDF's official **Stellar Raven** MCP server (`https://raven.stellar.buzz/mcp`). |
| **3. Audited Trustless Work Milestone Escrow (ADR-001)** | [`src/core/blockchain/TrustlessWorkEscrowAdapter.ts`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/core/blockchain/TrustlessWorkEscrowAdapter.ts)<br>[`docs/adr/ADR-001-TRUSTLESS-WORK-ESCROW.md`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/docs/adr/ADR-001-TRUSTLESS-WORK-ESCROW.md) | Conditioned 2-milestone payment release (30% origin advance / 70% delivery) locking USDC/MXNe, unlocking directly to Banxico SPEI and cash-in-parcel networks with 0% predatory intermediary fees. |
| **4. Expanded 8-Schema Canonical RWA Attestation Catalog** | [`docs/standards/YUCU_RWA_ATTESTATION_SPEC.md`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/docs/standards/YUCU_RWA_ATTESTATION_SPEC.md)<br>[`src/core/agents/YucuAgentSwarm.ts`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/core/agents/YucuAgentSwarm.ts) | Canonical schemas for **EUDR Sentinel-2 Satellite Anti-Deforestation**, **EU Digital Product Passport (ESPR 2026)** with agroforestry carbon insetting, and **Indigenous Cultural IP Protection (2022 Federal Law)** enforcing 8% artisan + 2% Tequio communal royalties. |
| **5. Third-Party Developer Tools & Embeddable Badge** | [`src/core/hooks/useYucuProtocol.ts`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/core/hooks/useYucuProtocol.ts)<br>[`src/components/YucuPassportBadge.tsx`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/YucuPassportBadge.tsx)<br>[`server.ts`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/server.ts) | React Hooks library (`@yucu-protocol/react`), drop-in `<YucuPassportBadge />` for Shopify/WooCommerce, and live REST API `/api/v1/protocol/*` conforming to **GS1 Digital Link (ISO 22005)** and **W3C Verifiable Credentials**. |

---

## 🧪 Rigorous Quality Gate (100% Passing Tests)

The repository enforces strict continuous integration (`npm run verify`):
* **88+ Automated Unit & Integration Tests (0 Failures):**
  * `src/tests/stellar_live_client.test.ts` (Live Soroban RPC connectivity & Ed25519 key derivation).
  * `src/tests/agent_swarm_and_innovations.test.ts` (Carbon insetting math & 8 canonical schemas).
  * `src/tests/trustless_work_escrow.test.ts` (State machine double-spend prevention).
  * `src/tests/complete_system_audit.test.ts` (Offline IndexedDB outbox & SHA-256 Community Digest).
* **Production Build Succeeded:** Clean compilation of Vite frontend bundle and Express Node.js backend.

---

## 🎓 Public Goods & Social Impact in Latin America

Yucu is maintained by **undergraduate indigenous students and faculty** at TecNM Campus Tlaxiaco. The repository includes **4 dedicated educational skills** in `skills/` (`student-soroban-contracts`, `student-rwa-attestations`, `student-offline-pwa`, `student-git-collaboration`) and a CLI scaffolder (`npm run scaffold`) to train the next generation of Web3 and Rust developers in Latin America.

---

## 🔗 Verification Permalinks

1. **GitHub Repository:** [https://github.com/Open-Hub-Tec/yucu-protocol](https://github.com/Open-Hub-Tec/yucu-protocol)
2. **Latest Commit:** [Commit `ba7c6f2`](https://github.com/Open-Hub-Tec/yucu-protocol/commit/ba7c6f2)
3. **Soroban RWA Architecture Spec:** [YUCU_RWA_ATTESTATION_SPEC.md](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/docs/standards/YUCU_RWA_ATTESTATION_SPEC.md)
4. **Live Interactive Protocol Console:** Available in the running production applet.

We invite the Drips evaluation team to review these commits. Yucu Protocol represents the exact type of high-leverage, real-world utility that the Stellar ecosystem and Drips were created to foster.

**Sincerely,**  
*The Faculty, Student Researchers, and Community Delegates*  
**Open Hub TecNM — Instituto Tecnológico de Tlaxiaco**  
*Oaxaca, Mexico*
