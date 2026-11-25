# Requirements from ADR-001 (Trustless Work Escrow)

Functional and non-functional requirements derived from [`docs/adr/ADR-001-TRUSTLESS-WORK-ESCROW.md`](../../adr/ADR-001-TRUSTLESS-WORK-ESCROW.md). All requirements are verifiable: each row cites its source section in the ADR.

## 1. Functional requirements

| ID | Requirement (The system shall…) | Source |
|----|--------------------------------|--------|
| RF-01 | Adopt Trustless Work's audited smart contract infrastructure on Soroban as the official conditioned escrow engine. | Section 2 - Decision |
| RF-02 | Support three escrow roles: Client (Buyer), Service Provider / Producer, and Approver / Arbitrator. | Section 2 - Decision |
| RF-03 | Allow the Client (Buyer) to deposit funds in USDC, EURC, or Stellar assets. | Section 2 - Decision |
| RF-04 | Allow the Service Provider / Producer to fulfill production and physical delivery. | Section 2 - Decision |
| RF-05 | Allow the Approver / Arbitrator (Tlaxiaco Cooperative) to validate milestones and act as local arbiter in quality or delivery disputes. | Section 2 - Decision |
| RF-06 | Unlock funds incrementally against tamper-proof digital attestations (LotPassport + AttestationRegistry). | Section 2 - Decision |
| RF-07 | Implement Milestone 1 (Origin Attestation): release 30% Advance when the lot is registered with valid harvest parameters, coordinates, and canonical SHA-256 digest on Stellar. | Section 4 - Milestone Schedule |
| RF-08 | Implement Milestone 2 (Physical Reception): release 70% Final when physical coffee sacks are delivered to the Tlaxiaco Municipal Warehouse with verified weight and moisture, verified by local cooperative signature. | Section 4 - Milestone Schedule |
| RF-09 | Support escrow operations: initialize_escrow, deposit_funds, submit_milestone_proof, release_milestone_payment. | Section 3 - Integration Architecture Diagram |
| RF-10 | Integrate last-mile fiat settlement via Etherfuse SPEI (Banco del Bienestar / Oaxaca Credit Unions) and local cooperative cash distribution. | Section 3 - Integration Architecture Diagram |

## 2. Non-functional requirements

| ID | Requirement | Source |
|----|-------------|--------|
| RNF-01 | Security: the escrow infrastructure shall be audited and battle-tested to reduce audit overhead. | Section 5 - Consequences & Trade-offs |
| RNF-02 | Interoperability: the escrow shall interoperate instantly with Stellar ecosystem tools. | Section 5 - Consequences & Trade-offs |
| RNF-03 | Dispute mediation: built-in dispute mediation through the local cooperative without custom court contracts. | Section 5 - Consequences & Trade-offs |
| RNF-04 | API isolation: changes in Trustless Work Soroban contract APIs shall be isolated inside the TrustlessWorkEscrowAdapter. | Section 5 - Consequences & Trade-offs |
| RNF-05 | Provenance: harvest registration shall include valid harvest parameters, coordinates, and canonical SHA-256 digest recorded on Stellar. | Section 4 - Milestone Schedule |

## 3. Questions

None identified. All requirements are covered by ADR-001 Sections 2 through 5.

## Sources

- [`docs/adr/ADR-001-TRUSTLESS-WORK-ESCROW.md`](../../adr/ADR-001-TRUSTLESS-WORK-ESCROW.md)
