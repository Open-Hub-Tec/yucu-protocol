> **Obsoleto (28 de octubre de 2026).** Este borrador describe un diseño anterior y contiene afirmaciones sin evidencia. No lo uses ni lo compartas: la arquitectura vigente está en [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) y este documento se reescribirá a partir de ella.

# 🏛️ Yucu RWA Attestation Specification (v1.2.0)
## *High-Performance Decentralized Real-World Asset (RWA) Provenance, Anti-Fraud & Physical Attestation Infrastructure on Stellar & Soroban*

[![Standard: Stellar Soroban](https://img.shields.io/badge/Standard-Soroban%20WASM-black.svg?logo=stellar)](https://stellar.org)
[![Interoperability: GS1 Digital Link](https://img.shields.io/badge/Interoperability-GS1%20ISO%2022005-blue.svg)](https://ref.gs1.org)
[![Compliance: EUDR 2026](https://img.shields.io/badge/EUDR-Copernicus%20Sentinel--2-emerald.svg)](https://sentinel.esa.int)
[![Escrow: Trustless Work ADR-001](https://img.shields.io/badge/Escrow-Trustless%20Work%20ADR--001-purple.svg)](https://trustlesswork.com)

---

## 1. Executive Summary & Purpose

The **Yucu Attestation Protocol (YAP)** establishes an enterprise-grade, open-source infrastructure standard for verifying, anchoring, and monetizing **physical Real-World Assets (RWAs)**—specifically specialty coffee micro-lots, virgin wild honey, ancestral agave spirits, and master indigenous textiles from the Mixteca Highlands of Oaxaca.

By moving beyond the simplistic design patterns of **Ethereum Attestation Service (EAS)**, Yucu introduces an **executable, multi-oracle, zero-state-bloat attestation engine** engineered on **Stellar and Soroban**, natively integrated with fiat banking off-ramps (Banxico SPEI, Banco del Bienestar, MicoPay Cash) and audited milestone escrows (**Trustless Work**).

---

## 2. The Fallacy of EVM / Ethereum Attestation Service (EAS) for Physical RWAs

While Ethereum Attestation Service (EAS) pioneered verifiable claims for digital wallets, applying EVM EAS to physical agricultural commodities and ancestral artisanry encounters **fatal architectural flaws**:

### 2.1 The "Garbage In, Signed Garbage Out" Paradox
* **Ethereum Reality:** EVM contracts cannot observe the physical world. EAS merely checks whether a given ECDSA private key signed an arbitrary JSON blob. If a fraudulent middleman (*coyote*) signs that a coffee lot is "organic, fair-trade, and shade-grown", Ethereum faithfully stores the claim as valid.
* **Yucu Innovation:** Requires the **Physical Ground-Truth Triad**:
  1. **Bio-Acoustic Voice Anchor:** Voice recording in native *Tu'un Savi* or Spanish taken in parcel, normalized into a SHA-256 canonical hash.
  2. **Copernicus Sentinel-2 Spectral Proof:** Autonomous satellite geofence audit verifying zero canopy loss since the EUDR cutoff date (Dec 31, 2020).
  3. **Multi-Role Consensus:** Dual signature combining AI Computer Vision defect classification (>85 SCAA) and Community Assembly approval.

### 2.2 Perpetual State Bloat vs. Soroban TTL Lifecycle
* **Ethereum Reality:** All data written to Ethereum storage persists forever. Storing billions of telemetry checkpoints (temperature, humidity, bag weights, transport waybills) causes massive state bloat and forces users to pay hundreds of dollars in rent and gas.
* **Yucu Innovation:** Leverages Soroban's native two-tier storage:
  * **Temporary Storage (TTL 60 Days):** Shipment telemetry, sensory readings, and scale weighings reside in temporary storage at near-zero cost. When the batch is delivered without disputes, the temporary state automatically expires.
  * **Persistent Storage (Origin Core):** Only the 32-byte `CommunityDigest`, the issuer authority, and the lot UID are anchored permanently, with rent automatically renewed (*TTL bump*) by the TecNM Relayer.

### 2.3 Prohibitive Gas Tolls vs. Stellar CAP-0015 Fee-Bump
* **Ethereum Reality:** On Ethereum L1, creating an attestation costs $15 to $50 USD. Even on Layer-2 rollups (Arbitrum, Optimism), fluctuating fees between $0.20 and $0.80 USD per transaction destroy the economic margins of smallholders harvesting 50-kg sacks.
* **Yucu Innovation:** Native transaction fee sponsorship via **Stellar CAP-0015 Fee-Bump**. Network fees are fixed at **$0.00005 USD** and 100% paid by the university treasury relayer. The rural producer never touches, buys, or calculates crypto gas.

---

## 3. High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          1. PHYSICAL HARVEST & PARCEL SENSING                          │
│  - Oral Voice Registration (Tu'un Savi / Spanish) in 112px "Modo Abuelo" Offline PWA   │
│  - Local SHA-256 Community Digest Computation at Device Edge                           │
│  - Vector ISO/IEC 18004 Hang-Tag QR Generation for Physical Coffee Sacks               │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        2. TRIAD ORACLE VERIFICATION ENGINE                             │
│  - AIVoiceOracle: Acoustic transcription & harvest parameter extraction               │
│  - AIQualityOracle: Computer vision SCAA specialty classification (>85 pts)            │
│  - AIEUDRSatelliteOracle: Sentinel-2 multispectral vegetation index & anti-deforest   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    3. SOROBAN SMART CONTRACT REGISTRY (XDR WASM)                       │
│  - Compact Structs: 32-byte Hashes, Symbols, and Addresses (BytesN<32>)                │
│  - Two-Tier TTL: Ephemeral Transit Telemetry vs. Persistent Provenance Seal            │
│  - Native Fee-Bump Transaction Sponsorship (Stellar CAP-0015)                          │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                  4. EXECUTABLE SETTLEMENT & MULTI-ANCHOR OFF-RAMPS                     │
│  - Trustless Work Escrow: Attestations act as atomic execution triggers               │
│    • Attestation 0x01_ORIGIN  ➔ 30% Harvest Advance unlocked to Producer Card          │
│    • Attestation 0x04_DELIVERY➔ 70% Final Payout released via Banxico SPEI / MicoPay  │
│  - 2% Communal Tequio Fund Credited for Village Infrastructure & Water Works           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Soroban Smart Contract Interface (Rust)

```rust
// contracts/attestation_registry/src/lib.rs
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct YucuAttestation {
    pub schema_id: Symbol,       // e.g. "SCAA_85", "EUDR_2026", "NOM_TEXTIL"
    pub lot_uid: BytesN<32>,     // SHA-256 canonical hash of physical lot
    pub issuer: Address,         // Cooperative or Oracle Ed25519 public key
    pub recipient: Address,      // Producer wallet or escrow vault
    pub data_hash: BytesN<32>,   // Complete proof dossier hash (IPFS/Local)
    pub expiration: u64,         // Unix timestamp for validity
    pub revoked: bool,           // Revocation status
}

#[contract]
pub struct YucuAttestationRegistry;

#[contractimpl]
impl YucuAttestationRegistry {
    /// Anchors an attestation in persistent storage with automatic TTL rent bump
    pub fn register_attestation(
        env: Env,
        issuer: Address,
        recipient: Address,
        schema_id: Symbol,
        lot_uid: BytesN<32>,
        data_hash: BytesN<32>,
        validity_seconds: u64,
    ) -> BytesN<32> {
        issuer.require_auth();

        let expiration = env.ledger().timestamp() + validity_seconds;
        let attestation = YucuAttestation {
            schema_id,
            lot_uid: lot_uid.clone(),
            issuer,
            recipient,
            data_hash,
            expiration,
            revoked: false,
        };

        // Persistent storage with active TTL rent management
        env.storage().persistent().set(&lot_uid, &attestation);
        env.storage().persistent().extend_ttl(&lot_uid, validity_seconds as u32, validity_seconds as u32);

        lot_uid
    }

    /// Read-only verification callable by any dApp, marketplace, or customs broker
    pub fn verify_attestation(env: Env, lot_uid: BytesN<32>) -> bool {
        if let Some(att) = env.storage().persistent().get::<BytesN<32>, YucuAttestation>(&lot_uid) {
            if att.revoked {
                return false;
            }
            if env.ledger().timestamp() > att.expiration {
                return false;
            }
            return true;
        }
        false
    }
}
```

---

## 5. Developer REST API & External Integration Gateway

External applications, European roasters, and logistics operators interact with Yucu via clean REST and Webhook protocols:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/protocol/spec` | Official Soroban smart contract addresses, active oracles, and ledger parameters. |
| `POST` | `/api/v1/attestations/verify` | Independent cryptographic verification of any lot code or SHA-256 digest. |
| `POST` | `/api/v1/attestations/issue` | Mints a new signed attestation anchored on Soroban with 100% sponsored gas. |
| `GET` | `/api/v1/lots/:code/passport` | Resolves the lot digital twin conforming to W3C Verifiable Credentials and GS1 Digital Link. |
| `GET` | `/api/v1/developer/webhooks/catalog` | Catalog of reactive webhook events (`yucu.attestation.issued`, `yucu.escrow.milestone_unlocked`). |

---

## 6. Official Standards Interoperability Matrix

1. **GS1 Digital Link (ISO/IEC 22005):** Standard URI format encoded in physical sack QR tags (`https://yucu.tecnm.mx/01/{gtin}/10/{lotCode}`). Automatically decodable by commercial supply chain scanners.
2. **W3C Verifiable Credentials (VC 2.0):** Cryptographic Ed25519 signatures verifiable off-chain without contacting centralized databases.
3. **Stellar SEP-8 (Regulated Asset Standard):** Allows compliance verification (KYC/AML and origin compliance) before lot transfers settle.
4. **Stellar SEP-40 (Oracle Feeds):** Standardizes how SCAA sensory cup scores and EUDR satellite outputs feed into Soroban automated funds and lending protocols.
5. **Trustless Work Escrow Standard (ADR-001):** Conditioned milestone vaults locked in USDC/MXNe, unlocking directly to Banxico SPEI and cash-in-hand parcel networks.

---

*Authored by the Computer Systems Engineering Student-Research Fellowship & Faculty Leadership at **Instituto Tecnológico de Tlaxiaco (TecNM - Oaxaca, Mexico)** in collaboration with Open Hub Tec and the Stellar Community.*
