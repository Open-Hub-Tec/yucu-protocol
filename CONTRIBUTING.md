# 🎓 Developer & Contributor Guide: Yucu Protocol
### *TecNM Campus Tlaxiaco • Stellar Community Fund • Drips Network*

Welcome to the engineering team of **Yucu Protocol**! 🌿

This project is engineered by computer systems engineering student-researchers and faculty at **Instituto Tecnológico de Tlaxiaco (Oaxaca, Mexico)** in collaboration with the global open-source Web3 ecosystem.

Contributions here deliver real-world impact: validating smallholder harvests, protecting indigenous artisans in the Mixteca Highlands, and contributing to public goods infrastructure funded by **Drips Network** and the **Stellar Community Fund (SCF)**.

---

## 🚀 1. Local Development Setup

### Option A: nothing to install (GitHub Codespaces)
On the repo page, click **Code → Codespaces → Create codespace on main**. In a few minutes you get VS Code in the browser with Node 22 and `npm ci` already done. To work on `contracts/`, use **Code → Codespaces → ⋯ → New with options** and choose the "Yucu (contratos Soroban)" configuration, which adds Rust 1.94 and `wasm32v1-none`. The same configuration works in local VS Code with the *Dev Containers* extension. Then jump to Step 3.

### Option B: your own computer

#### Prerequisites:
- **Node.js 22** (the exact version is in `.nvmrc`). Older versions fail: `npm test` says *Could not find 'src/tests/\*\*/\*.test.ts'*.
- **Rust 1.94** with `rustup target add wasm32v1-none` (only if you work on `contracts/`).
- **Git**.

#### On Ubuntu or WSL (Windows)
The `nodejs` package from `apt` is too old; install Node 22 with nvm:
```bash
sudo apt update && sudo apt install -y git curl build-essential
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22 && nvm alias default 22
```
Only if you work on `contracts/`:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.94.0
source ~/.cargo/env
rustup target add wasm32v1-none && rustup component add rustfmt clippy
```
On WSL, clone inside Linux (`~/…`), not under `/mnt/c/…`: it is much faster and symlinks work. On Windows without WSL, run `git config --global core.symlinks true` (with Developer Mode on) before cloning.

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
Verify changes as you code. Tests are any `src/tests/**/*.test.ts` file and run automatically; do not edit the `test` script in `package.json`. ESLint flags new `any`, `@ts-ignore` and forbidden imports in your editor.
```bash
npm run lint    # TypeScript and ESLint
npm test        # all tests
npm run build   # production build
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

1. Open [https://github.com/Open-Hub-Tec/yucu-protocol/pulls](https://github.com/Open-Hub-Tec/yucu-protocol/pulls) and click **"New Pull Request"**.
2. **Important:** Link the relevant issue in your PR description:
   ```markdown
   Closes #22
   ```
   *(or `Resolves #18`, substituting your actual issue number).*
3. Linking issues enables:
   - Automated CI testing to ensure zero breaking regressions.
   - Project maintainer review. If the issue is part of a Drips Wave, Drips pays the reward directly to you; nobody else takes a share (see [`docs/drips/FUNDING_POLICY.md`](docs/drips/FUNDING_POLICY.md)).
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
