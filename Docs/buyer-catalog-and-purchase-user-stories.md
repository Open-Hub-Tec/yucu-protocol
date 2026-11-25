# Buyer user stories: catalog and purchase

These user stories describe how a buyer browses the community showcase, chooses a product and pays in Yucu Protocol. They are written for contributors who need to understand the design before touching the code.

**Who the buyer is.** Most buyers are older people with little digital experience (see the *Style* section of [AGENTS.md](../../AGENTS.md#estilo)). Short sentences, large controls and the option to speak instead of type matter more than extra features.

**Prototype status.** Yucu is a prototype. Each story carries one of two labels:

- **Built:** the behavior exists in the source files listed below.
- **Future:** the behavior is not built yet. It is written down so the design is clear, and it must not be presented as working.

**Sources.** Every *Built* story agrees with [`BuyerShowcaseScreen.tsx`](../../src/components/BuyerShowcaseScreen.tsx) or [`CartModal.tsx`](../../src/components/CartModal.tsx). Every *Future* story follows [ADR-003](../adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md). User-interface text is in Spanish; button and message labels are quoted in Spanish, followed by an English gloss.

## Story index

| ID | Story | Status |
| --- | --- | --- |
| US-01 | Browse the showcase by product type and municipality | Built |
| US-02 | Search by typing | Built |
| US-03 | Search or start a purchase by speaking | Built |
| US-04 | Look at a product in detail | Built |
| US-05 | Review the bag and change quantities | Built |
| US-06 | Choose a payment method and confirm the order | Built (demonstration) |
| US-07 | Keep the receipt and arrange delivery | Built (demonstration) |
| US-08 | Agree on the purchase by WhatsApp | Built |
| US-09 | Error case: the voice command is not heard or not understood | Built |
| US-10 | Error case: the payment fails | Future |
| US-11 | Error case: there is no signal | Future |
| US-12 | Pay with escrow, signing on my own device | Future |

## Stories

### US-01 · Browse the showcase

**Status:** Built

As a buyer, I want to filter the showcase by product type and by municipality so that I only see pieces I care about.

Acceptance criteria:

1. **Given** the showcase is open, **when** I look at the screen, **then** I see product cards and two rows of options: product types (starting with "Todos los ramos", all types) and municipalities (starting with "Toda la Mixteca", the whole region).
2. **Given** all cards are visible, **when** I tap a product type, **then** only products of that type remain.
3. **Given** a product type is selected, **when** I also tap a municipality, **then** only products that match both choices remain.
4. **Given** I filtered by product type, **when** I tap "Ver todos" (see all), **then** the product-type filter returns to all types.

### US-02 · Search by typing

**Status:** Built

As a buyer, I want to type a word in the search box so that I can find a piece without looking through every card.

Acceptance criteria:

1. **Given** the search box is empty, **when** I type a word, **then** the cards shown are those whose title, description, artisan name or location contain that word.
2. **Given** I typed a word, **when** I tap the close button in the search box, **then** the text is cleared and the cards for the current filters are shown again.
3. **Given** I typed a word and chose a product type, **when** the list updates, **then** both the word and the product type are applied.

### US-03 · Search or start a purchase by speaking

**Status:** Built

As a buyer with little experience typing, I want to speak to the app so that I can search or start a purchase without using the keyboard.

Acceptance criteria:

1. **Given** the showcase is open, **when** I tap "Comprar por Voz" (buy by voice), **then** a panel shows that the microphone is active, the seconds elapsed and the words heard so far, with a hint on what to say.
2. **Given** the microphone is active, **when** I tap "Listo / Procesar" (done / process) after saying a purchase phrase that names a product in the catalog, **then** the app shows a message and opens the bag with one unit of that product.
3. **Given** the microphone is active, **when** I say only a product type, **then** the app filters by that type and shows a message saying so.
4. **Given** the app opened the bag from my voice, **when** I look at the bag, **then** nothing is paid until I confirm the order myself (see US-06).

### US-04 · Look at a product in detail

**Status:** Built

As a buyer, I want to open a product to read more about it so that I can decide with confidence.

Acceptance criteria:

1. **Given** a product card, **when** I tap its image, its text or the "Detalles" (details) button, **then** a detail window opens for that product.
2. **Given** a card shows the artisan, **when** I look at it, **then** I see the artisan's name, the location, the price and the stock label.
3. **Given** the detail window is open, **when** the screen provides a passport view, **then** I can open the product's digital passport from that window.

### US-05 · Review the bag and change quantities

**Status:** Built

As a buyer, I want to see what I am buying and change the amounts so that I do not pay for something I did not mean to take.

Acceptance criteria:

1. **Given** I tap "Comprar Directo" (buy directly) on a card, **when** the bag opens, **then** it lists the product with its image, artisan, location, quantity and price, and shows the total.
2. **Given** a product is in the bag, **when** I tap "+", **then** the quantity goes up by one and the price and total update.
3. **Given** a product has quantity one, **when** I tap "-", **then** the product leaves the bag.
4. **Given** the bag is empty, **when** I look at it, **then** I see the message "Tu bolsa está vacía" (your bag is empty) and, if the screen provides it, a button to return to the showcase.

### US-06 · Choose a payment method and confirm the order

**Status:** Built (demonstration)

As a buyer, I want to choose how I pay and confirm in one step so that the purchase is simple.

In the current prototype the confirmation button always succeeds and the receipt is generated on the device. It is not evidence that money moved. See [Prototype notes](#prototype-notes).

Acceptance criteria:

1. **Given** the bag has products, **when** I look at the payment section, **then** I can choose between three methods: bank transfer (SPEI), cash on delivery and escrow custody. Bank transfer is selected at the start.
2. **Given** I selected a method, **when** I look at the list, **then** the chosen method shows a check mark.
3. **Given** I tapped "Pagar y Confirmar Pedido" (pay and confirm order), **when** the order is being processed, **then** the button is disabled and shows "Emitiendo Comprobante Oficial..." (issuing receipt).
4. **Given** the order was processed, **when** the window updates, **then** it shows a receipt instead of the product list.

### US-07 · Keep the receipt and arrange delivery

**Status:** Built (demonstration)

As a buyer, I want a receipt and a way to talk to the artisan so that I can agree on delivery.

Acceptance criteria:

1. **Given** the receipt is shown, **when** I read it, **then** I see the date, the workshop, the payment method, each item with its quantity and price, and the total.
2. **Given** the receipt is shown, **when** I tap "Guardar Comprobante" (save receipt), **then** the receipt text is copied to the clipboard and the button confirms the copy.
3. **Given** the receipt is shown, **when** I tap "Coordinar Entrega en Chat con la Artesana" (arrange delivery in chat), **then** the bag is emptied, the window closes and the app passes the receipt to the chat.
4. **Given** the receipt is shown, **when** I tap "Cerrar" (close), **then** the bag is emptied, the window closes and, if the screen provides it, the showcase is shown.

### US-08 · Agree on the purchase by WhatsApp

**Status:** Built

As a buyer who prefers a conversation, I want to contact the artisan by WhatsApp so that we can agree on payment and delivery directly.

Acceptance criteria:

1. **Given** a product card, **when** I tap "O por WhatsApp" (or by WhatsApp), **then** WhatsApp opens in a new tab with a message already written that names the artisan, the product and the price.
2. **Given** the bag has products, **when** I tap "O pactar directamente por WhatsApp" (or agree directly by WhatsApp), **then** WhatsApp opens with a message that lists every item, its quantity and the total, and asks to agree on the delivery point or shipping.
3. **Given** I opened WhatsApp from the bag, **when** the link is used, **then** the bag is emptied and the window closes.

### US-09 · Error case: the voice command is not heard or not understood

**Status:** Built

As a buyer, I want the app to tell me when it did not hear or understand me so that I know what to do next instead of waiting.

Acceptance criteria:

1. **Given** I tapped "Comprar por Voz" and the browser does not give the app microphone permission, **when** the app tries to listen, **then** it shows the message "Permiso de micrófono no otorgado..." (microphone permission not granted), the recording does not start and I can still search by typing.
2. **Given** the microphone was active, **when** I finish and no words were heard, **then** the app shows "No se escuchó ningún comando. Intenta de nuevo." (no command was heard, try again) and changes nothing in the showcase or the bag.
3. **Given** I said words that are not a purchase of a known product or a known product type, **when** I finish, **then** the app uses the spoken words as a text search and shows a message with those words.
4. **Given** a voice command did not match a product, **when** the app responds, **then** the bag is not opened and nothing is bought.

### US-10 · Error case: the payment fails

**Status:** Future

As a buyer, I want a clear message and a way to try again when a payment does not go through so that I do not lose my order or wonder whether I paid.

The current prototype has no failure path for payment. This story describes what must exist before the app handles real payments.

Acceptance criteria:

1. **Given** I confirmed the order, **when** the payment fails or I cancel the signature on my device, **then** the app says in short, plain sentences that the payment was not made.
2. **Given** the payment failed, **when** I look at the bag, **then** my products are still there and I can try again or choose another method.
3. **Given** the payment was not confirmed, **when** the app shows the result, **then** it does not show a receipt or any "paid" message, as [ADR-003](../adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md#5-qué-no-se-hace) requires.

### US-11 · Error case: there is no signal

**Status:** Future

As a buyer in a community with weak coverage, I want the app to tell me when there is no connection so that I do not think the purchase went through.

The reviewed sources do not handle a lost connection. This story is a requirement for later work.

Acceptance criteria:

1. **Given** I have no signal, **when** I try to confirm an order that needs the network, **then** the app tells me that there is no connection and that the order was not sent.
2. **Given** I have no signal, **when** I use the showcase, **then** the products already loaded on my device stay visible.
3. **Given** the connection comes back, **when** I return to the bag, **then** my products are still there and I can confirm the order.

### US-12 · Pay with escrow, signing on my own device

**Status:** Future

As a buyer, I want my money to be held by a contract until I confirm that the piece arrived so that I am protected if something goes wrong.

Today the bag offers an escrow option as a label only: it does not create an escrow. Real escrow uses Trustless Work, and each person signs on their own device ([ADR-003](../adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md), D1 to D3).

Acceptance criteria:

1. **Given** I chose escrow and confirmed the order, **when** the app prepares the operation, **then** I sign it on my own device or with my own wallet, and neither the server nor Yucu signs for me or holds my money.
2. **Given** the escrow was created and funded, **when** the piece arrives and I confirm it, **then** the payment is released to the artisan.
3. **Given** the piece does not arrive as agreed, **when** I report a problem, **then** a dispute can be opened and resolved by people or the cooperative, never by the platform.
4. **Given** a result comes from the demonstration chain, **when** the app shows it, **then** it is labeled as a demonstration with `DemoBadge`.

## Prototype notes

These points come from reading the sources and help reviewers keep the stories honest:

- The receipt number, ledger number and hash shown in `CartModal.tsx` are generated at random on the device. They are demonstration data, not evidence of a transaction. Rule 3 of AGENTS.md keeps invented results inside `SimulatedChain.ts` and requires `DemoBadge` when a result is simulated.
- The bank transfer details on the receipt are fixed text in the screen, not data from a real account.
- The escrow option in the bag is a label: it does not call Trustless Work.
- The voice feature matches keywords in the spoken text; it does not sign or pay for the buyer.
- When filters or a search leave no products, the showcase shows no message. A friendly empty-state message for older users is future work.
