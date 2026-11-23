# Requirements from ADR-002: Offline-First PWA and Zero-Seed Rural Identity

Source document: `docs/adr/ADR-002-OFFLINE-FIRST-PWA-AND-RURAL-IDENTITY.md`

ADR-002 does not number its decisions, so the **Source** column cites the ADR section (§1 Context & Problem Statement, §2 Channel Evaluation Matrix, §3 Architecture Decision for the MVP, §4 Consequences & Benefits).

## Functional requirements

| ID | Requirement | Source |
|----|-------------|--------|
| RF-01 | The system must provide an Offline-First Progressive Web App (PWA) as the primary MVP channel, running in a modern mobile browser on low-cost Android smartphones. | §3, Primary MVP Channel |
| RF-02 | The system must store records locally in IndexedDB when the farmer is offline on the parcel. | §3, Primary MVP Channel; §2, row "Operates 100% Offline" |
| RF-03 | The system must record voice audio in Tu'un Savi (Mixtec) and in Spanish using the standard MediaRecorder API. | §3, Primary MVP Channel |
| RF-04 | The system must compress the recorded voice audio with the Opus codec at 24 kbps. | §3, Primary MVP Channel |
| RF-05 | The system must synchronize locally stored records automatically in the background when the device reconnects to community WiFi or mobile data. | §3, Primary MVP Channel |
| RF-06 | The system must sign cryptographic hashes locally on the device using the Web Crypto API with Ed25519. | §2, row "Local Cryptographic Signing"; §1, flaw "Lack of Local Cryptographic Capabilities" |
| RF-07 | The system must let a cooperative promoter authenticate a lot by scanning a physical Community QR Card, without requiring passwords or 24-word seed phrases. | §3, Zero-Tech Inclusive Mechanism |
| RF-08 | For lots authenticated with a Community QR Card, the system must sign with a delegated cooperative key. | §2, row "Local Cryptographic Signing", column "Physical Community QR Card" |
| RF-09 | If the optional Telegram WebApp / Bot channel is enabled, the system must send institutional buyers and roasters real-time alerts of newly certified lots. | §3, Secondary Notification Channel (Optional) |

## Non-functional requirements

| ID | Category | Requirement | Source |
|----|----------|-------------|--------|
| RNF-01 | Offline use | The PWA must operate 100% offline, using IndexedDB and a Service Worker, where there is no cellular signal or mobile data. | §2, row "Operates 100% Offline"; §1, flaw "Zero Offline Capability" |
| RNF-02 | Cost | The system must not incur per-message or per-conversation usage fees. | §2, row "Per-Message / Usage Cost"; §4, "Zero Recurring Communication Costs" |
| RNF-03 | Openness | The PWA must be built on open W3C web standards and be 100% open source. | §2, rows "Per-Message / Usage Cost" and "Sovereignty & Open Source" |
| RNF-04 | Independence | The system must not depend on Meta or commercial messaging APIs for its primary channel. | §4, "Technological Sovereignty"; §1, "Commercial API Fees & Restrictions" |
| RNF-05 | Availability | The system must not depend on a third-party platform that can suspend or ban community accounts or numbers. | §1, flaw "Operational Suspension Risk (Vendor Lock-in)" |
| RNF-06 | Inclusion | The system must be usable by unincorporated indigenous producer associations, without corporate business verification. | §1, flaw "Commercial API Fees & Restrictions" |
| RNF-07 | Accessibility | The PWA interface must offer 112px ergonomic touch targets and voice input for elderly users. | §2, row "Elder Accessibility" |
| RNF-08 | Accessibility | Elderly farmers and weavers who do not own smartphones must be able to take part through the physical Community QR Card, with no personal technology required. | §3, Zero-Tech Inclusive Mechanism; §2, row "Elder Accessibility" |
| RNF-09 | Compatibility | The PWA must run on low-cost Android smartphones in any modern mobile browser, with no app installation required for the primary channel. | §3, Primary MVP Channel |
| RNF-10 | Cost | The Community QR Card must have a one-time print cost of about USD 0.25. | §2, row "Per-Message / Usage Cost" |

## Questions

These points are not defined in ADR-002, so they are not listed above as requirements.

1. **Privacy:** The ADR does not say how long voice recordings are kept, who can access them, or whether they leave the device. Is there a privacy requirement for voice audio and personal data?
2. **Performance:** The ADR gives no targets such as maximum sync time, local storage limits or maximum recording length. Are there any?
3. **Security of keys:** The ADR does not say where the Ed25519 keys are stored on the device, how they are backed up or recovered, who holds the delegated cooperative key, or how a lost or stolen QR Card is revoked.
4. **QR Card content:** What does the card encode, and how does the system verify it when a promoter scans it?
5. **Sync behavior:** The ADR does not describe retries, conflict handling or what happens if a sync is interrupted.
6. **Accessibility scope:** Voice input is mentioned, but screen-reader support and other languages besides Tu'un Savi and Spanish are not. Should they be required?
7. **Telegram channel:** Which events trigger an alert, and what do buyers and roasters receive?
8. **Status:** The ADR header says "Accepted / Implemented". Should the requirements be checked against the current implementation, or only against the ADR?
