# README Implementation Status vs. Live Demo Audit (`https://yucu-protocol.vercel.app`)

**Issue:** `Open-Hub-Tec/yucu-protocol#320`
**Live URL tested:** `https://yucu-protocol.vercel.app`
**Verification method:** HTTP endpoint inspection against `https://yucu-protocol.vercel.app` + full source audit of `README.md`, `AGENTS.md`, `index.html`, `src/App.tsx`, `src/components/**`, `src/data/mockData.ts`, `src/config/protocolFees.ts`, `src/utils/offlineStorage.ts`, and `src/core/**`.

---

## 1. Live Deployment & `<DemoBadge />` Coverage Snapshot

- **Live SPA status:** `GET https://yucu-protocol.vercel.app`, `/manifest.webmanifest`, `/sw.js`, and `/registerSW.js` all return `HTTP 200 OK` (serving the compiled Vite bundle `assets/index-Du9cADF0.js`).
- **Backend API status on Vercel:** `server.ts` is not deployed with the Vercel frontend. `GET /api/health`, `GET /api/v1/protocol/spec`, `POST /api/chat`, `POST /api/analyze-image`, and `POST /api/transcribe-audio` all return `HTTP 404 NOT_FOUND`.
- **Global header pill vs. `<DemoBadge />`:** `TopAppBar` (`src/components/TopAppBar.tsx:85-90`) renders a static `<span>` pill labeled `Demostración` at the top of every screen, whereas the formal `<DemoBadge />` component (`src/components/DemoBadge.tsx`) is mounted in only **6 files**:
  - **4 reachable in the live UI:** `DigitalPassportScreen.tsx:888` (**Buyer view `comprador` only** — omitted in Producer view `productor`), `NormativeCertificateModal.tsx:295` (modal header only), `MyPaymentsModal.tsx:164` (modal header only), and `ProtocolInfrastructureModal.tsx:161` (modal header only).
  - **2 unreachable (dead modals in `App.tsx`):** `HybridArchitectureModal.tsx:93` (`setIsArchitectureModalOpen(true)` is never called) and `RaizAuthModal.tsx:123` (`setIsAuthModalOpen(true)` is never called).
  - **1 unused/tree-shaken component without `<DemoBadge />`:** `YucuPassportBadge.tsx` is absent from the deployed bundle (`assets/index-Du9cADF0.js`).

---

## 2. README Implementation Status Table vs. Demo

Covers all 17 rows from `README.md` (`lines 181–197`) in order, mapped to exact screen and button paths in `https://yucu-protocol.vercel.app`.

| Module (as in README) | README says | What the demo shows | Badge visible? | Where (screen and button) |
| :--- | :--- | :--- | :--- | :--- |
| `PWA (React + Vite, service worker)` | ✅ Real — Installable app; assets cached for offline use. | `/manifest.webmanifest`, `/sw.js`, and `/registerSW.js` return `HTTP 200`, and `PWAInstallButton` renders conditionally (`beforeinstallprompt` or iOS non-standalone). **Discrepancy:** `index.html:20-32` runs an inline script on boot that unregisters all service workers and deletes all browser `caches`, breaking repeat offline asset caching. | Global header pill only (`TopAppBar` `Demostración`); no `<DemoBadge />` | Top bar across all screens (`TopAppBar` install icon when triggered) |
| `Offline storage (offlineStorage.ts)` | ✅ Real — Saves lots in IndexedDB (`localStorage` fallback). | `offlineStorage.ts` saves pending drafts to IndexedDB/`localStorage` only when `!isOnline` (`RegisterCoffeeLotScreen.tsx:724`). Online submissions live only in React state. No UI indicator shows offline queue status or demo persistence limits. | No | `Menú` -> `1. Registrar cosecha o artesanía` -> pick category (e.g. `Café`) -> Step 4 -> `Enviar lote a validación` (offline only) |
| `Soroban contracts (contracts/)` | ✅ Real, testnet — 4 contracts with tests; external security review still pending, not on mainnet; redeployment pending `#110`. | Although `contracts/deployments/testnet.json` records deployed testnet IDs, **no live UI flow calls them**. The Infra Console displays hardcoded contract IDs (`CDLZFC...`, `CA6D3K...` from `RaizProtocolSDK.ts:203-204`) with `4 Activos` / `100% Uptime`, while screens show synthetic ledger numbers (`#52,491,802`, `#5249102`, random `52490000+`). | Yes (Infra Console modal header only); No on Hero card, Chat cards, Producer Passport | `Protocolo` (bottom nav) -> footer `Consola de Infraestructura` -> `Métricas & Soroban`; unbadged references in `Protocolo` hero and `Chat` -> `+` -> `⛓️ Dictamen Stellar` |
| `Chain ports (src/core/chain/)` | 🟡 Architecture ready — Ports and demo implementation with tests; real implementations are open issues. | `ports.ts`, `SimulatedChain.ts`, and `FreighterWallet.ts` have **no UI wiring**. No screen lets a visitor connect Freighter or invoke `SimulatedChain` adapters. | N/A (not mounted in UI) | Not reachable in the live UI |
| `Protocol fees (protocolFees.ts)` | 🟡 Test values — Aligned with contracts; final values depend on tax and legal review. | Displays `10%` artisan resale royalty, `2%` resale Tequio, and `0%` producer/platform fee in Producer Passport technical accordion, Payments modal, Chat cards, Explainer modal, Notion KB, and unreachable `HybridArchitectureModal`. Only `MyPaymentsModal` (and dead `HybridArchitectureModal`) include `<DemoBadge />`. | Partial (`Yes` in Payments modal header; `No` in Producer Passport, Chat cards, Explainer, Notion KB) | `Menú` -> `3. Ver mis pagos` (badged); `Menú` -> `2. Ver mis lotes` -> select lot -> `Ver datos técnicos de laboratorio y trazabilidad (Opcional)` (no `<DemoBadge />`); `Chat` -> `+` -> `💎 10% Regalías Soroban` (no `<DemoBadge />`) |
| `Hosting` | 🟡 Google AI Studio only — Vercel with previews per PR is open (`#170`). | **README table is stale:** `https://yucu-protocol.vercel.app` is live (`HTTP 200`) serving the static SPA (and `README.md:20` links to it). Express backend routes in `server.ts` (`/api/*`) return `HTTP 404` on Vercel. | Global header pill only (`TopAppBar`); `<DemoBadge />` in Infra Console header | Any screen at `https://yucu-protocol.vercel.app`; missing backend visible in `Protocolo` -> `Consola de Infraestructura` -> `API & Webhooks Gateway` -> `Ejecutar Petición Live` |
| `Server and database design (SERVIDOR.md, BASE_DE_DATOS.md)` | 🟡 Documented — Routes, tables and rules are specified; code is open issues. | Matches Vercel behavior: no live server or database is connected (`/api/*` returns `404`). Screens read `mockData.ts` and temporary React state without informing users that backend persistence is absent. | No (`MyLotsModal`, `RegisterCoffeeLotScreen`, `BuyerShowcaseScreen` have no `<DemoBadge />`) | `Menú` -> `2. Ver mis lotes`; `Menú` -> `1. Registrar cosecha o artesanía`; bottom nav `Comprar` |
| `Attestations on Attest Protocol and voice engine` | 🟡 Documented — ADR-005 and ADR-007 plus issues `#140–#167`; nothing built yet. | Despite nothing being built on Attest Protocol, the Infra Console advertises `Esquemas Canónicos Registrados en AttestationRegistry.rs` and simulates `✓ VÁLIDA & ACTIVA (ON-CHAIN)` (`Ledger #54201840`), while QR tags, Producer Passports, and Checkout receipts claim `Sello Inmutable` / `Sellado Inmutable` with no badge. | Mixed (`Yes` in `ProtocolInfrastructureModal` header; `No` on `ArtisanQrTagModal`, Producer Passport, Cart receipt) | `Protocolo` -> `Consola de Infraestructura` -> `Atestaciones RWA (EAS)` -> `⚡ Simular Verificación en Ledger`; unbadged in `Menú` -> `2. Ver mis lotes` -> `Etiqueta QR` |
| `Chat, image analysis, transcription (server.ts)` | 🟡 Experimental — Records real audio and calls Gemini when `GEMINI_API_KEY` is set; voice does not register a lot yet (`#155`); without the key, invented replies occur (`#154`). | On Vercel, `POST /api/chat`, `POST /api/analyze-image`, and `POST /api/transcribe-audio` all return `HTTP 404`. `RegisterCoffeeLotScreen` silently catches the 404 (`lines 343-387`) and shows hardcoded inspection verdicts (`92/100`, `11.4%`, `verified` icon); `ChatScreen` falls back (`lines 1381-1624`) to scripted replies claiming live Stellar checks (`#52,491,802`). Voice diagnostic (`MicrophoneDiagnosticModal`) hits 404 and displays `"El servidor no pudo procesar"`. | No (zero `<DemoBadge />` in `ChatScreen` and `RegisterCoffeeLotScreen`) | Bottom nav `Chat` (or `Menú` -> `4. Ayuda técnica`); `Menú` -> `1. Registrar cosecha o artesanía` -> pick category -> `TOCAR AQUÍ PARA EVALUAR CON IA` |
| `Catalog and data (mockData.ts)` | 🔴 Demo only — No database yet: buyer products are fictional demo data, and registered lots live only in app state (`#156`). | Buyer catalog and 5 `INITIAL_VERIFIED_LOTS` populate the showcase, lots modal, landing cards, and passports. Only Buyer Passport view (`comprador`) and Payments modal header show `<DemoBadge />`. Also `MainMenuScreen.tsx:360` and `MyPaymentsModal.tsx:781` hardcode `"4 lotes"` despite 5 initial lots in `mockData.ts`. | Partial (`Yes` in Passport `Comprador` view & `MyPaymentsModal` header; `No` in Showcase, Detail modal, `MyLotsModal`, Producer Passport, Landing) | Badged: `Protocolo` -> `Inspeccionar Lote Completo` / `Ver Pasaporte`, or `Menú` -> `3. Ver mis pagos`. Unbadged: `Comprar` -> item `Detalles`; `Menú` -> `2. Ver mis lotes`; `Protocolo` -> `Lotes Certificados en Tiempo Real` |
| `Public API /api/v1/*, useYucuProtocol hooks, YucuPassportBadge` | 🔴 Simulated — Endpoints return fixed or random values; hooks and badge consume them; not a real verification service yet. | On Vercel, `/api/v1/*` returns `HTTP 404`: clicking `Ejecutar Petición Live` fails to parse 404 HTML and displays `"HTTP 500 OK"` (`ProtocolInfrastructureModal.tsx:958`, modal header badged). `useYucuProtocol.ts` falls back locally (`valid: true`). **`YucuPassportBadge.tsx` is unused in `App.tsx`, absent from the live bundle, and lacks `<DemoBadge />`.** | Mixed (`Yes` in Infra Console header; `No` in unmounted `YucuPassportBadge.tsx`) | `Protocolo` -> `Consola de Infraestructura` -> `API & Webhooks Gateway` -> `Ejecutar Petición Live`; `YucuPassportBadge` is unreachable |
| `SorobanAdapter.ts, StellarLiveClient.ts` | 🔴 Simulated / partial — Fake hashes or `simulated: true`; to be replaced by ports (`#105`, `#109`). | `StellarLiveClient` has no UI caller; `SorobanAdapter` is wrapped inside `RaizCore` / `RaizProtocolSDK`. Live UI views bypass them and render inline fake hashes (`0x...` 32/53 hex chars or empty-string SHA-256) and synthetic ledgers (`#52,491,802`, `52490000+`), mostly without `<DemoBadge />`. | Mixed (`Yes` in `NormativeCertificateModal` & `ProtocolInfrastructureModal` headers and Passport `Comprador`; `No` elsewhere) | `Protocolo` -> `Consola de Infraestructura` -> `Métricas & Soroban`; unbadged hashes/ledgers via `Chat` -> `+` -> `⛓️ Dictamen Stellar`, `Comprar` -> pay, `Menú` -> `2. Ver mis lotes` -> select lot |
| `TrustlessWorkEscrowAdapter.ts` | 🔴 Simulated — In-memory escrows; to be replaced by real `EscrowPort` (`#96`). | Milestone simulator (`YUC-2026-881`, `$10,000 MXNe`) runs inside Infra Console (`<DemoBadge />` in modal header). Landing hero, Chat wallet/product cards, and Showcase display `"Trustless Work Milestone Locked ($1,500 USDC)"`, `"Contrato Escrow Soroban: Activo"`, and `"Escrow Stellar"` with no badge. | Mixed (`Yes` in `ProtocolInfrastructureModal` header; `No` in Landing hero & Chat cards) | Badged: `Protocolo` -> `Consola de Infraestructura` -> `Trustless Work Escrow`. Unbadged: `Protocolo` hero; `Chat` -> `+` -> `💳 Billetera & Saldo` / `🛍️ Producto Vitrina` |
| `HybridSettlementOrchestrator.ts` | 🔴 Simulated — Fixed exchange rates and locally generated SPEI folios; to be replaced by `PayoutPort`. | `HybridArchitectureModal` uses this orchestrator and has `<DemoBadge />`, **but is completely unreachable** (`setIsArchitectureModalOpen(true)` is never called; `MyPaymentsModal`'s `onOpenArchitecture` prop is omitted). `MyPaymentsModal` uses `COUNTRY_CONFIGS` (`0.38 BOB` / `0.28 BRL`, header badged), while `CartModal` creates simulated `REC-MIX-2024-...` receipts without `<DemoBadge />`. | Mixed (`Yes` in `MyPaymentsModal` header & dead `HybridArchitectureModal`; `No` in `CartModal`) | `Menú` -> `3. Ver mis pagos` (or `Chat` -> `💰 Consultar Mis Pagos y Saldo`); `Comprar` -> cart -> pay (no `<DemoBadge />`); `HybridArchitectureModal` has no button |
| `RaizAIOracles.ts, YucuAgentSwarm.ts` | 🔴 Simulated — Fixed scores and `CERTIFIED` results; no satellite or lab data. | `RaizAIOracles` is interactive in Infra Console (`4 Oráculos de IA`, scores `88.75`/`96.5`, `canopyDensityPercent: 87.4%`, header badged). `YucuAgentSwarm.ts` has no caller in `src/components/*`. Meanwhile, `RegisterCoffeeLotScreen` displays simulated scores (`92/100`, `96/100`, `99/100`) and `RaizLandingPage` displays `"EUDR Deforestation-Free (Satélite)"` with zero `<DemoBadge />`. | Mixed (`Yes` in `ProtocolInfrastructureModal` header; `No` on Landing hero & `RegisterCoffeeLotScreen`; `YucuAgentSwarm` unmounted) | `Protocolo` -> `Consola de Infraestructura` -> `4 Oráculos de IA`; unbadged in `Protocolo` hero & `Menú` -> `1. Registrar cosecha o artesanía` -> `TOCAR AQUÍ PARA EVALUAR CON IA` |
| `SyncEngine.ts, RaizAuthEngine.ts` | 🔴 Simulated — `setTimeout` sync; fixed OTP and placeholder addresses. | `SyncEngine.initAutoSync()` runs silently from `App.tsx:69` with no UI state or badge. `RaizAuthEngine.getActiveUser()` fills the preset producer identity (`"Identidad Protegida"` in `MainMenuScreen.tsx:304`) with **no `<DemoBadge />`**. `RaizAuthModal` (`<DemoBadge />` at `line 123`) is **unreachable** (`setIsAuthModalOpen(true)` is never called). | No in reachable UI (`RaizAuthModal` has `<DemoBadge />` but is unreachable) | `Menú` top card (`Identidad Protegida`, unbadged); `Chat` -> `Mi Padrón` (`ID #HUB-MIX-2026`, unbadged); `RaizAuthModal` has no button |
| `CryptoEngine.ts` | 🔴 To fix — Hash fallback is not real SHA-256 (`#120`). | **README table is stale:** `src/core/crypto/CryptoEngine.ts:17-37` already uses WebCrypto `crypto.subtle.digest('SHA-256', ...)` and throws `'WebCrypto no disponible'` with no polynomial fallback. **However, UI screens never call `CryptoEngine`:** they render hardcoded empty-string SHA-256 (`e3b0c44298...`), static 64-hex (`0x9f83a7...c0d9`), 53-hex (`0x8f3c4e...592`), or 32-hex `0x...` strings with no `<DemoBadge />`. | No | `Protocolo` hero (`SHA-256 Digest Comunitario` + `Copiar Hash`); `Chat` -> `+` -> `⛓️ Dictamen Stellar`; `Menú` -> `1. Registrar cosecha o artesanía` -> submit lot; `Comprar` -> checkout |

---

## 3. Places Showing a Hash, Number, or Seal With No `<DemoBadge />`

> **Important architectural note:** `TopAppBar` (`src/components/TopAppBar.tsx:85-90`) renders a static inline `<span>` pill (`Demostración`) across screens, which is **not** an instance of `<DemoBadge />`. The list below audits every screen, modal, and component for missing `<DemoBadge />` markers next to rendered hashes, numeric claims, and seals.

### A. Screens, Modals, and Cards With Zero `<DemoBadge />` Anywhere

1. **Landing Page (`src/components/RaizLandingPage.tsx`)**
   - **Where:** Bottom nav `Protocolo` (default landing view).
   - **Hero impact KPIs (`lines 222-237`, also `427`, `565`):** `79` ("Productores entrevistados"), `1,200%` ("Brecha máxima"), `< 9 seg`, `100%` ("Resiliencia offline"). *(Inconsistency: `ExplainerVideoModal.tsx:37` and `ProtocolInfrastructureModal.tsx:743` state `52` producers instead of `79`.)*
   - **Hero mock passport (`lines 247-295`):** Seal/title `Pasaporte Digital de Cosecha #MX-984`, `Soroban Ledger #5249102`, `Pluma Hidalgo Lavado · SCAA 87.5 pts`, `EUDR Deforestation-Free (Satélite)`, `Trustless Work Milestone Locked ($1,500 USDC)`, and `SHA-256 Digest Comunitario` `0x9f83a7...b1c0d9` with `Copiar Hash` button.
   - **Anti-coyote economic calculator (`lines 417-534`):** Hardcoded simulated unit prices (`$42`/`$185`/`$420` cafe, `$350`/`$1450`/`$3200` textil, `$45`/`$160`/`$380` miel, `$25`/`$140`/`$320` palma) and computed MXN totals / percentage gaps.
   - **Certified Lots showcase (`lines 601-658`):** Cards displaying `Folio #MX-2024-884`, `Folio #MX-2024-912`, `Folio #MX-2024-765`, and `$185 MXN / unidad`.

2. **Main Menu (`src/components/MainMenuScreen.tsx`)**
   - **Where:** Bottom nav `Menú`.
   - **Identity & lot count (`lines 304, 360`):** Account card shows `"Identidad Protegida"` seal (`line 304`) and button `2. Ver mis lotes` displays `"4 lotes activos en acopio"` (`line 360`), which contradicts the 5 initial lots in `src/data/mockData.ts`.

3. **My Lots Modal (`src/components/MyLotsModal.tsx`)**
   - **Where:** `Menú` -> `2. Ver mis lotes` (or `Pasaporte Digital` -> `Ver todos Mis Productos Registrados`).
   - **Counters, seals, numbers (`lines 43, 78-83, 89`):** Renders `{lots.length} lotes registrados activos en Mixteca`, `Lote #{lot.code}`, status badges `"Verificado"` / `"Aprobado"`, and `{lot.volumeKg} kg · ${lot.pricePerKg} MXN/kg`.

4. **Digital Passport — Producer View & Buyer Pill (`src/components/DigitalPassportScreen.tsx`)**
   - **Where:** `Menú` -> `2. Ver mis lotes` -> select any lot (opens Producer view `viewMode === 'productor'`), OR `Menú` -> `1. Registrar cosecha o artesanía` -> submit Step 4 (`Enviar lote a validación`). Buyer view (`comprador`) is reached via `Protocolo` -> `Inspeccionar Lote Completo` / `Ver Pasaporte`, or `Comprar` -> `Detalles` -> `Ver Pasaporte Digital y Sello Criptográfico Stellar`.
   - **Header folio seal (both modes, `lines 302-305`):** `verified` icon + `LOTE #{lot.code}`.
   - **Entire Producer view (`lines 343-766`, zero `<DemoBadge />` anywhere):**
     - `"Registro Exitoso"` confirmation banner (`lines 354-362`).
     - Estimated economic numbers: `{lot.volumeKg} kg / u`, suggested price `${lot.pricePerKg}`, and `${totalEstimatedValue} MXN` (`lines 489-527`).
     - Paused-visibility banner (triggered by `Dejar de mostrarme`, `line 430`): claims `"El sello criptográfico en Stellar (#{lot.nomCompliance?.stellarTxLedger || '52,491,802'}) continúa 100% verificado"` (`line 385`).
     - Accordion `Ver datos técnicos de laboratorio y trazabilidad (Opcional)` (`lines 642-739`): displays standard `{lot.nomCompliance?.standard}`, `"Aprobado 100%"` seal (`line 669`), humidity, defect percentage, altitude, royalties (`PROTOCOL_FEES` `10%` / `2%`), and `Folio Digital #${mockLedger}` (`App.tsx:455`).
   - **Buyer view unbadged pills (`lines 801-813, 911`):** Only the Regulatory Status box at `line 888` has `<DemoBadge />`; image overlay `"Pasaporte Digital Activo"` (`lines 801-808`), `"LOTE #{lot.code}"` (`line 813`), and `"Garantía Directa"` price display (`line 911`) have none.

5. **Artisan QR Hang-Tag Modal (`src/components/ArtisanQrTagModal.tsx`)**
   - **Where:** `Menú` -> `2. Ver mis lotes` -> `Etiqueta QR`; OR `Pasaporte Digital` -> `Ver e Imprimir mi Etiqueta QR Física`; OR `NormativeCertificateModal` -> `Generar Etiqueta QR Física para Colgar (Hang-tag)`.
   - **Unbadged seals & folios (`lines 148, 161, 189-192`):** Subtitle `"Certificado de Origen y Trazabilidad Inmutable"`, pill `"FOLIO: {formattedCode}"`, `"Sello Inmutable: Stellar SHA-256 (Zero-PII)"`, and QR code targeting `/?cert=MX-...`.

6. **Register Harvest / Craft Lot Screen (`src/components/RegisterCoffeeLotScreen.tsx` & `src/App.tsx`)**
   - **Where:** `Menú` -> `1. Registrar cosecha o artesanía` -> pick any category card -> capture/pick photo or tap `TOCAR AQUÍ PARA EVALUAR CON IA` -> complete Steps 1–4 -> `Enviar lote a validación`.
   - **Unbadged inspection scores, norms, and generated hashes:**
     - Category `verifyBadge` (`line 977`).
     - Client-side fallback verdict after `/api/analyze-image` 404 (`lines 343-387`): renders `"Resultado del Dictamen"` with `verified` icon, hardcoded quality score (`92 / 100`, `96 / 100`, `99 / 100`), and `"11.4% (Pergamino)"` / `"18% (Miel)"`.
     - Step 4 modal (`lines 1780-1863`): states `"Paso 4 de 4 · Certificación Normativa"`, `"Auditoría de Calidad y Sellado Stellar"`, `"2. Conforme a NMX-F-083 (Humedad 11.4% y <2% defectos)"`, and `"3. Sellado inalterable de autenticidad comunal (Red Stellar)"`.
     - Underlying consent object (`RegisterCoffeeLotScreen.tsx:121-125`) embeds `ledgerSequence: 52491802` and empty-string SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`; submission handler (`App.tsx:234-235`) generates random `mockLedger` (`52490000 + rand`), a 32-hex `mockTxHash` (`0x...`), and `immutableSealStatus: 'Sellado Inmutable'`.

7. **Chat Assistant & Interactive Cards (`src/components/ChatScreen.tsx` & `src/components/BotCardView.tsx`)**
   - **Where:** Bottom nav `Chat` (or `Menú` -> `4. Ayuda técnica`); tap `+` button (`showCardPicker`) or quick actions (`📜 Ver Dictamen de Demostración Stellar`, `💰 Consultar Mis Pagos y Saldo`, `Mi Padrón` tab).
   - **Chat replies & credentials (`ChatScreen.tsx`):** Fallback responses (`lines 1381-1624`) state `"He verificado en vivo la firma en Stellar Testnet Ledger #52,491,802"` (`lines 1262, 1543`); completing `Mi Padrón` displays `"Credencial Digital ID #HUB-MIX-2026 está activa en el sistema"` (`line 1751`).
   - **Interactive card views (`BotCardView.tsx`):**
     - `dictamen_stellar` (`+` -> `⛓️ Dictamen Stellar`, `lines 65-163`): `"Humedad 11.4%"`, `"Broca / Def. < 1.2%"`, `"Semilla 100% Nativa"`, `Firma SHA-256 en Stellar:` `0x8f3c4e...592` (53 hex chars), `Bloque #52,491,802`, and button `Verificar en Horizon` changing to `"✓ Validado en Testnet"`.
     - `lote_registro` (`+` -> `☕ Lote Cosecha`, `lines 184-205`): `Folio #884`, `450 kg`, `Certificación: Agroecológico Mixteco`.
     - `billetera_pago` (`+` -> `💳 Billetera & Saldo`, `lines 258-269`): `$38,250.00 MXN` / `≈ 1,912.50 USDC`, `Contrato Escrow Soroban: Activo`.
     - `producto_vitrina` (`+` -> `🛍️ Producto Vitrina`, `line 321`): `Escrow Stellar` seal badge.
     - `trazabilidad_pasaporte` (`+` -> `🏷️ Pasaporte Digital`, `lines 379-408`): `Lote #884`, `Verificado`, `Humedad 11.4%`, `Stellar Hash`.
     - `regalias_mercado` (`+` -> `💎 10% Regalías Soroban`, `lines 514-530`): `$2,000.00 MXN (100 USDC)`, `$10,000.00 MXN (500 USDC)`, `+$1,000.00 MXN (50 USDC)`, `Stellar Ledger #52,499,104`, `Hash: 0x3a9f...c281 ✓`.
     - `recibo_ticket` (`CartModal` -> `Coordinar Entrega en Chat con la Artesana`, `lines 568-644`): `Folio #{folio}`, `Pago Confirmado`, `Stellar Ledger #52499210` (or random), `Hash: ... ✓` (prose title mentions `"Comprobante de Demostración"`, no `<DemoBadge />`).

8. **Cart & Checkout Receipt (`src/components/CartModal.tsx`)**
   - **Where:** Bottom nav `Comprar` -> `Comprar Directo` (or Top bar bag button) -> execute payment (`handleExecutePayment`, `lines 64-100`).
   - **Unbadged payment numbers & hashes (`lines 64-100, 248, 257-260`):** Displays masked simulated 18-digit CLABE (`line 248`), generated folio `REC-MIX-2024-<4 digits>`, `"Pago Confirmado"`, `Stellar Ledger #5249...`, and 32-hex `Hash: 0x... ✓` (only prose `"Comprobante de Demostración"`, zero `<DemoBadge />`).

9. **Buyer Showcase & Product Detail (`src/components/BuyerShowcaseScreen.tsx`, `src/components/ProductDetailModal.tsx`)**
   - **Where:** Bottom nav `Comprar` -> any product card -> `Detalles`.
   - **Unbadged commercial numbers & guarantees:** Fictional prices (`$150`–`$1,850 MXN`), stock quantities, `"100% Directo / Sin comisiones"`, `"100% liquidación al taller familiar"`.

10. **Regional Production Map (`src/components/RegionalMapModal.tsx`)**
    - **Where:** `Menú` -> `Magdalena Peñasco, Oax. / Ver Mapa & Clima de Acopio`.
    - **Unbadged regional stats (`lines 23-89, 224-270`):** Seal `"Zona de Producción Verificada"`, elevation numbers (`1,680`–`2,450 msnm`), fake lot counts (`18`, `9`, `12`, `7`, `5`), weather metrics (`19°C · Humedad 48%`), and community GPS coordinates.

11. **Explainer Video & Notion Knowledge Base (`src/components/ExplainerVideoModal.tsx`, `src/components/KnowledgeBaseModal.tsx`)**
    - **Where:** `Protocolo` -> `Testimonio de Campo` (`6 Capítulos`); `Chat` -> `+` -> `📖 Base Notion`.
    - **Unbadged numeric claims:** `"52 productores y artesanos"`, `30% Anticipo`, `70% Liquidación`, `10% de regalías perpetuas`, `2% automático Tequio` (`ExplainerVideoModal`); `"comisiones < $0.001 USD"`, `"50 USDC"` (`KnowledgeBaseModal`).

12. **Buyer Research Leads Modal (`src/components/BuyerResearchIssueModal.tsx`)**
    - **Where:** URL query params (`?issue=true`, `?ux=true`, or `?comprador=true`).
    - **Unbadged metrics (`lines 47-80`):** Preloaded sample buyer leads displaying SUS scores (`95`, `90`) and lead details with no `<DemoBadge />`.

13. **Unmounted Badge Component (`src/components/YucuPassportBadge.tsx:19-115`)**
    - **Where:** Not mounted anywhere in the live SPA (`App.tsx` does not import it).
    - **Unbadged seals & metrics:** Contains zero `<DemoBadge />` while rendering `"Certificación RWA Soroban"`, `"Verificado en Ledger"` / `"Sello Válido"`, `"★ 88.5"`, `"0% Pérdida"`, `"98% Directo"`, and `"GS1 Digital Link Compliant"`.

### B. Modals With `<DemoBadge />` Only in Header (Inner Hashes, Ledgers, and Numbers Unbadged)

Even where `<DemoBadge />` is present in the modal header, inner technical boxes display realistic ledgers, hashes, and metrics without inline badges:

- **`NormativeCertificateModal` (`src/components/NormativeCertificateModal.tsx`):** `<DemoBadge />` in header (`line 295`). Inner boxes (`lines 334-491`) display `FOLIO REGIONAL: OAX-MIX-{lot.code}`, `SELLADO INMUTABLE`, `Aprobado 100%`, `11.4%`, `< 1.2%`, `1,650 msnm`, `Sellado Inmutable Stellar Ledger #52,491,802`, `TX HASH SHA-256`, `Estado: Inmutable & No Alterable`, and `Red: Stellar Horizon (testnet)`. Also, the downloadable HTML footer (`line 251`) reads `"Certificado emitido y resguardado criptográficamente"` without repeating the demo label (though the top document badge at `line 153` states `"DOCUMENTO DE DEMOSTRACIÓN"`). Reach: `Pasaporte Digital` (Producer view) -> `Ver Dictamen de Demostración de Calidad (PDF)` or `Chat` -> `📜 Ver Dictamen de Demostración Stellar`.
- **`MyPaymentsModal` (`src/components/MyPaymentsModal.tsx`):** `<DemoBadge />` in header (`line 164`). Body renders fixed FX rates (`0.38 BOB`, `0.28 BRL`), sample SPEI folio `SPEI-TLX-88219`, and stale `"Ver mis 4 lotes vinculados en acopio →"` (`line 781`). Reach: `Menú` -> `3. Ver mis pagos` or `Chat` -> `💰 Consultar Mis Pagos y Saldo`.
- **`ProtocolInfrastructureModal` (`src/components/ProtocolInfrastructureModal.tsx`):** `<DemoBadge />` in header (`line 161`). Sub-tabs render:
  - `4 Oráculos de IA`: `overallScore` (`88.75` / `96.5`), `canopyDensityPercent` (`87.4%`), `payloadDigest`, `attestationHash`, `aiModelSignature`, `complianceId`, `certificationDigest`, `0 XLM`.
  - `Atestaciones RWA (EAS)`: `"✓ VÁLIDA & ACTIVA (ON-CHAIN)"`, `signature: 0xed25519_canonical_sig_99a8b1c4`, `Ledger Sequence Stellar: #54201840`.
  - `Trustless Work Escrow`: `YUC-2026-881`, `$10,000 MXNe`, `$3,000 MXN` / `$7,000 MXN`.
  - `50+ Productores & PWA`: `"52 productores activos"`, `"100% de éxito"`.
  - `Métricas & Soroban`: `48,500 kg`, `$142,500 USD`, `15` communities, `4 Activos`, `100% Uptime`, placeholder/testnet contract IDs (`CDLZFC...`, `CA6D3K...`).
  - `API & Webhooks Gateway`: claims `"v1.2.0 LIVE"` on `https://yucu.tecnm.mx` and renders `"HTTP 500 OK"` (`line 958`) when `/api/v1/*` returns `404` on Vercel.
  - Reach: `Protocolo` -> footer `Consola de Infraestructura`.

---

## 4. Key Discrepancies Summary

1. **README table is stale in two directions:** `Hosting` (`Google AI Studio only`) misses the live Vercel deployment (`https://yucu-protocol.vercel.app`, `HTTP 200`), while `CryptoEngine.ts` (`To fix`) already uses WebCrypto `SHA-256` with no polynomial fallback — yet UI components never call `CryptoEngine`.
2. **Silent `/api/*` 404 fallbacks on Vercel:** Because `server.ts` is not served on `https://yucu-protocol.vercel.app`, Chat, AI Image Analysis, and `/api/v1/*` silently degrade to hardcoded mock verdicts/replies (or display `"HTTP 500 OK"` in the API Gateway tab) with no `<DemoBadge />` on Chat or Lot Registration.
3. **Asymmetric `<DemoBadge />` placement and dead modals:** Producer Passport (`viewMode === 'productor'`), QR hang-tags, Checkout receipts, Chat cards, and Landing hero hashes/seals have **zero `<DemoBadge />`**, while 2 of the 6 components containing `<DemoBadge />` (`RaizAuthModal`, `HybridArchitectureModal`) are unreachable from any button in `App.tsx`, and `YucuPassportBadge` is dead code with no `<DemoBadge />`.
4. **Inconsistent demo counts & broken repeat SW caching:** Hero vs. Explainer/Infra tabs disagree on producer count (`79` vs. `52`), Menu/Payments hardcode `"4 lotes"` against 5 `mockData.ts` lots, and `index.html:20-32` unregisters service workers and clears caches on every boot.
