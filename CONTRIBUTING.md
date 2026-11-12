# Contributing to Yucu Protocol

Yucu is an open-source prototype on Stellar testnet, built by students of the Instituto Tecnológico de Tlaxiaco (TecNM) as part of their courses.

> **Code contributions are reserved for TecNM Campus Tlaxiaco students.** Every issue, including `good first issue` and `drips-eligible`, is course work. Pull requests from outside the course are closed without merging, whatever their quality. Bug reports, questions and field feedback from anyone are welcome as issues.

Before you write code, read [`AGENTS.md`](./AGENTS.md). Its rules apply to people and AI assistants alike, and the CI checks several of them automatically. By taking part you agree to the [Code of conduct](./CODE_OF_CONDUCT.md).

---

## 1. Pick an issue

There are two kinds of issues, both for TecNM Campus Tlaxiaco students:

| Kind | How to recognize it | Who can take it |
|---|---|---|
| **Module issues** | `[W…]` issues with a `modulo: …` label. Stay in one module to become its expert; see [#152](https://github.com/Open-Hub-Tec/yucu-protocol/issues/152) for the order. New here? Start with a [`good first issue`](https://github.com/Open-Hub-Tec/yucu-protocol/labels/good%20first%20issue) | Students, after the instructor assigns them |
| **Course deliverables** | Label [`tecnm-sprint-4`](https://github.com/Open-Hub-Tec/yucu-protocol/labels/tecnm-sprint-4) | Only the assigned team |

1. Comment on the issue asking to be assigned. **Wait for the assignment before you start**: one person or team per issue.
2. Read the issue's acceptance criteria and the ADRs it links to.

Issues labeled `drips-eligible` may be recognized through [Drips Wave](https://www.drips.network/wave) when the repository takes part in an active Wave. There is no guaranteed reward. If there is one, Drips pays it directly to you and nobody else takes a share: see the [funding policy](./docs/drips/FUNDING_POLICY.md).

---

## 2. Set up

**Nothing to install (GitHub Codespaces).** On the repo page, click **Code → Codespaces → Create codespace on main**: you get VS Code in the browser with Node 22 and `npm ci` already done. For `contracts/`, use **⋯ → New with options** and choose "Yucu (contratos Soroban)", which adds Rust 1.94 and `wasm32v1-none`. The same configuration works in local VS Code with the *Dev Containers* extension.

**On your own computer**, you need **Node 22** ([`.nvmrc`](./.nvmrc)) and Git. Rust 1.94 with `rustup target add wasm32v1-none` is only needed for [`contracts/`](./contracts/). On Ubuntu or WSL, the `nodejs` package from `apt` is too old: install Node 22 with nvm (step-by-step commands in [`AGENTS.md`](./AGENTS.md#comandos-deben-pasar-antes-de-abrir-un-pr)). On WSL, clone inside Linux (`~/…`), not under `/mnt/c/…`. If `npm test` says *Could not find 'src/tests/\*\*/\*.test.ts'*, you are on an old Node: run `nvm use 22`.

```bash
git clone https://github.com/Open-Hub-Tec/yucu-protocol.git   # or your fork
cd yucu-protocol
nvm use
npm ci          # exact versions from package-lock.json, same as CI
npm run dev     # http://localhost:3000
```

Use `npm install <package>` only when you intentionally add a dependency, and explain why in the PR.

---

## 3. Work on a branch

```bash
git checkout main && git pull origin main
git checkout -b feat/issue-112-payout-port     # or fix/issue-<n>-<topic>
```

* Keep changes small and focused on the issue. Do not reformat unrelated files.
* Add a **positive and a negative test** for every new rule. Any `src/tests/**/*.test.ts` file runs automatically; do not edit the `test` script in `package.json`.
* ESLint flags a new `any`, `@ts-ignore` or a forbidden import in a screen while you type. Do not add new entries to `eslint-suppressions.json`.
* Write commit messages in the [Conventional Commits](https://www.conventionalcommits.org/) style, for example `feat(chain): add PayoutPort with simulated version`.

Before opening the PR, all of these must pass:

```bash
npm run lint     # TypeScript and ESLint, no errors
npm test         # tests
npm run build    # production build

# Only if you changed contracts/
cd contracts
cargo fmt --all
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
```

---

## 4. Open the pull request

1. Open a PR against `main` and write **`Resolves #<issue number>`** in the description.
2. Explain how you tested it.
3. Two bots comment on your PR within a minute:
   * **Code rules check** verifies the fixed rules of `AGENTS.md`: tests included, screens only talk to the ports, no new `any` or `@ts-ignore`, no secrets or personal data.
   * **Validar entregas** checks course deliverables in `docs/gestion/` (in Spanish, for TecNM students).

   If a bot shows ❌, fix it on the same branch: it checks again on every push.
4. A maintainer reviews it. **Be ready to explain your code**: a PR you cannot explain is not merged, even if it works. AI-generated code is welcome only when it is tested and you understand it.

`main` is protected: every change needs green CI and an approving review from a code owner ([`CODEOWNERS`](./.github/CODEOWNERS)).

---

## 5. Rules you must not break

These are summarized from [`AGENTS.md`](./AGENTS.md):

* **Non-custodial.** The server never generates, receives or stores private keys, and never holds funds. Pattern: prepare → sign on the phone → submit.
* **Nothing fake.** Simulated results only come from `SimulatedChain.ts`, carry `source: 'simulated'` and show `<DemoBadge />`.
* **Screens only use the ports** in `src/core/chain/`. No component imports `@stellar/stellar-sdk` or calls Trustless Work, Attest Protocol or an AI provider directly.
* **Privacy.** Never commit names of interviewees, student control numbers, phone numbers, audio, video, photos of people or signed PDFs ([`PRIVACIDAD.md`](./docs/research/PRIVACIDAD.md)). CI rejects media files in `docs/research/`, `docs/ux-testing/`, `public/videos/` and `docs/gestion/`.
* **No secrets** (`S…` keys, `GEMINI_API_KEY`) in code, tests or logs. They go in `.env`.
* **Percentages** come only from [`src/config/protocolFees.ts`](./src/config/protocolFees.ts).
* **Do not overclaim.** No "in production", "audited" or "official certification".

Security problems are reported privately: see [`SECURITY.md`](./SECURITY.md).

---

## 6. Where to read more

* [`README.md`](./README.md): what Yucu is, its status and roadmap.
* [`docs/arquitectura/`](./docs/arquitectura/README.md): diagrams, front-end, server and database guides.
* [`docs/adr/`](./docs/adr/): architecture decisions. Read the ones your issue mentions.
* [`skills/`](./skills/): guides for contracts, attestations, offline PWA and Git.
* Questions: comment on the issue you are working on.
