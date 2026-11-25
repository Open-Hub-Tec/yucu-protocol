# Wallet ports — UML class diagram

This diagram documents the three wallet-port interfaces defined by Yucu Protocol and their exact method signatures.
`WalletPort` is a TypeScript union of `DeviceWalletPort`, `CardWalletPort`, and `ExternalWalletPort`—it is **not** a superclass or UML inheritance hierarchy.
`WalletKind` is a string-literal type alias that discriminates the three interfaces; `UnsignedTransaction` is the shared input to their `sign` methods.
No port interface exposes a private-key field or returns a raw private key, and the Yucu server must not hold user private keys.

![UML class diagram of Yucu wallet ports](img/clases-billeteras.png)

## Elements

| Element (exact label shown) | Kind | Description |
| --- | --- | --- |
| <code>WalletKind</code> | Type alias | `'device' | 'card' | 'external'` |
| <code>WalletPort</code> | Union type | `DeviceWalletPort | CardWalletPort | ExternalWalletPort` |
| <code>UnsignedTransaction</code> | Interface | Prepared, unsigned transaction; see fields below. |
| <code>xdr: string</code> | Field of UnsignedTransaction | Unsigned transaction XDR. |
| <code>networkPassphrase: string</code> | Field of UnsignedTransaction | Network identifier used during signing. |
| <code>summary: string</code> | Field of UnsignedTransaction | Human-readable summary of the transaction to sign. |
| <code>DeviceWalletPort</code> | Interface | Device-held wallet contract (`kind: device`). |
| <code>readonly kind: 'device'</code> | Discriminant | Literal kind of DeviceWalletPort. |
| <code>hasAccount(): Promise&lt;boolean&gt;</code> | DeviceWalletPort method | Checks for an existing device account. |
| <code>createAccount(pin: string): Promise&lt;{ address: string; recoveryCard: string }&gt;</code> | DeviceWalletPort method | Creates local account; returns address and recovery-card data. |
| <code>getAddress(): Promise&lt;string &#124; null&gt;</code> | DeviceWalletPort method | Returns public address or null. |
| <code>sign(tx: UnsignedTransaction, pin: string): Promise&lt;string&gt;</code> | DeviceWalletPort method | Signs prepared transaction using the PIN. |
| <code>restoreAccount(recoveryCard: string, newPin: string): Promise&lt;{ address: string }&gt;</code> | DeviceWalletPort method | Restores local account from recovery card and new PIN. |
| <code>CardWalletPort</code> | Interface | QR-card signing contract (`kind: card`). |
| <code>readonly kind: 'card'</code> | Discriminant | Literal kind of CardWalletPort. |
| <code>createCard(pin: string): Promise&lt;{ address: string; cardData: string }&gt;</code> | CardWalletPort method | Creates QR-card account data and address. |
| <code>getAddress(cardData: string): Promise&lt;string&gt;</code> | CardWalletPort method | Obtains public address without exposing key. |
| <code>sign(tx: UnsignedTransaction, pin: string, cardData: string): Promise&lt;string&gt;</code> | CardWalletPort method | Signs using decrypted card data transiently. |
| <code>ExternalWalletPort</code> | Interface | User-owned external wallet contract (`kind: external`). |
| <code>readonly kind: 'external'</code> | Discriminant | Literal kind of ExternalWalletPort. |
| <code>isAvailable(): Promise&lt;boolean&gt;</code> | ExternalWalletPort method | Checks external wallet availability. |
| <code>connect(): Promise&lt;{ address: string }&gt;</code> | ExternalWalletPort method | Requests connection and returns public address. |
| <code>getAddress(): Promise&lt;string &#124; null&gt;</code> | ExternalWalletPort method | Returns public address or null. |
| <code>sign(tx: UnsignedTransaction): Promise&lt;string&gt;</code> | ExternalWalletPort method | Requests signing through external wallet. |


## Relationships and security note

- **Union membership (dashed connectors):** `WalletPort` accepts exactly one of the three port interfaces. The dashed connectors represent TypeScript union alternatives, **not** generalization or inheritance.
- **Discriminant:** each interface declares its own `readonly kind` literal, which is one of the values of `WalletKind`.
- **Transaction input:** the `sign` methods use `UnsignedTransaction`, whose fields appear above.
- **Non-custodial boundary:** `DeviceWalletPort` signs on-device; `CardWalletPort` uses encrypted QR-card data in transient memory; `ExternalWalletPort` delegates signing to the user's external wallet. Neither the port method signatures nor the Yucu server expose users' raw private keys.
- **Modeling scope:** the type aliases are shown as UML annotations; no invented class hierarchy, methods, blockchain hashes, audit status, or production status are implied.

## Sources

- [`src/core/chain/ports.ts`](../../src/core/chain/ports.ts) — exact TypeScript declarations and method signatures.
- [`docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md`](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) — key custody and wallet behavior (notably D4 and D7).
- [`AGENTS.md`](../../AGENTS.md) — rule 1: non-custodial handling of user private keys.
