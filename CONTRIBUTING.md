# 🎓 Developer & Contributor Guide: Yucu Protocol
### *TecNM Campus Tlaxiaco • Stellar Community Fund • Drips Network*

Welcome to the engineering team of **Yucu Protocol**! 🌿

This project is engineered by computer systems engineering student-researchers and faculty at **Instituto Tecnológico de Tlaxiaco (Oaxaca, Mexico)** in collaboration with the global open-source Web3 ecosystem.

Contributions here deliver real-world impact: validating smallholder harvests, protecting indigenous artisans in the Mixteca Highlands, and contributing to public goods infrastructure funded by **Drips Network** and the **Stellar Community Fund (SCF)**.

---

## 🚀 1. Local Development Setup (In 3 Steps)

### Prerequisites:
- **Node.js 22** (the exact version is in `.nvmrc`; with nvm run `nvm use`).
- **Rust 1.94** with `rustup target add wasm32v1-none` (only if you work on `contracts/`).
- **Git**.

### Step 1: Clone the repository
```bash
git clone https://github.com/Open-Hub-Tec/yucu-protocol.git
cd yucu-protocol
```

### Step 2: Install dependencies
```bash
npm ci
```
`npm ci` installs exactly the versions in `package-lock.json`, the same ones CI uses. Only use `npm install <package>` when you intentionally add a dependency, and commit the updated `package-lock.json`.

### Step 3: Start the local development server
```bash
npm run dev
```

Open your browser at `http://localhost:3000`. You now have Yucu Protocol running locally!

---

## 🧭 2. Finding & Claiming Tasks on GitHub

1. Visit our **GitHub Project Board**:  
   👉 **[https://github.com/orgs/Open-Hub-Tec/projects/1](https://github.com/orgs/Open-Hub-Tec/projects/1)**
2. Explore the **`Todo`** column for the current sprint.
3. Select an issue aligned with your interest (e.g., `#18`, `#19`, `#20`, `#22`, etc.).
4. Comment on the issue: *"Hi! I'm claiming this task for the TecNM research team"* and request assignment from `@josealfredo79`.

---

## 🛠️ 3. Codebase Structure & Areas of Interest

The repository is organized modularly by domain:

| Domain / Specialization | Directory Path | What You Will Work On |
| :--- | :--- | :--- |
| **🎨 Frontend & Mobile UI** | `src/components/` | PWA user interface, tactile buttons, "Modo Abuelo" elder mode, public passport display, and modals. |
| **🗣️ Mixteco Language & Audio** | `src/utils/audioRecorder.ts`<br>`src/core/ai/RaizAIOracles.ts` | 24kbps Opus recording, acoustic normalization, *Tu'un Savi* voice parsing. |
| **🧠 AI Oracles & Verification** | `src/core/ai/RaizAIOracles.ts` | SCAA coffee cupping analysis, Sentinel-2 EUDR satellite anti-deforestation proofs, Gemini multimodal prompts. |
| **🔐 Cryptography & Identity** | `src/core/crypto/`<br>`src/core/auth/` | Canonical SHA-256 Community Digest, Ed25519 signatures, zero-seed physical QR card authentication. |
| **💳 Payments & Escrow** | `src/core/blockchain/TrustlessWorkEscrowAdapter.ts`<br>`src/core/settlement/` | Trustless Work Soroban escrow integration, Etherfuse SPEI off-ramps (Banco del Bienestar) and rural cash rails. |
| **🦀 Smart Contracts in Rust (Soroban)** | `contracts/` | Soroban smart contracts: `lot_passport/`, `perpetual_royalties/`, and the attestation index and rules on top of Attest Protocol (ADR-005). `attestation_registry/` and `fair_escrow/` are practice material only. |

---

## 🌿 4. Git Workflow Guidelines

### 1. Synchronize your local main branch
```bash
git checkout main
git pull origin main
```

### 2. Create a feature branch
Use clear, semantic branch naming including the issue number:
```bash
git checkout -b feature/issue-22-offline-qr-sync
```

### 3. Implement and test your changes
Verify changes as you code:
```bash
npm run test
```

### 4. Commit using Conventional Commits
Write concise, descriptive commit messages in English:
- `feat: add offline sync retry policy in SyncEngine`
- `fix: correct touch target size for microphone in elder mode`
- `docs: update Trustless Work escrow integration guide`

```bash
git add .
git commit -m "feat: implement offline QR sync handler for issue #22"
```

### 5. Push to GitHub
```bash
git push origin feature/issue-22-offline-qr-sync
```

---

## 🎁 5. Submitting Pull Requests & Drips Recognition

1. Open [https://github.com/Open-Hub-Tec/yucu/pulls](https://github.com/Open-Hub-Tec/yucu/pulls) and click **"New Pull Request"**.
2. **Important:** Link the relevant issue in your PR description:
   ```markdown
   Closes #22
   ```
   *(or `Resolves #18`, substituting your actual issue number).*
3. Linking issues enables:
   - Automated CI testing to ensure zero breaking regressions.
   - Project maintainer review and eligibility attribution for Drips funding splits.
4. Maintainers (`@josealfredo79`) will review your code, provide constructive feedback, and merge into `main`.

---

## ✅ 6. Pre-Submission Checklist

Before submitting your PR, execute the full test and lint suite:
```bash
npm run lint && npm run test
```
Ensure all tests pass cleanly with zero errors.

If you touched `contracts/`, also run:
```bash
cd contracts
cargo fmt --all && cargo clippy --locked --all-targets -- -D warnings && cargo test --locked
```

**Simulated results:** if your screen shows a result that does not come from a real source (payments, escrow, certifications, rule-based AI, test login, fixed metrics), add `<DemoBadge />` from `src/components/DemoBadge.tsx` next to its title and update the "real vs. simulated" table in the README.

**Privacy (mandatory for research and UX work):** never commit names of interviewees, student control numbers, audio, video, photos of people or signed PDFs. Publish by role and community (e.g. *"rebozo artisan, Amoltepec"*) and keep evidence in `.investigacion_privada/`. Read [`docs/research/PRIVACIDAD.md`](./docs/research/PRIVACIDAD.md). The CI rejects PRs that add media files to `docs/research/`, `docs/ux-testing/` or `public/videos/`.

`main` is protected: every change goes through a PR with green CI and one approving review from a code owner (see [`.github/CODEOWNERS`](./.github/CODEOWNERS)).

---

## 📚 7. Technical Documentation References

- [MVP Specification — draft (Tlaxiaco)](./docs/MVP_SPECIFICATION.md)
- [System Architecture & Sequence Diagram](./docs/ARCHITECTURE.md)
- [Protocol Specification (Stellar & Soroban)](./docs/PROTOCOL_SPECIFICATION.md)
- [ADR-001: Trustless Work Escrow Adoption](./docs/adr/ADR-001-TRUSTLESS-WORK-ESCROW.md)
- [ADR-002: Offline-First PWA & Zero-Seed Rural Identity Standards](./docs/adr/ADR-002-OFFLINE-FIRST-PWA-AND-RURAL-IDENTITY.md)
- [Documentation Index](./docs/README.md)

---

## 💬 8. Community & Support

- **On Campus:** Computer Systems Laboratory at TecNM Campus Tlaxiaco.
- **On GitHub:** Open an issue or start a thread in *GitHub Discussions*.
- **On Discord:** Stellar Development Community & Open Hub TecNM channels.

*Building community-driven decentralized technology from the Mixteca Highlands to the world!* 🚀
