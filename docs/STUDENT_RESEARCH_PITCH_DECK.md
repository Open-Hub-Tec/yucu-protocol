> **Presentación histórica (octubre de 2026). Algunas diapositivas describen un diseño anterior.** La arquitectura vigente está en [ADR-005](./adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) (atestaciones sobre Attest Protocol; `attestation_registry` es solo material de práctica) y [ADR-007](./adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) (motor de voz: la IA prepara, la persona firma; ningún oráculo emite ni certifica). Donde este documento los contradiga, mandan los ADR.

# 📽️ Official Slide Deck: Yucu Protocol & TecNM Research Brigades
### *Decentralized RWA Attestation, AI Oracles & Smart Escrow Infrastructure on Stellar Soroban*

* **Academic Institution:** Instituto Tecnológico de Tlaxiaco (TecNM - Oaxaca, Mexico)
* **Academic Program:** Computer Systems Engineering | Faculty Advisor: Prof. José Alfredo Román Cruz
* **Generated PowerPoint Files (16:9 Widescreen):**  
  * 🇬🇧 [`public/Raiz_Protocol_Stellar_PitchDeck.pptx`](../public/Raiz_Protocol_Stellar_PitchDeck.pptx)
  * 🇪🇸 [`public/Raiz_Protocol_Presentacion_Oficial.pptx`](../public/Raiz_Protocol_Presentacion_Oficial.pptx)

---

## 📑 Slide Deck Table of Contents (14 Slides in 16:9 Format)

1. [Slide 1: Institutional Title Slide](#slide-1-institutional-title-slide)
2. [Slide 2: The Crisis of Rural Value Extraction in Oaxaca](#slide-2-the-crisis-of-rural-value-extraction)
3. [Slide 3: Empirical Field Research Audit (Value Chain: Before vs. After)](#slide-3-empirical-field-research-audit)
4. [Slide 3B: Student Research Brigades: Ground-Truth Field Cases](#slide-3b-student-research-brigades-ground-truth-cases)
5. [Slide 3C: Elder-Accessibility UX Usability Field Audit (Milestone 1.2)](#slide-3c-elder-accessibility-ux-usability-field-audit)
6. [Slide 4: The Missing Infrastructure Primitive in Stellar](#slide-4-the-missing-infrastructure-primitive-in-stellar)
7. [Slide 5: Soroban Smart Contract Architecture](#slide-5-soroban-smart-contract-architecture)
8. [Slide 6: The Centaur Co-Validation Model (AI + Community Validator)](#slide-6-the-centaur-co-validation-model)
9. [Slide 7: The Physical Anchor: Digital Lot Passport & QR Hang-Tag](#slide-7-the-physical-anchor-digital-lot-passport-and-qr-hang-tag)
10. [Slide 8: Invisible Web3 & Last-Mile On-Parcel Payouts](#slide-8-invisible-web3-and-last-mile-payouts)
11. [Slide 9: Sustainable B2B2C Business Model](#slide-9-sustainable-b2b2c-business-model)
12. [Slide 10: Production Engineering Traction: Code, Tests & University Backing](#slide-10-production-engineering-traction)
13. [Slide 10B: The Human Team: Indigenous Talent & TecNM Engineering](#slide-10b-the-human-team-indigenous-talent-and-tecnm-engineering)
14. [Slide 11: Strategic Proposal for Drips Network & Stellar Community Fund](#slide-11-strategic-proposal-for-drips-and-scf)

---

### Slide 1: Institutional Title Slide
* **Title:** RAÍZ PROTOCOL
* **Subtitle:** *Decentralized RWA Attestation & Fair Smart Escrow Infrastructure on Stellar Soroban*
* **Institution:** Open Hub TecNM · Instituto Tecnológico de Tlaxiaco (Oaxaca, Mexico)
* **Leadership:** Faculty Lead: Prof. José Alfredo Román Cruz · Student Lead: Nallely López García
* **Ecosystem:** Stellar Development Foundation / Soroban / Drips Network / Tech Rebel

---

### Slide 2: The Crisis of Rural Value Extraction
* **Structural Pains Documented in Oaxaca:**
  1. **Middlemen Monopoly (*Coyotaje*):** Intermediaries capture up to 93% of resale margins exploiting lack of transport and bank accounts.
  2. **Zero Parcel Connectivity:** Coffee and artisan mountain communities lack 3G/4G coverage. Traditional apps fail completely.
  3. **Counterfeiting & Cultural Misappropriation:** Factory knockoffs and adulterated spirits misappropriate indigenous identity without returning value to communities.

---

### Slide 3: Empirical Field Research Audit (Value Chain)
* **Findings from 50 Producer Audits Across 4 Communities:**
  * **Master Triqui Huipil (San José Xochixtlán):** Weaver retains 7% ($1,200-$1,500 MXN) after 9 months of labor. Middlemen resell at $18,000 MXN in high-end galleries.
  * **Specialty Coffee (Yucuhiti / Tlaxiaco):** Producer receives 18% at roadside weigh scales ($35 MXN/kg). Middlemen resell at $180-$250 MXN/kg.
  * **Traditional Mezcal (Yautepec / Tlaxiaco):** Genuine ancestral mezcal at $340 MXN/L faces unfair competition from $50 MXN/L adulterated alcohol.
  * **Palm Crafts (San Juan Mixtepec):** Weavers earn $1.00 to $2.00 MXN per hour ($15 to $30 MXN per 15-hr piece). Urban retail markup is +1000% ($150-$300 MXN).
* **Yucu Solution:** 98% direct net payout to producer family, 2% collective infrastructure fund (*Tequio*).

---

### Slide 3B: Student Research Brigades: Ground-Truth Cases
* **Brigade 1 – San Juan Mixtepec (Palm Weavers):**
  * **Student Researchers:** Jazlynn Barrios Velasco, Isaías Brayan López Domínguez, Rafael Ayala Coronel, Alex Antonio Victoria Vásquez – 7th Semester.
  * **Field Finding:** 15 hours of intense manual labor per hat. Middlemen pay $15 to $30 MXN. Weavers suffer premature cataracts and joint deformities with zero social security.
  * **Direct Quote:** *“They tell us: ‘Take $20 pesos or leave it’... we take it just to buy tortillas for today.”*
* **Brigada 2 – San José Xochixtlán (Triqui Huipil):**
  * **Student Researchers:** Charlie Jared Castro Rodríguez, Dulce Maetzy Reyes Hernández, Brayan Armando Pérez González, José Manuel Hernández Paz – 5th Semester.
  * **Field Finding:** A Triqui weaver from Xochixtlán (56) spends 6 to 9 months continuous weaving (~180 hrs) and finances $2,500 MXN of materials out of pocket. Buyers delay payment for weeks and haggle down to $8,000 MXN.
  * **Direct Quote:** *“Clients commission a huipil and force me to wait weeks or months to get paid.”*
* **Brigade 3 – San Juan Ñumí (Wild Honey Union):**
  * **Student Researchers:** Luis Alexis Morales & eduScrum / UMIZOOMI Team.
  * **Field Finding:** Interview with Union President Rogelio Martínez Cruz: All records are kept by hand in notebooks. Transcribing member lists takes 3 days; harvest slips are frequently misplaced; batches were accidentally double-sold due to lack of real-time digital inventory.
* **Brigade 4 – San Pablo Tijaltepec & Yucuhiti (Coffee & Textiles):**
  * **Student Lead:** Nallely López García.
  * **Field Finding:** An embroiderer from San Pablo Tijaltepec immediately recognized the physical Hang-Tag QR code as legal proof to protect authentic deer blouses against cheap factory knockoffs.

---

### Slide 3C: Elder-Accessibility UX Usability Field Audit (Milestone 1.2)
* **Field Diagnosis (Testing with a Triqui weaver and an embroiderer from San Pablo Tijaltepec):**
  1. **Rural Technophobia:** Hesitation exceeding 10 seconds before touchscreens: *“Will the phone break if I tap this?”*.
  2. **Harsh Outdoor Glare:** Delicate gray typography is completely illegible in open patios under mountain sun.
  3. **Government Seal Suspicion:** Official badges caused alarm (*“Is this for tax collection?”*). Cultural protection marks are needed.
* **Yucu Engineering Solution ("Elder Mode"):**
  * **112px Giant Tactile Touch-Targets** for fingers with agricultural calluses or arthritis.
  * **Spoken Voice in Mixtec (*Tu'un Savi*)** and Spanish at 24kbps Opus via Web Audio API (Zero-Typing Principle).
  * **100% Offline-First IndexedDB Buffer** ensuring zero data loss on mountain parcels.
* **Validated Field Result:** 100% task completion without assistance; QR code understood in 6 to 9 seconds.

---

### Slide 4: The Missing Infrastructure Primitive in Stellar
* **The Gap:** Stellar excels at payments and asset transfers, but lacked a decentralized **Real-World Asset (RWA) attestation layer** to cryptographically verify origin before token issuance.
* **The 4 Autonomous AI Oracles:**
  1. `AIVoiceOracle`: Acoustic and semantic normalization of indigenous dialects (*Tu'un Savi* / Zapotec).
  2. `AIQualityOracle`: SCAA export quality scoring (>85 specialty grade) and master artisan validation.
  3. `AIEUDRSatelliteOracle`: Sentinel-2 multispectral geofencing for European Union anti-deforestation compliance.
  4. `TrustlessWorkEscrowAdapter`: Milestone smart contract escrow orchestration on Soroban.

---

### Slide 5: Soroban Smart Contract Architecture
* Rust smart contracts compiled for Soroban Protocol 22:
  * `attestation_registry.rs`: Schema registry and decentralized on-chain claim verification.
  * `lot_passport.rs`: Immutable lot passport binding community metadata, coordinates, and photo hashes.
  * `perpetual_royalties.rs`: Automated 8% secondary market royalty to female artisans on every resale.
  * `TrustlessWorkEscrowAdapter.ts`: Standardized escrow disbursing 30% advance on origin attestation and 70% upon verified physical delivery.

---

### Slide 6: The Centaur Co-Validation Model (AI + Human)
* **AI Speed + Community Authority:** Multimodal AI parses photos and voice in milliseconds, while physical delivery is co-signed by the municipal cooperative or student resident.
* **Tamper-Proof Fraud Prevention:** Once the canonical SHA-256 Community Digest is anchored on Stellar, no single party can forge or retroactively modify the audit trail.

---

### Slide 7: The Physical Anchor: Digital Lot Passport & QR Hang-Tag
* **ISO/IEC 18004 Vector Hang-Tags:** Generated directly as lightweight SVG vectors ready for printing on kraft paper or fabric tags.
* **Zero App Installation for Buyers:** Coffee roasters and boutique clients scan the tag with any standard smartphone to inspect cupping scores, indigenous audio, and on-chain Stellar transaction hashes.

---

### Slide 8: Invisible Web3 & Last-Mile On-Parcel Payouts
* **Invisible Web3:** Smallholders never deal with 24-word English seed phrases or transaction fees (sponsored via Stellar Fee-Bump SEP-0015).
* **Etherfuse Fiat Rails:** Atomic conversion USDC -> MXNe -> Banxico SPEI directly into Banco del Bienestar and rural credit union accounts.

---

### Slide 9: Sustainable B2B2C Business Model
* **Institutional Buyer Fees:** B2B roasters and international importers pay for verified traceability passports and EUDR compliance certificates (0% cost to smallholders).
* **Community Sustainability:** Every purchase order contributes 2% to the collective infrastructure *Tequio* fund and maintenance of the TecNM student innovation node.

---

### Slide 10: Production Engineering Traction
* **34+ Automated CI Tests (100% Green):** Cryptography, Soroban smart contracts, AI oracles, and Trustless Work adapter.
* **100% MIT Open Source:** Public active repository at [github.com/Open-Hub-Tec/yucu](https://github.com/Open-Hub-Tec/yucu).
* **Institutional Backing:** Powered by TecNM, educating over 40% of Mexico's engineering workforce.

---

### Slide 10B: The Human Team: Indigenous Talent & TecNM Engineering
* **Faculty & Project Leadership:**
  * Prof. José Alfredo Román Cruz (Academic Advisor & Open Hub Coordinator).
  * Nallely López García (Student Research Lead).
* **Undergraduate Student Research Brigades:**
  * **San Juan Mixtepec (Palm Weavers):** Jazlynn Barrios Velasco, Isaías Brayan López Domínguez, Rafael Ayala Coronel, Alex Antonio Victoria Vásquez – 7th Semester.
  * **San José Xochixtlán (Triqui Huipil):** Charlie Jared Castro Rodríguez, Dulce Maetzy Reyes Hernández, Brayan Armando Pérez González, José Manuel Hernández Paz – 5th Semester.
  * **San Juan Ñumí (Honey Union):** Luis Alexis Morales & eduScrum / UMIZOOMI Team.
  * **Traditional Mezcal (Yavi Tech):** Lewis Noé Hernández Mendoza, Nelson Macario Martínez Hernández, Luis Ángel García Santiago – 5th Semester.

---

### Slide 11: Strategic Proposal for Drips Network & SCF
* **Student-Researcher Funding Pipeline:** Drips Wave and Stellar Community Fund grants disburse directly to student-researchers via `drips.config.json` automated splits.
* **Open Source Public Good:** Training a permanent cohort of Mexican Rust and Stellar engineers building decentralized technology from the Mixteca Highlands for the world.
