# Requirements from ADR-003: non-custodial architecture and Trustless Work

This document translates the decisions of ADR-003 into verifiable requirements in English. It describes the design only: the app keeps no custody of keys or funds, every chain operation follows one signing pattern, and the interface reaches the network only through the architecture ports. Requirements that the ADR leaves open are listed under **Questions** instead of being invented.

## Functional requirements

| ID | Requirement | Source |
|---|---|---|
| `RF-01` | The system must never generate, store, receive, or recover another person's private key, and must never hold funds. | D1 |
| `RF-02` | Conditional-payment purchases must use Trustless Work escrow; `contracts/fair_escrow` must remain teaching material and must never be used in the app. | D2; section 5 |
| `RF-03` | Every chain operation must follow one pattern: prepare an unsigned transaction, sign it on the person's device, then submit the signed XDR. | D3 |
| `RF-04` | The server may prepare transactions, pay fees with fee-bump (CAP-15), and sponsor reserves (CAP-33), but must never sign for a producer, buyer, or cooperative. | D3 |
| `RF-05` | All development and demonstrations must run on Stellar testnet; a move to mainnet must require a new ADR with legal review. | D4 |
| `RF-06` | The producer's account must be created on the device, its secret key must be stored encrypted with a PIN in IndexedDB, and the paper recovery card must stay with the person, never with the project. | D5 |
| `RF-07` | Registering a lot with `register_lot` in `lot_passport` must require two signatures: the certifier node's authorization and the producer's signature on the transaction envelope. | D6 |
| `RF-08` | The certifier key must live only in the server environment (`STELLAR_CERTIFIER_SECRET`), must be different from the admin key, and the server must never hold the admin key. | D6 |
| `RF-09` | The user interface must speak only to the ports in `src/core/chain/` (`WalletPort`, `LotRegistryPort`, `EscrowPort`); it must not import the Stellar SDK or call Trustless Work directly. | Section 3 |
| `RF-10` | Every result must state its origin with `source: 'testnet' | 'simulated'`; when the origin is `simulated`, the interface must show `<DemoBadge />`. | Section 3 |
| `RF-11` | Escrow milestones must add up to 100 percent, and the approver, release signer, and dispute resolver must be people or the cooperative, never the platform. | Section 3, escrow rules |
| `RF-12` | When a dispute is resolved, the producer's share must move from 0 to 100 percent and the remainder must return to the buyer. | Section 3, escrow rules |

## Non-functional requirements

| ID | Requirement | Source |
|---|---|---|
| `RNF-01` | Security: secret keys must never be stored unencrypted, sent over the network, or written to logs. | Section 5 |
| `RNF-02` | Security: if the certifier key is exposed, the admin must be able to replace it with `set_certifier` without redeploying the contract. | D6 |
| `RNF-03` | Accuracy of displayed state: the system must not show a confirmation label or a payment label for anything that was not confirmed on the network. | Section 5 |
| `RNF-04` | Usability: signing with a PIN must be understandable for older users and for people with little digital experience, and this must be checked in the field. | Section 4, risks |
| `RNF-05` | Recovery and privacy: the safeguard for the paper recovery card must be designed with the community, and the card must never be sent to the server. | Section 4, risks; D5 |
| `RNF-06` | Cost control: sponsoring fees and reserves spends XLM from the platform, so the sponsor must be limited per account. | Section 4, risks; D5 |
| `RNF-07` | Maintainability: if the Trustless Work API changes, only `EscrowPort` should need to change. | Section 4, pros |
| `RNF-08` | Legal boundary: the non-custodial design reduces legal risk but does not replace legal advice before operating with real money. | Closing note of ADR-003 |

## Questions

- Field validation is still pending for D5: whether passkeys with Soroban smart wallets are more usable than a PIN, and whether they fit the Trustless Work transaction flow.
- How the community will keep the paper recovery card safely is left to a future UX decision.

## Sources

- [ADR-003: Arquitectura no custodial con Trustless Work](../adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md)
