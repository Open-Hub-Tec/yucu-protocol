# Backlog para estudiantes (borrador para revisión)

Arquitectura de referencia: [ADR-003](../adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md) y [`src/core/chain/ports.ts`](../../src/core/chain/ports.ts).
Reglas para todos (y para su asistente de IA): [`AGENTS.md`](../../AGENTS.md).

Complejidad (Drips Wave): **Trivial** = 100 pts · **Medium** = 150 pts · **High** = 200 pts.

## Orden y dependencias

```
W1 Billetera en el teléfono ──┬──▶ W3 Registrar lote real ──▶ W8 Enlace al explorador
W2 Preparar register_lot ─────┘            │
W4 Patrocinio de comisiones ───────────────┘
W5 Quitar hashes falsos (independiente)
W6 Escrow con Trustless Work ◀── W1, W4
W7 Pantalla de firma ◀── W1
W9 Cola offline de transacciones ◀── W3
W10 Almacenamiento temporal en attestation_registry (independiente, Rust)
W11 Pruebas negativas de contratos (independiente, Rust)
```

## Issues existentes que este backlog reemplaza

| Issue actual | Qué hacer | Reemplazo |
|---|---|---|
| #5, #21 (cola offline) | Cerrar como duplicadas | W9 |
| #7, #71 (RPC / XDR) | Cerrar | W2 + W3 |
| #8, #20 (fee-bump) | Cerrar | W4 |
| #18 (OTP fijo, identidad) | Cerrar: el OTP con llave custodial contradice ADR-003 | W1 |
| #26 (escrow) | Reescribir | W6 |
| #75 (TTL en registry) | Reescribir | W10 |

> Antes de cerrar #5 y #7: tienen interesados externos que mencionan un bounty de 400 USDC. Dejar un comentario explicando que el trabajo continúa en la issue nueva y que la recompensa es por puntos de la Wave.

---

## W1 · Billetera no custodial en el teléfono (`WalletPort`) — **High**

**Contexto.** Según ADR-003, cada campesino firma con su propia llave, que nunca sale de su teléfono. Hoy `src/core/auth/RaizAuthEngine.ts` usa un OTP fijo (`7421`) y direcciones inventadas.

**Qué hacer.** Implementa `WalletPort` (`src/core/chain/ports.ts`) en `src/core/chain/wallet/DeviceWallet.ts`:
- `createAccount(pin)`: genera una cuenta Stellar (`Keypair.random()`) en el navegador.
- Cifra la llave secreta con AES-GCM usando una clave derivada del PIN (PBKDF2, ≥ 200 000 iteraciones, sal aleatoria) con WebCrypto, y guárdala en IndexedDB.
- Devuelve `recoveryCard`: el texto que se imprimirá como tarjeta de recuperación.
- `sign(tx, pin)`: descifra en memoria, firma el XDR y descarta la llave.

**Archivos.** `src/core/chain/ports.ts`, `src/utils/offlineStorage.ts` (patrón de IndexedDB), `src/core/crypto/CryptoEngine.ts`.

**Criterios de aceptación.**
- [ ] La llave secreta nunca se guarda sin cifrar, nunca se envía por la red y nunca aparece en logs.
- [ ] Un PIN incorrecto no firma y devuelve un error comprensible.
- [ ] Pruebas: crear → firmar → verificar la firma con la dirección pública; PIN incorrecto falla.
- [ ] `npm run lint`, `npm test` y `npm run build` pasan.

**Cómo se revisa.** Lectura del código de cifrado y búsqueda de cualquier ruta por la que la llave pueda salir del dispositivo.

---

## W2 · Servidor: preparar `register_lot` sin firmar — **Medium**

**Contexto.** El contrato `lot_passport` ya está en testnet (`contracts/deployments/testnet.json`). `register_lot` exige dos firmas: la del nodo certificador (admin del proyecto) y la del productor. El servidor puede firmar **solo como admin**; el productor firma en su teléfono.

**Qué hacer.** En `server.ts`, crea `POST /api/chain/lots/prepare`. Recibe un `RegisterLotRequest`, arma la invocación con `@stellar/stellar-sdk` (simula y ensambla), firma únicamente la autorización del admin (llave en `.env`: `STELLAR_CERTIFIER_SECRET`) y devuelve un `UnsignedTransaction` cuya fuente es la cuenta del productor.

**Criterios de aceptación.**
- [ ] El XDR devuelto todavía necesita la firma del productor (pruébalo con `needsNonInvokerSigningBy` o equivalente).
- [ ] Con un folio repetido, devuelve 409 con el mensaje del error `LotAlreadyExists` (#5).
- [ ] Sin `STELLAR_CERTIFIER_SECRET`, responde 503 en lugar de fallar.
- [ ] La llave del admin no se registra en logs ni en respuestas.

---

## W3 · Registrar un lote real en testnet (`LotRegistryPort`) — **Medium**

**Depende de:** W1, W2 (y W4 si el productor no tiene XLM).

**Qué hacer.** Implementa `LotRegistryPort` en `src/core/chain/testnet/TestnetLotRegistry.ts`: `prepareRegisterLot` llama a W2, `submit` envía el XDR firmado y `getLot` lee el contrato. Elige la implementación en `src/core/chain/index.ts` según la configuración y cambia el registro de lotes de `App.tsx` para usar `chain.lots`.

**Criterios de aceptación.**
- [ ] Un lote registrado desde la app aparece en stellar.expert (testnet) con el comprobante `source: 'testnet'`.
- [ ] Si la red falla, el lote queda como "pendiente", no como "sellado".
- [ ] Prueba de integración opcional (se salta si no hay red), más pruebas unitarias con la red simulada.

---

## W4 · Patrocinio de comisiones y reservas — **Medium**

**Contexto.** Los productores no tienen XLM. La plataforma puede **pagar** comisiones (fee-bump, CAP-15) y **patrocinar** la reserva de la cuenta (CAP-33) sin firmar por ellos.

**Qué hacer.** `POST /api/chain/submit`: recibe el XDR firmado por el usuario, lo envuelve en un fee-bump pagado por la cuenta patrocinadora y lo envía. Agrega un endpoint para crear la cuenta del productor con reserva patrocinada.

**Criterios de aceptación.**
- [ ] El servidor no modifica la transacción interna (la firma del usuario sigue siendo válida).
- [ ] Hay un límite de transacciones patrocinadas por cuenta y por día.
- [ ] Pruebas del límite y de una transacción con firma inválida (debe rechazarse).

---

## W5 · Un solo lugar para lo simulado — **Medium**

**Contexto.** Hay hashes y ledgers falsos repartidos en `App.tsx`, `CartModal.tsx`, `ChatScreen.tsx`, `HybridSettlementOrchestrator.ts` y `SorobanAdapter.ts`. Además, `SorobanAdapter` usa la *passphrase* de Futurenet con el RPC de testnet.

**Qué hacer.** Reemplaza cada generación de hash o ledger falso por llamadas a `chain` (`src/core/chain`). Elimina `SorobanAdapter` o déjalo como envoltura de los puertos. Toda pantalla que muestre un comprobante simulado debe mostrar `<DemoBadge />`.

**Criterios de aceptación.**
- [ ] `grep -rn "Math.random" src | grep -iE "hash|ledger"` solo encuentra resultados en `SimulatedChain.ts`.
- [ ] Ninguna pantalla dice "Sellado Inmutable" para algo simulado.

---

## W6 · Escrow real con Trustless Work (`EscrowPort`) — **High**

**Depende de:** W1, W4.

**Contexto.** ADR-001/ADR-003: el escrow es Trustless Work. Su API devuelve transacciones sin firmar que firma cada rol.

**Qué hacer.** Implementa `EscrowPort` en `src/core/chain/testnet/TrustlessWorkEscrow.ts` contra la API de testnet de Trustless Work: crear (hitos de 30 % y 70 %), fondear, aprobar hito y liberar. Roles: comprador, productor (*service provider*/receptor) y cooperativa (aprobador). **La plataforma no tiene ningún rol que mueva fondos.** Reemplaza `TrustlessWorkEscrowAdapter.ts`.

**Criterios de aceptación.**
- [ ] Flujo completo en testnet con USDC de prueba y comprobantes visibles en el explorador.
- [ ] Ninguna llave de comprador, productor o cooperativa pasa por el servidor.
- [ ] La API key de Trustless Work está en `.env`, no en el código.
- [ ] Documento corto en `docs/` con el mapeo de roles.

---

## W7 · Pantalla de firma accesible — **Medium**

**Depende de:** W1.

**Qué hacer.** Un componente que muestre `UnsignedTransaction.summary` en lenguaje sencillo (y en voz, si el modo lo permite), pida el PIN con botones grandes y explique qué pasa si se cancela. Debe seguir las pautas de accesibilidad del Hito 1.2 (`docs/ux-testing/`).

**Criterios de aceptación.**
- [ ] Botones de al menos 56 px, contraste AA y textos de máximo 2 renglones.
- [ ] Cancelar no envía nada.
- [ ] Prueba de usabilidad con al menos 2 personas, documentada **sin nombres** (`PRIVACIDAD.md`).

---

## W8 · Enlace al explorador y etiqueta automática — **Trivial**

**Depende de:** W3.

**Qué hacer.** En el pasaporte digital, si el comprobante es `source: 'testnet'`, muestra "Ver en Stellar" con `explorerUrl`. Si es `simulated`, muestra `<DemoBadge />` y ningún enlace.

---

## W9 · Cola offline de transacciones firmadas — **Medium**

**Depende de:** W3.

**Contexto.** En las parcelas no hay señal. `src/core/sync/SyncEngine.ts` hoy solo simula con `setTimeout`.

**Qué hacer.** Guarda en IndexedDB las transacciones **ya firmadas** y envíalas al volver la conexión, con reintentos (*backoff* exponencial). Considera que una transacción firmada caduca (`timeBounds`): si caducó, pide volver a firmar.

**Criterios de aceptación.**
- [ ] Recargar la página no pierde la cola.
- [ ] Pruebas de reintento, de transacción caducada y de envío duplicado.

---

## W10 · `attestation_registry`: almacenamiento temporal y persistente — **Medium** (Rust)

> **Cerrada (29 de octubre de 2026):** las atestaciones pasan a Attest Protocol y `attestation_registry` no se redespliega ([ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md)).

**Qué hacer.** Las atestaciones de tránsito (pesaje, humedad) van a `temporary()` con TTL corto; las de origen van a `persistent()`. Agrega el tipo de almacenamiento al esquema y extiende el TTL de forma coherente.

**Criterios de aceptación.**
- [ ] Pruebas que avanzan el ledger y confirman que una atestación temporal expira y una persistente no.
- [ ] `cargo fmt`, `cargo clippy -D warnings` y `cargo test` pasan.

---

## W11 · Pruebas negativas de contratos — **Trivial** (Rust)

**Qué hacer.** Agrega pruebas con `try_...` y `assert_eq!(res, Err(Ok(Error::X)))` para casos aún no cubiertos. Por ejemplo:
- `lot_passport`: registrar sin la firma del productor (usa `mock_auths` selectivo, no `mock_all_auths`).
- `attestation_registry`: revocar una atestación de un esquema irrevocable.
- `perpetual_royalties`: reventa con token sin saldo.

**Criterios de aceptación.**
- [ ] Al menos 5 pruebas nuevas, todas con nombre descriptivo en español.

---

## Issues de investigación (no van a la Wave)

- **Resguardo de la tarjeta de recuperación:** con la comunidad, decidir quién guarda la tarjeta y cómo se recupera una cuenta. Entregable: un documento sin nombres de participantes.
- **Validación del PIN vs. llaves de acceso (*passkeys*)** con personas mayores.
