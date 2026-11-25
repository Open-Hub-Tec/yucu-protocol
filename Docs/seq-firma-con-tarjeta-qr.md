# Sequence diagram: signing with the QR card

This diagram shows how an artisan who has no phone signs with her QR card on the promoter's phone.
The promoter's phone scans the card, prepares the transaction, the artisan types her 6-digit PIN, `CardWalletPort` decrypts the key in memory, signs and discards it, and the signed transaction is sent.
The key is erased at the end, and the money goes to the artisan's own account, never to the promoter, the group or Yucu (AGENTS.md rule 1).
It only draws what the sources define; what is not defined is written as a note below the tables.

![UML sequence diagram of signing with the QR card](img/seq-firma-con-tarjeta-qr.png)

## Elements

| Element | Kind | Source |
| --- | --- | --- |
| `Artisan` | actor (participant) | `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` (D4) |
| `Promoter's phone` | participant | `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` (D4), `src/core/chain/ports.ts` |
| `CardWalletPort` | participant (interface) | `src/core/chain/ports.ts` |
| `EscrowPort` | participant (interface; the port that sends the transaction) | `src/core/chain/ports.ts` |
| `Artisan's own account` | participant | `src/core/chain/ports.ts` (`EscrowMilestone.receiverAddress`), `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` (D8) |
| `show QR card` | message | `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` (D4) |
| `scan card (cardData)` | message to self | `src/core/chain/ports.ts` (comment on `CardWalletPort`) |
| `getAddress(cardData)` | method of `CardWalletPort` | `src/core/chain/ports.ts` |
| `address (key not decrypted)` | return message | `src/core/chain/ports.ts` |
| `prepareRelease(escrowId, milestoneIndex, releaseSignerAddress)` | method of `EscrowPort` | `src/core/chain/ports.ts` |
| `UnsignedTransaction` | return message (interface) | `src/core/chain/ports.ts` |
| `show summary` | message | `src/core/chain/ports.ts` (`UnsignedTransaction.summary`) |
| `type 6-digit PIN` | message | `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` (D4) |
| `sign(tx, pin, cardData)` | method of `CardWalletPort` | `src/core/chain/ports.ts` |
| `decrypt key in memory` | message to self | `src/core/chain/ports.ts` |
| `sign` | message to self | `src/core/chain/ports.ts` |
| `discard key` | message to self | `src/core/chain/ports.ts` |
| `alt` `[valid PIN and valid card]` | fragment guard | `src/core/chain/ports.ts` |
| `signedXdr` | return message | `src/core/chain/ports.ts` |
| `[invalid PIN or invalid card]` | fragment guard | `src/core/chain/ports.ts` |
| `fails` | return message | `src/core/chain/ports.ts` |
| `submit(signedXdr)` | method of `EscrowPort` | `src/core/chain/ports.ts` |
| `ChainReceipt` | return message (interface) | `src/core/chain/ports.ts` |
| `milestone payment to receiverAddress` | message | `src/core/chain/ports.ts`, `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` (D8) |
| `Key erased. Nothing from the card or the key stays on this phone.` | note | `src/core/chain/ports.ts`, `AGENTS.md` (rule 1) |
| `Money goes to the artisan's own account. Never to the promoter, the group or Yucu.` | note | `AGENTS.md` (rule 1), `docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md` (D8, D10) |

## What the sources say, step by step

- **Pattern:** prepare → sign on the phone → send (`AGENTS.md`, rule 1). Steps 3–6 prepare, steps 7–13 sign, the last steps send.
- **Public address first:** `CardWalletPort.getAddress(cardData)` returns the public address "without decrypting the key", so the transaction can be prepared.
- **Signing:** `CardWalletPort.sign(tx, pin, cardData)` decrypts in memory with the PIN, signs and discards the key. It fails with an invalid PIN or an invalid card.
- **Key erased:** ADR-004 (D4) says the key is erased from the promoter's phone when finished and is never kept on another person's phone. `ports.ts` says nothing of the card or the key is stored on that phone.
- **Money:** in `EscrowMilestone`, the receiver of each milestone is the artisan's account. ADR-004 (D8) says the artisan only releases toward her own account and the contract does not allow changing the receiver. ADR-004 (D10) says the group never receives sales money.

## Notes (not defined in the sources, so not drawn)

- **Which operation is signed.** The sources do not say which operation the artisan signs with the card. The diagram uses the release of an escrow milestone (`EscrowPort`) because its comments say the money goes to the artisan's own account. `PayoutPort` (`CashoutRequest` with `walletKind: 'card'`) and `LotRegistryPort` use the same prepare → sign → submit pattern; they are not drawn.
- **Who pays.** The escrow contract moves the money; the port only prepares and submits the transaction. The last message is drawn as a consequence of `submit`, not as a method of `EscrowPort`.
- **Scanning and PIN entry.** `ports.ts` and ADR-004 say the promoter's phone scans the card and the artisan types the PIN, but not which screen or component does it. No such component was found in the sources.
- **Summary.** `UnsignedTransaction.summary` is defined as plain-language text of what the person is about to sign. How and where it is shown is not defined.
- **`ArtisanQrTagModal.tsx` is a different QR.** It prints a lot authenticity tag whose QR links to `/?cert=<code>`. It is not the signing card, it holds no key and it has no signing step, so it does not appear in the diagram.
- **Failure path.** The sources only say that `sign` fails; what the promoter's phone does next is not defined.

## Sources

- [`docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md`](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) — D4 (key in the QR card, 6-digit PIN, key erased), D8 (receiver and release signer), D10.
- [`src/core/chain/ports.ts`](../../src/core/chain/ports.ts) — `CardWalletPort`, `EscrowPort`, `UnsignedTransaction`, `ChainReceipt`, `EscrowMilestone`.
- [`src/components/ArtisanQrTagModal.tsx`](../../src/components/ArtisanQrTagModal.tsx) — read to check it; it is the lot tag QR, not the signing card.
- [`AGENTS.md`](../../AGENTS.md) — rule 1: non-custodial, prepare → sign on the phone → send.
