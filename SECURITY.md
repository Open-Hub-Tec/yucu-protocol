# Security policy

Yucu is a **prototype on Stellar testnet**. The contracts have not been audited and no real funds are handled. Even so, we want to hear about any weakness, especially in the parts that will handle keys and money later.

## Reporting a vulnerability

**Do not open a public issue.** Report it privately through GitHub:

1. Go to the [Security tab](https://github.com/Open-Hub-Tec/yucu-protocol/security) of this repository.
2. Click **Report a vulnerability** and describe the problem, the affected files or contracts, and how to reproduce it.

The maintainers will acknowledge the report within 7 days and keep you informed until it is fixed. There is no bug bounty at this time.

## What matters most

Reports about these areas are the most valuable, because they break the project's core rules ([`AGENTS.md`](./AGENTS.md)):

* **Custody:** any path where the server could generate, receive, store or derive a user's private key, or hold funds ([ADR-003](./docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md)).
* **Signing:** a transaction that someone other than its owner could sign, or the QR card key surviving after use.
* **Soroban contracts** in [`contracts/`](./contracts/): authorization, royalty and Tequio splits, upgrades.
* **Personal data:** names, phone numbers, IDs or exact locations of artisans or buyers reaching the chain, logs or the public repository ([`PRIVACIDAD.md`](./docs/research/PRIVACIDAD.md)).
* **Secrets:** API keys or Stellar secret keys (`S…`) committed to the repository.

## If you find a secret in the repository

Report it privately as above. Do not use it. Committed keys are treated as compromised and rotated.

## Supported versions

Only the `main` branch is supported. Contracts deployed on testnet (see [`testnet.json`](./contracts/deployments/testnet.json)) may be redeployed at any time.
