> **Obsoleto (28 de octubre de 2026).** Este borrador describe un diseño anterior y contiene afirmaciones sin evidencia. No lo uses ni lo compartas: la arquitectura vigente está en [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) y este documento se reescribirá a partir de ella.

# SEP-XXXX: Verifiable RWA Attestation Standard for Soroban

```
SEP: Draft
Title: Verifiable Real-World Asset (RWA) Attestation Registry for Soroban
Authors: José Alfredo & Research Fellows (Open Hub TecNM Campus Tlaxiaco)
Track: Standard
Status: Draft
Created: 2026-09-29
Requires: SEP-53, Soroban Protocol 22
```

## 1. Abstract

This Stellar Ecosystem Proposal (SEP) specifies an open, decentralized **Attestation Registry Standard on Soroban** for creating, verifying, and revoking structured cryptographic claims for Real-World Assets (RWA), agricultural commodities, environmental compliance (e.g. EUDR), and communal heritage provenance.

It serves as the Stellar/Soroban counterpart to the Ethereum Attestation Service (EAS), offering deterministic schema registration, Ed25519 signature validation, canonical SHA-256 digest anchoring, and gas-subsidized execution.

---

## 2. Motivation

While Stellar has established standards for web authentication (SEP-10), KYC (SEP-12), and message signing (SEP-53), it lacks a universal, composable on-chain standard for verifying physical asset attributes, sensory scores, laboratory certifications, and physical delivery confirmations.

Without a standardized attestation interface, every agricultural cooperative, commodity tokenization platform, and supply chain project must develop bespoke, non-interoperable smart contracts.

This SEP defines:
1. A canonical **Schema Registry** interface.
2. A deterministic **Attestation Issuance & Verification** interface.
3. Native integration with **Soroban State TTL & Rent Management**.
4. Interoperability with **Physical Delivery Nodes (e.g., MicoPay Cash Network)** and **Fiat Banking Anchors (e.g., Etherfuse SPEI)**.

---

## 3. Specification

### 3.1 Data Types

```rust
pub struct AttestationSchema {
    pub schema_uid: BytesN<32>,
    pub name: String,
    pub description: String,
    pub schema_definition: String,
    pub revocable: bool,
    pub issuer_authority: Address,
}

pub struct AttestationRecord {
    pub attestation_uid: BytesN<32>,
    pub schema_uid: BytesN<32>,
    pub recipient: Address,
    pub issuer: Address,
    pub payload_hash: BytesN<32>,
    pub issued_at: u64,
    pub expiration_time: u64,
    pub revoked: bool,
    pub signature: BytesN<64>,
}
```

### 3.2 Canonical Interface

```rust
pub trait AttestationRegistryTrait {
    fn register_schema(
        env: Env,
        schema_uid: BytesN<32>,
        name: String,
        description: String,
        schema_definition: String,
        revocable: bool,
        issuer_authority: Address,
    ) -> Result<(), AttestationError>;

    fn create_attestation(
        env: Env,
        attestation_uid: BytesN<32>,
        schema_uid: BytesN<32>,
        recipient: Address,
        payload_hash: BytesN<32>,
        expiration_time: u64,
        signature: BytesN<64>,
        issuer: Address,
    ) -> Result<(), AttestationError>;

    fn verify_attestation(env: Env, attestation_uid: BytesN<32>) -> bool;

    fn revoke_attestation(
        env: Env,
        attestation_uid: BytesN<32>,
        caller: Address,
    ) -> Result<(), AttestationError>;
}
```

---

## 4. Canonical Core Schemas

1. **`0x01_SCAA` (`SCAAQualityAttestation`):** Verifies coffee cup scores (>80 specialty, >85 export grade), humidity, and defect counts.
2. **`0x02_EUDR` (`EUDRDeforestationAttestation`):** Proves parcel polygon compliance with the European Union Deforestation Regulation cutoff baseline (post-2020).
3. **`0x03_ORIG` (`IndigenousProvenanceAttestation`):** Protects ancestral cultural heritage and guarantees 10% perpetual secondary royalties to master artisans.
4. **`0x04_WGHT` (`PhysicalDeliveryAttestation`):** Binds physical crop delivery reception at verified community nodes (e.g. MicoPay cash network) to unlock decentralized escrow liquidity.

---

## 5. Security & Rent Management Considerations

- All schema and attestation records extend their persistent storage TTL using `extend_ttl(100_000, 500_000)` to ensure long-term durability on the Stellar ledger.
- Sponsoring relayers can utilize CAP-0015 Fee-Bump transactions so end-users and unbanked farmers never pay gas fees.

---

## 6. Implementations & Reference Code

- Reference implementation in Rust for Soroban: `contracts/attestation_registry/`
- Production Client: `https://github.com/Open-Hub-Tec/yucu`
- Maintained by: **Open Hub TecNM - Instituto Tecnológico de Tlaxiaco**
