# Glosario español–inglés

| Término en español | English term | Short definition in English | Where it appears |
|---|---|---|---|
| artesana | artisan | A woman who creates craft or product lots and registers or sells them through Yucu. | `README.md`, `AGENTS.md` |
| atestación | attestation | A verifiable claim issued about a lot, person, delivery or other subject. | `README.md`, `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md` |
| Attest Protocol | Attest Protocol | The external Stellar registry used as the base for Yucu attestations. | `README.md`, `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md` |
| borrador | draft | An unconfirmed data structure prepared by the AI before the person reviews and signs it. | `README.md`, `AGENTS.md`, `docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md` |
| comprador | buyer | A person or organization that pays and approves delivery or verifies a purchase. | `README.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| cofirma | co-signing | Additional authorization required from another account when a rule or lot registration requires it. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md`, `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md` |
| cobro | payment collection | Receipt of funds or creation of a withdrawal for the artisan. | `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md`, `README.md` |
| consentimiento | consent | An attestation issued and revoked by the artisan for authorization of a collaboration or other action. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md`, `README.md` |
| cuenta invisible | invisible account | The artisan's own Stellar account whose wallet and crypto details are hidden from the interface. | `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| emisor | issuer | A person or organization that issues an attestation about a subject. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md` |
| escrow | escrow | Protected or conditional payment managed by Trustless Work in the purchase flow. | `AGENTS.md`, `README.md`, `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md` |
| expediente | off-chain record | Information stored outside the chain when it does not belong on the ledger. | `server.ts`, `docs/adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md` |
| extracción | extraction | Conversion of voice or text into only the structured fields allowed by a schema manifest. | `docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md`, `docs/adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md` |
| firmar | sign | Use the user's own device key to authorize a prepared transaction. | `AGENTS.md`, `README.md`, `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md` |
| hash con sal | salted hash | A content hash protected with a random salt before being stored or referenced. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| hito | milestone | A defined payment step in a protected purchase escrow. | `README.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| índice abierto | open index | Yucu's Soroban resolver that stores lists and counters for attestations without an administrator. | `README.md`, `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md` |
| lot passport | lot passport | The Yucu contract and record for an artisan's registered lot, signed by the producer and certifier. | `README.md`, `lot_passport` in `contracts/` |
| lote | lot | A batch or unit of a product or harvest registered by the artisan. | `README.md`, `AGENTS.md`, `docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md` |
| manifiesto | manifest | A public JSON description of a schema: its fields, privacy levels, questions and confirmation text. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md`, `docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md` |
| motor de atestaciones | attestation engine | The voice-and-text system that creates drafts, asks for confirmation and leaves signing to the person. | `docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md`, `README.md` |
| no custodial | non-custodial | A design in which Yucu never generates, stores or receives private keys and never holds user funds. | `AGENTS.md`, `README.md`, `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md` |
| pasaporte | passport | A digital record that identifies a lot or heritage item and carries verifiable claims. | `README.md`, `AGENTS.md` |
| pasaporte del lote | lot passport | The registered product or harvest record that may be identified through a QR code. | `README.md`, `lot_passport` in `contracts/` |
| PIN | PIN | A device or card code used to unlock a key and authorize signing. | `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| poliza | policy | Not used as a project term; policy rules are instead named in the ADR and contract documentation. | `AGENTS.md` |
| puerto | port | An interface through which the UI communicates with wallet, registry, escrow, payout or attestation services. | `AGENTS.md`, `src/core/chain/ports.ts`, `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md` |
| promotora | field promoter | A community representative who can help the artisan register or sign using the promoter's phone and the artisan's QR card. | `README.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| PWA | PWA | A progressive web app that can be installed and cache assets for offline use. | `README.md`, `AGENTS.md` |
| regla de Yucu | Yucu rule | A Soroban contract rule that defines authorized issuers, consent requirements or co-signing behavior. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md`, `README.md` |
| regalía | royalty | A payment from a resale that goes to the artisan through the perpetual royalties contract. | `README.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| resolver | resolver | A Soroban contract that receives attest and revoke callbacks and maintains Yucu's lists and counters. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md`, `docs/arquitectura/README.md` |
| retención | hold | A status or action that keeps funds in an escrow until release conditions are met. | `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| reventa | resale | A later sale of an item that can trigger the ownership and royalty rules in the passport contract. | `README.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| sujeto | subject | The lot, item, sale, account or other entity to which an attestation refers. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md` |
| tarjeta QR | QR card | A physical card containing the artisan's encrypted key for signing on a promoter's phone when the artisan has no phone. | `README.md`, `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| Tequio | Tequio | A community share from resales paid to an account controlled by the community. | `README.md`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` |
| testnet | testnet | The Stellar network used to develop and demonstrate Yucu before a mainnet deployment. | `README.md`, `AGENTS.md`, `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md` |
| transacción sin firmar | unsigned transaction | A transaction prepared by the server or API that has not yet been signed by the corresponding person. | `AGENTS.md`, `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md` |
| Trustless Work | Trustless Work | The external escrow system used for protected purchases and milestone payments. | `AGENTS.md`, `README.md`, `docs/adr/ADR-001-TRUSTLESS-WORK-ESCROW.md` |
| verificador | verifier | A buyer, shop, contract or AI agent that checks whether an attestation remains valid. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md`, `docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md` |
| vector de prueba | test vector | A fixed input and expected result used to verify that an implementation produces the same attestation format and hashes. | `docs/adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md`, `docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md` |
| XDR | XDR | The serialized Stellar transaction format signed on the user's device and submitted to the network. | `docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md` |

