# Use case diagram: buyer

This diagram shows what a buyer does in Yucu: see the catalog, check a passport, buy and pay.
The actor is the Buyer, and each action the buyer can take in `BuyerShowcaseScreen.tsx` and `CartModal.tsx` is one use case inside the Yucu system boundary.
It only draws what the sources define; what is not defined is written as a note below the tables.

![UML use case diagram of the Yucu buyer](img/casos-de-uso-comprador.png)

## Elements

| Element (exact label shown) | Kind | Description |
| --- | --- | --- |
| <code>Buyer</code> | Actor | Person who browses the showcase and buys. |
| <code>Yucu</code> | System boundary | The app that contains all the use cases. |
| <code>View catalog</code> | Use case | See the product cards of the showcase. |
| <code>Search and filter products</code> | Use case | Narrow the catalog by text, product type or municipality. |
| <code>Buy by voice</code> | Use case | Say a buy or search command with the microphone button. |
| <code>View product details</code> | Use case | Open the detail modal of a product. |
| <code>Check passport</code> | Use case | Open the digital passport of a product. |
| <code>Buy</code> | Use case | Add a product to the cart and open the cart modal. |
| <code>Choose payment method</code> | Use case | Pick `spei`, `efectivo` or `escrow` in the cart modal. |
| <code>Pay</code> | Use case | Confirm the order and get the receipt. |
| <code>Agree purchase on WhatsApp</code> | Use case | Open a WhatsApp message to agree payment and delivery. |
| <code>Request custom piece</code> | Use case | Ask for a special piece or wholesale order. |

## Use cases

| Use case | Short description | Real or simulated today |
| --- | --- | --- |
| View catalog | Product grid with price, artisan, location and stock (`BuyerShowcaseScreen`). | Real screen, simulated data: the products come from `INITIAL_PRODUCTS` in `src/data/mockData`, loaded in `App.tsx`. |
| Search and filter products | Search box, category pills and municipality pills filter the list in the browser. | Real. |
| Buy by voice | `Comprar por Voz` records speech; `handleVoiceCommand` matches keywords to filter, search or open the order. | Real in the browser (microphone and keyword matching). |
| View product details | Card image, title and `Detalles` open `ProductDetailModal`. | Real. |
| Check passport | `Ver Pasaporte Digital y Sello Criptográfico Stellar` calls `onViewPassport` and opens the `pasaporte_digital` screen. | Real navigation; the Stellar certification and seal shown there are a demonstration (`DemoBadge` in `DigitalPassportScreen.tsx`). |
| Buy | `Comprar Directo` calls `onAddToCart(item, true)`, which adds the item and opens `CartModal`. | Real. |
| Choose payment method | The buyer selects `spei`, `efectivo` or `escrow`. `spei` is preselected. | Selection is real; no payment is processed by it. |
| Pay | `Pagar y Confirmar Pedido` runs `handleExecutePayment` and shows the receipt. | Simulated: the folio, `stellarTxLedger` and `stellarTxHash` are generated with `Math.random()`, and `CartModal.tsx` makes no call to the network. |
| Agree purchase on WhatsApp | Link to `api.whatsapp.com` with a prefilled message, in the card and in the cart. | Real link; agreement and payment happen outside Yucu. |
| Request custom piece | `Solicitar pieza especial` calls `onDirectContact('Taller Comunitario', 'Pieza especial o mayoreo')`. | The button is real; what `onDirectContact` does is not defined in these sources. |

## Notes

- The `escrow` option is labeled `Custodia Escrow Stellar (Protegido)` in `CartModal.tsx`, but the component only stores that label in the receipt. ADR-003 (D2) says escrow purchases will use Trustless Work, and the `EscrowPort` real implementation is Trustless Work API; today it is `SimulatedChain` (section 3).
- ADR-003 (section 3) says an invented hash or ledger number is forbidden outside `SimulatedChain`, and that simulated results must show `<DemoBadge />`. `CartModal.tsx` generates `stellarTxHash` and `stellarTxLedger` itself and does not show `DemoBadge`, so the `Pay` use case does not match that rule yet.
- ADR-003 (D1) says Yucu never holds the buyer's keys or funds. This diagram does not draw wallet or signing steps because `CartModal.tsx` has none.

## Sources

- [`src/components/BuyerShowcaseScreen.tsx`](../../src/components/BuyerShowcaseScreen.tsx)
- [`src/components/CartModal.tsx`](../../src/components/CartModal.tsx)
- [`docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md`](../adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md)
- Also read to classify real or simulated: `src/components/ProductDetailModal.tsx`, `src/components/DigitalPassportScreen.tsx`, `src/App.tsx`.
