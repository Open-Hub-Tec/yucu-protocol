
# Functional and Non-Functional Requirements – ADR-008

## 1. Functional Requirements

| ID | Requirement | Source |
|---|---|---|
| RF-01 | The system must provide a Progressive Web App (PWA) as its primary communication channel. | Section 3.1 – Primary MVP Channel |
| RF-02 | The PWA must store records locally in IndexedDB when the farmer is offline. | Section 3.1 – Primary MVP Channel |
| RF-03 | The PWA must record and compress voice audio using the standard MediaRecorder API at 24 kbps Opus. | Section 3.1 – Primary MVP Channel |
| RF-04 | The PWA must support voice audio in Tu'un Savi (Mixtec) and Spanish. | Section 3.1 – Primary MVP Channel |
| RF-05 | The PWA must automatically synchronize records in the background when connectivity to community WiFi or mobile data becomes available. | Section 3.1 – Primary MVP Channel |
| RF-06 | The system must allow community cooperative promoters to scan physical QR cards to authenticate lots for elderly farmers and weavers without smartphones, passwords, or 24-word seed phrases. | Section 3.2 – Zero-Tech Inclusive Mechanism |
| RF-07 | The system must provide an optional Telegram WebApp or Bot channel for institutional buyers and roasters to receive real-time alerts about newly certified lots. | Section 3.3 – Secondary Notification Channel |

## 2. Non-Functional Requirements

| ID | Requirement | Source |
|---|---|---|
| RNF-01 | The PWA must operate offline using IndexedDB and a Service Worker. | Section 2 – Operates 100% Offline |
| RNF-02 | The PWA must run in modern mobile browsers on low-cost Android smartphones. | Section 3.1 – Primary MVP Channel |
| RNF-03 | The PWA must provide 112px ergonomic tactile controls and voice interaction to support accessibility for elderly users. | Section 2 – Elder Accessibility |
| RNF-04 | The PWA must support local cryptographic signing using the Web Crypto API and Ed25519. | Section 2 – Local Cryptographic Signing |
| RNF-05 | The primary PWA communication channel must not incur per-message usage fees. | Section 2 – Per-Message / Usage Cost; Section 4 – Zero Recurring Communication Costs |
| RNF-06 | The MVP communication architecture must not depend on Meta or commercial messaging APIs. | Section 4 – Technological Sovereignty |

## 3. Questions

- What specific privacy requirements should apply to locally stored records and voice recordings?
- What synchronization performance criteria should be defined when connectivity is restored?
- What additional accessibility requirements should be specified beyond the 112px ergonomic tactile controls and voice interaction?
