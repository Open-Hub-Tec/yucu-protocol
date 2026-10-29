> **Documento histórico (v1.2.0, octubre de 2026). Describe un diseño anterior y contiene afirmaciones sin evidencia; no lo uses como especificación.** La arquitectura vigente está en [ADR-005](./adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) (atestaciones sobre Attest Protocol; `attestation_registry` es solo material de práctica) y [ADR-007](./adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) (motor de voz: la IA prepara, la persona firma; ningún oráculo emite ni certifica). Donde este documento los contradiga, mandan los ADR.

# Yucu Infrastructure Protocol Specification (v1.2.0)
## Decentralized RWA Attestation Layer, Autonomous AI Oracles & Multi-Anchor Settlement on Stellar & Soroban

[![Yucu CI Quality & Integrity Gate](https://github.com/Open-Hub-Tec/yucu/actions/workflows/ci.yml/badge.svg)](https://github.com/Open-Hub-Tec/yucu/actions/workflows/ci.yml)
[![Open-Hub-Tec](https://img.shields.io/badge/TecNM-Tlaxiaco-blue)](https://github.com/Open-Hub-Tec)
[![Stellar](https://img.shields.io/badge/Blockchain-Stellar%20Soroban-black)](https://stellar.org)
[![Attestations](https://img.shields.io/badge/Standard-RWA%20Attestation%20Engine-purple)](https://stellar.org)
[![Drips](https://img.shields.io/badge/Funding-Drips%20Eligible-green)](https://drips.network)

---

## 1. Abstract & Scope

This specification formalizes **Yucu**, an open-source decentralized infrastructure protocol designed for **Real-World Asset (RWA) Attestations**, **Autonomous AI Oracles**, and **Hybrid Multi-Anchor Settlement** on the **Stellar Network** and **Soroban Smart Contract Environment**.

Yucu addresses the systemic failure of global commodity supply chains in verifying the authenticity, sustainability, and ethical compensation of unbanked smallholder farmers and indigenous female artisans.

By establishing an open **Attestation Engine**—the Stellar counterpart to the Ethereum Attestation Service (EAS)—coupled with **4 Autonomous AI Oracles** (Acoustic Indigenous Voice, Computer Vision Quality Grading, Satellite EUDR Geofencing, and Liquidity Solver), Yucu transforms physical agricultural harvests into verifiable, audit-ready digital assets that can be permissionlessly consumed by global trade finance dApps, roasters, European customs brokers, and consumer cooperatives.

---

## 2. High-Level Protocol Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THIRD-PARTY PROTOCOL CONSUMERS                            │
│    (Coffee Cooperatives, European Importers, Ethical Retailers, Agtech dApps)          │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ consumes via @yucu-protocol/sdk
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                                RAÍZ PROTOCOL CORE STACK                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. IDENTITY & CREDENTIAL LAYER (Zero-Seed-Phrase IAM / DID)                            │
│    - Passwordless rural authentication: SMS OTP + Community QR Cards (ADR-002)         │
│    - Deterministic Stellar account abstraction with gas fee-sponsorship relay          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. AUTONOMOUS AI ORACLES                                                               │
│    - AIVoiceOracle: Phonetic normalization of Tu'un Savi / Zapotec into canonical data │
│    - AIQualityOracle: Computer Vision SCAA defect scoring & ancestral dye validation   │
│    - AIEUDRSatelliteOracle: Sentinel-2 multispectral geofence zero-deforestation proof │
│    - AISettlementSolver: Multi-anchor path payment and optimal liquidity router        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. RWA ATTESTATION ENGINE (EAS Equivalent for Stellar Soroban)                         │
│    - Schema Registry (`AttestationRegistry.rs`): UID definitions and field validation  │
│    - Verifiable Claims: SCAA Quality, EUDR Compliance, Ancestral Origin, Weight Slip   │
│    - Cryptographic Community Digest SHA-256 anchored on the Stellar Ledger             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. SOROBAN RWA SMART CONTRACTS (Rust / WebAssembly)                                    │
│    - `LotPassport.rs`: Immutable bag manifests, custody logs, and audit trails        │
│    - `FairEscrow.rs`: Trustless escrow with on-chain attestation release gate          │
│    - `PerpetualRoyalties.rs`: 10% automated secondary resale royalty to female artisans │
│    - `CommunalTequio.rs`: 2% collective community infrastructure development fund      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. MULTI-ANCHOR HYBRID SETTLEMENT RAILS                                                │
│    - Mexico: Etherfuse (MXNe / SPEI) -> Banco del Bienestar Debit Cards                │
│    - Mexico Rural Field: MicoPay Cash Terminal -> Physical Weighing Scale Cash-out     │
│    - Bolivia: Polar Anchor -> ASFI QR Simple Instant Interbank Settlement              │
│    - Brazil: Banco Central do Brasil PIX Anchor -> 24/7 Real Payout                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The RWA Attestation Engine Specification

### 3.1 Motivation: Why Stellar Needs an Attestation Standard
In Ethereum, the Ethereum Attestation Service (EAS) standardized the creation and verification of structured claims. In Stellar, while Soroban supports smart contract storage and SEP-53 provides message signing, there has been no unified, schema-based attestation protocol for agricultural commodities, EUDR regulations, and indigenous heritage provenance.

Yucu defines an extensible, on-chain **Attestation Registry** on Soroban that allows any entity (human inspector, autonomous AI oracle, municipal assembly) to register structured attestations against a recipient account or lot UID.

### 3.2 Canonical Data Structures (Soroban / Rust)

```rust
use soroban_sdk::{contracttype, Address, BytesN, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AttestationSchema {
    pub schema_uid: BytesN<32>,
    pub name: String,
    pub description: String,
    pub schema_definition: String, // e.g., "uint8 cup_score, uint16 humidity_bps, bool eudr_compliant"
    pub revocable: bool,
    pub issuer_authority: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AttestationRecord {
    pub attestation_uid: BytesN<32>,
    pub schema_uid: BytesN<32>,
    pub recipient: Address,
    pub issuer: Address,
    pub payload_hash: BytesN<32>,    // Canonical SHA-256 of the structured claim
    pub issued_at: u64,
    pub expiration_time: u64,        // 0 = perpetual
    pub revoked: bool,
    pub signature: BytesN<64>,       // Ed25519 signature from the issuer
}
```

### 3.3 Registered Core Schemas

#### Schema 1: `SCAAQualityAttestation` (`0x01_SCAA`)
- **Fields:**
  - `cup_score`: $u8$ (e.g., $86$ represents 86.5 SCAA points)
  - `moisture_bps`: $u16$ (e.g., $1120$ represents 11.20% moisture content)
  - `defect_count_primary`: $u8$ (Count of Grade 1 defects)
  - `defect_count_secondary`: $u8$ (Count of Grade 2 defects)
  - `sensory_notes`: String (e.g., "Floral, Panela, Citrus, Cocoa")
- **Issuer:** `AIQualityOracle` + Licensed Q-Grader.
- **Verification Rule:** `cup_score >= 80` unlocks Specialty Coffee classification; `cup_score >= 85` triggers Export Premium payout.

#### Schema 2: `EUDRDeforestationAttestation` (`0x02_EUDR`)
- **Fields:**
  - `parcel_polygon_hash`: $BytesN<32>$ (SHA-256 of GeoJSON boundary)
  - `baseline_date`: $u64$ (December 31, 2020 timestamp)
  - `forest_loss_detected`: $bool$
  - `confidence_score_bps`: $u16$ (e.g., $9940$ represents 99.40% certainty)
  - `satellite_mission`: String ("Copernicus Sentinel-2 MSI / Landsat-9")
- **Issuer:** `AIEUDRSatelliteOracle`.
- **Verification Rule:** `forest_loss_detected == false` required for EU customs clearance.

#### Schema 3: `IndigenousProvenanceAttestation` (`0x03_ORIG`)
- **Fields:**
  - `artisan_identity`: Address
  - `community_name`: String ("San Pablo Tijaltepec, Oaxaca")
  - `ethnic_group`: String ("Ñuu Savi / Mixteca")
  - `technique`: String ("Backstrap Loom / Telar de Cintura")
  - `dye_profile`: String ("Grana Cochinilla, Wild Indigo / Añil")
  - `communal_assembly_seal`: $BytesN<32>$
- **Issuer:** Local Agrarian Assembly + `AIVoiceOracle`.
- **Verification Rule:** Guarantees 10% perpetual resale royalties to the original female artisan.

#### Schema 4: `PhysicalDeliveryAttestation` (`0x04_WGHT`)
- **Fields:**
  - `lot_id`: String
  - `sack_count`: $u16$
  - `net_weight_kg_bps`: $u32$ (e.g., $12000$ represents 120.00 kg)
  - `weighmaster_id`: Address
  - `scale_terminal_id`: String ("MicoPay-Terminal-Tlaxiaco-01")
- **Issuer:** Certified Weighmaster + MicoPay Terminal.
- **Verification Rule:** Triggers atomic release of funds in `FairEscrow.rs`.

---

## 4. The 4 Autonomous AI Oracles

```
                     ┌───────────────────────────────────┐
                     │    RAW SENSOR / RURAL INPUT       │
                     └─────────────────┬─────────────────┘
                                       │
        ┌──────────────┬───────────────┴───────────────┬──────────────┐
        │ Audio Note   │ Smartphone Photo              │ GPS Boundary │
        ▼              ▼                               ▼              ▼
┌──────────────┐ ┌───────────────────────────┐ ┌───────────────┐ ┌────────────────┐
│AIVoiceOracle │ │      AIQualityOracle      │ │AIEUDRSatellite│ │AISettlement    │
│Tu'un Savi    │ │ Computer Vision SCAA &    │ │Copernicus     │ │Multi-Anchor FX │
│Normalization │ │ Ancestral Textile Density │ │Sentinel-2     │ │& Gas Solver    │
└───────┬──────┘ └─────────────┬─────────────┘ └───────┬───────┘ └────────┬───────┘
        │                      │                       │                  │
        └──────────────┬───────┴───────────────────────┴──────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────────┐
        │ Cryptographically Signed Attestation Digest  │
        │   (Ed25519 Signature + Canonical SHA-256)    │
        └──────────────────────┬───────────────────────┘
                               ▼
        ┌──────────────────────────────────────────────┐
        │   Soroban Smart Contract Execution Gate      │
        │  `AttestationRegistry.rs` & `FairEscrow.rs`  │
        └──────────────────────────────────────────────┘
```

---

## 5. Soroban Smart Contracts Implementation

### 5.1 `FairEscrow.rs` with Attestation Verification
The escrow contract does not rely on subjective human admin approvals. Instead, liquidity release is mathematically governed by on-chain attestation verification:

```rust
pub fn release_escrow(
    env: Env,
    order_id: BytesN<32>,
    delivery_attestation_uid: BytesN<32>,
) -> Result<(), EscrowError> {
    let order = get_order(&env, &order_id)?;
    let attestation = get_attestation(&env, &delivery_attestation_uid)?;

    // 1. Verify schema UID matches PhysicalDeliveryAttestation
    if attestation.schema_uid != SCHEMA_PHYSICAL_DELIVERY {
        return Err(EscrowError::InvalidAttestationSchema);
    }

    // 2. Verify attestation is not revoked or expired
    if attestation.revoked || env.ledger().timestamp() > attestation.expiration_time {
        return Err(EscrowError::AttestationExpiredOrRevoked);
    }

    // 3. Atomically route settlement funds
    let total_amount = order.amount;
    let tequio_fund = (total_amount * 2) / 100; // 2% Communal Infrastructure
    let producer_net = total_amount - tequio_fund; // 98% Direct to Producer

    token::Client::new(&env, &order.token).transfer(
        &env.current_contract_address(),
        &order.producer,
        &producer_net,
    );

    token::Client::new(&env, &order.token).transfer(
        &env.current_contract_address(),
        &order.communal_treasury,
        &tequio_fund,
    );

    Ok(())
}
```

### 5.2 `PerpetualRoyalties.rs`
Ensures female artisans receive a perpetual 10% royalty on any secondary marketplace resale:
```rust
pub fn execute_secondary_sale(
    env: Env,
    item_id: BytesN<32>,
    buyer: Address,
    sale_price: i128,
) -> Result<(), RoyaltyError> {
    let metadata = get_item_metadata(&env, &item_id)?;
    let royalty_amount = (sale_price * 10) / 100; // 10% to original artisan
    let seller_proceeds = sale_price - royalty_amount;

    token::Client::new(&env, &metadata.payment_token).transfer(
        &buyer,
        &metadata.original_artisan,
        &royalty_amount,
    );

    token::Client::new(&env, &metadata.payment_token).transfer(
        &buyer,
        &metadata.current_owner,
        &seller_proceeds,
    );

    set_item_owner(&env, &item_id, &buyer);
    Ok(())
}
```

---

## 6. Developer SDK Reference (`@yucu-protocol/sdk`)

```typescript
import { RaizProtocolSDK } from '@yucu-protocol/sdk';

// Initialize SDK instance
const yucu = new RaizProtocolSDK({
  network: 'stellar-mainnet',
  sponsorGas: true,
  rpcUrl: 'https://soroban-rpc.mainnet.stellar.org'
});

// Issue an SCAA Quality Attestation
const attestation = await yucu.attestations.create({
  schemaUid: '0x01_SCAA',
  recipient: 'GBZ...FARMER',
  data: {
    cupScore: 86.5,
    humidityPercent: 11.2,
    defectCountPrimary: 0,
    defectCountSecondary: 2,
    sensoryNotes: 'Citrus, panela, jasmine, balanced acidity'
  }
});

console.log('Attestation UID:', attestation.uid);
console.log('Stellar Ledger TxHash:', attestation.txHash);
```

---

## 7. Security, Audits & Gas Sponsorship

1. **State TTL & Rent Management:** Soroban temporary and persistent storage boundaries are optimized with automatic rent bumping using the Yucu Relayer.
2. **Account Abstraction Paymaster:** Smallholders never pay transaction fees. The Yucu Fee-Bump Relayer signs all transactions with the `fee_source` set to the protocol's master treasury account.
3. **Formal Verification:** Contracts adhere to the Stellar Development Foundation Soroban Security Checklist and undergo fuzzing and property-based testing.

---

## 8. Governance & Academic Authorship

Maintained by **Open Hub TecNM - Instituto Tecnológico de Tlaxiaco**:
- **José Alfredo (Lead Protocol Architect):** `josealfredo79`
- **Research Faculty & Student Fellows:** Departamento de Ingeniería en Sistemas Computacionales, TecNM Campus Tlaxiaco, Oaxaca, México.
