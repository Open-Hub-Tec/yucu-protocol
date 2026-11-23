# Sequence diagram: community origin attestation

> **Design, not implemented.** This port does not exist yet: the diagram is a design based on ADR-005. `AttestationPort` has a simulated version planned (#141), and v3 of Attest Protocol is not released.

This diagram shows how a community authority (the group) attests the origin of a lot through `AttestationPort`, and how Attest Protocol, the Yucu index and the Yucu rules process it. It also shows how a verifier reads the result directly from the network. Yucu does not deploy its own attestation registry (ADR-005, D10).

![Sequence diagram: community origin attestation](img/seq-atestacion-origen.png)

## Elements

| Element | Type | Role in the diagram |
|---|---|---|
| Community authority | Participant | The group that issues the "community origin" attestation (issuer) |
| AttestationPort | Participant | Port in `src/core/chain/ports.ts` (design) |
| Attest Protocol | Participant | Base attestation registry, not deployed by Yucu |
| Yucu index | Participant | Open resolver that stores lists and counters (D2) |
| Yucu rules | Participant | Rules contract for the origin schema (D5) |
| Verifier | Participant | Any buyer, shop, contract or agent that checks the attestation |
| prepareAttest | Message | `prepareAttest(req: AttestRequest)` returns `UnsignedTransaction` |
| build value | Message | Port computes `subject_ref`, adds salt, builds `value` (D3) |
| sign | Message | Authority signs the transaction on its device |
| submitAttest | Message | `submitAttest(signedXdr)` returns receipt and `attestationId` |
| attest | Message | Attest Protocol receives the signed issuance |
| onattest | Message | Resolver hook called before storing (D2) |
| store lists and Status | Message | Index writes BySubject, ByAttester, ByRecipient, Status(uid), SchemaStats |
| check rules | Message | Index calls the rules with the attestation data |
| verify | Message | `verify(attestationId, expected)` |
| Status(uid) | Message | Read of the index state from the network |
| valid, revoked, expired, archived, source | Return value | Result of `verify` |

## Sources

- `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md` (D1, D2, D3, D4, D5, D9, D10)
- `AGENTS.md` (prepare → sign on the phone → submit)

## Not defined in the sources

- Order between the index writing its lists and calling the rules (ADR-005 only says that if the rules say no, everything reverts).
- How the group signs (a single key or multisig).
- Who pays the network fee and the rent (open question, ADR-005 section 8).
- Exact network call `verify` uses in v2 (`is_valid_for` arrives with v3).
