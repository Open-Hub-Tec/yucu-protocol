# Arquitectura de Yucu Protocol

* **Estado:** prototipo en Stellar **testnet**. La tabla "Qué es real y qué es simulado" del [`README.md`](../README.md) dice el estado de cada módulo.
* **Decisiones que manda este documento:** [ADR-001](./adr/ADR-001-TRUSTLESS-WORK-ESCROW.md) (escrow con Trustless Work), [ADR-002](./adr/ADR-002-OFFLINE-FIRST-PWA-AND-RURAL-IDENTITY.md) (PWA sin señal y tarjeta QR), [ADR-003](./adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md) (no custodial) y [ADR-004](./adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) (la artesana cobra en pesos con una cuenta invisible), [ADR-005](./adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) (atestaciones en Attest Protocol, con el índice y las reglas de Yucu), [ADR-006](./adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md) (datos fuera de la cadena e IA), [ADR-007](./adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) (motor de atestaciones por voz y texto) y [ADR-008](./adr/ADR-008-COMMUNICATION-CHANNELS-AND-WHATSAPP-ALTERNATIVES.md) (chat propio en lugar de WhatsApp). Si algo de aquí contradice un ADR, manda el ADR.

---

## 1. Principios

1. **No custodial de punta a punta.** Ni Yucu ni el grupo generan, guardan ni reciben la llave de nadie, y nunca retienen dinero. La artesana firma y recibe en su propia cuenta.
2. **Preparar → firmar en el teléfono → enviar.** El servidor (o la API de Trustless Work) prepara una transacción sin firmar; la persona la firma en su dispositivo; después se envía.
3. **La artesana solo ve pesos.** Su cuenta Stellar es invisible: la interfaz nunca muestra "billetera", USDC, XLM, direcciones, hashes ni llaves.
4. **Lo mínimo en la cadena.** Municipio o región, catálogos cerrados, volumen por rangos, hash de la foto y ningún monto ni nombre.
5. **La UI solo habla con los puertos** de `src/core/chain/`. Así se puede pasar de la versión simulada a testnet sin cambiar pantallas.
6. **La IA habla, la persona firma, la cadena prueba.** La persona habla o escribe; la IA prepara un borrador y lo lee en voz alta; la persona confirma y firma. La IA nunca firma ni certifica (ADR-007).
7. **Atestaciones sobre Attest Protocol.** Yucu no despliega un registro propio: agrega un índice abierto (listas y contadores, sin indexador) y sus reglas (ADR-005).

## 2. Capas

```
┌──────────────────────────────────────────────────────────────────────┐
│ Teléfono (PWA, React)                                                │
│  Chat por voz o texto · pantallas para personas mayores              │
│  Funciona sin señal (IndexedDB)                                      │
│  Llave de la artesana cifrada con su PIN, o en su tarjeta QR         │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ solo a través de los puertos
┌───────────────────────────────▼──────────────────────────────────────┐
│ Puertos (src/core/chain/ports.ts)                                    │
│  WalletPort · LotRegistryPort · AttestationPort · EscrowPort         │
│  PayoutPort · puertos de IA, catálogo y sesión (src/core/)           │
│  Versión simulada (SimulatedChain.ts, source: 'simulated')           │
│  Versión testnet (en construcción)                                   │
└───────┬──────────────────────┬──────────────────────┬────────────────┘
        │                      │                      │
┌───────▼────────┐   ┌─────────▼─────────┐   ┌────────▼──────────────┐
│ Servidor       │   │ Trustless Work    │   │ Salida a pesos        │
│ (server.ts y   │   │ (API, testnet)    │   │ MicoPay (efectivo)    │
│ src/server/)   │   │                   │   │                       │
│ Prepara sin    │   │ Escrow multi-     │   │ Etherfuse (SPEI)      │
│ firmar; firma  │   │ release; prepara  │   │ Desde la cuenta de    │
│ solo como      │   │ sin firmar        │   │ la artesana           │
│ certificador;  │   │                   │   │                       │
│ IA que prepara;│   │                   │   │                       │
│ PostgreSQL     │   │                   │   │                       │
└───────┬────────┘   └─────────┬─────────┘   └───────────────────────┘
        │                      │
┌───────▼──────────────────────▼───────────────────────────────────────┐
│ Stellar / Soroban (testnet)                                          │
│  lot_passport · perpetual_royalties · Attest Protocol + índice Yucu  │
│  (fair_escrow es material didáctico: la app no lo usa)               │
└──────────────────────────────────────────────────────────────────────┘
```

## 3. Quién firma qué

| Actor | Cuenta | Qué firma | ¿Recibe dinero? |
|---|---|---|---|
| **Artesana** | Propia e invisible. Llave en su celular con PIN de 4 dígitos, o en su tarjeta QR con PIN de 6 | El registro de su lote y sus retiros a pesos | **Sí**, directo en su cuenta |
| Grupo o promotora | Propia | Marca un pedido como "enviado" y pone el sello comunitario de las regalías | No |
| Certificador (servidor) | Llave de la plataforma, en `.env` | Su parte del registro y la certificación de lotes | No |
| Comprador del extranjero | Su propia billetera | El pago al escrow y la aprobación de hitos | No |
| Quien resuelve disputas | Un tercero (nunca Yucu) | El reparto en una disputa | No |
| Entidad que opera Yucu (constituida, con RFC) | Propia, solo para cobrar | Nada que mueva el dinero de otros | Solo su comisión, encima del precio, al liberarse el pago (ADR-004 D11) |

## 4. Flujos

### Fase 1: registrar un lote (aceptada)

1. La artesana **habla o escribe** en el chat ("Tengo 20 kilos de café de Yosondúa"). La IA transcribe y llena solo los campos permitidos; lo que no entendió lo deja vacío y lo vuelve a preguntar. La app le lee en voz alta lo que entendió, con botones Sí y No, y ella puede corregir con voz o con el dedo (ADR-006 D3, #155). Sin señal, los **datos** quedan en IndexedDB y el audio solo hasta transcribirlo; no se guardan transacciones firmadas, porque vencen en minutos.
2. Con señal, el servidor prepara `register_lot` y firma **solo como certificador**.
3. El teléfono arma el resumen a partir de la transacción y la artesana firma con su PIN (o con su tarjeta QR en el celular de la promotora).
4. Se envía. La artesana ve "Tu pieza quedó registrada" y el QR de origen de su lote.

**Compradores en México:** pagan directo en pesos (SPEI o efectivo). Ese dinero no pasa por Stellar; en la cadena solo va el pasaporte del lote.

### Atestaciones (testnet)

1. Cualquier afirmación con su manifiesto (consentimiento, origen comunitario, colaboración, entrega, pesaje) sigue el mismo flujo: habla o escribe → la IA prepara → lectura en voz alta → firma con `AttestationPort`.
2. La atestación queda en Attest Protocol. El índice de Yucu la agrega a sus listas y, si el esquema tiene reglas, las consulta (por ejemplo, una colaboración exige el consentimiento vigente de la artesana).
3. Cualquiera la comprueba en el verificador público (#142), que lee la red directamente, o pregunta en lenguaje natural y recibe una respuesta que cita la prueba (#165). Los asistentes de IA de tiendas y marcas usan el servidor MCP (#166).
4. La artesana puede revocar su consentimiento; desde ese momento, las colaboraciones que dependen de él dejan de valer.

### Fase 2: compra protegida (solo testnet)

1. El comprador paga USDC desde su propia billetera a un escrow *multi-release* de Trustless Work. Su app comprueba el escrow en la cadena antes de pagar. **La receptora de cada hito es la artesana**, y la comisión de la plataforma va encima del precio.
2. Por defecto hay **un solo hito**: el grupo marca "enviado", el comprador confirma que recibió y aprueba.
3. A la artesana le llega "Ya te pagaron. Toca para recibir" y libera el pago con su PIN. Su parte y la comisión se reparten en la misma transacción.
4. Si el comprador no aprueba, se puede abrir disputa 15 días después de "enviado" (plazo de la app). Resuelve un tercero.
5. Hay una plantilla "con adelanto" (varios hitos) por si las artesanas la necesitan.
6. Para cobrar en efectivo, la artesana va a la tienda, toca "Ya estoy en la tienda" y firma el retiro con su PIN. Recibe un QR que vale 15 minutos. Quien tiene RFC y banco puede cobrar por SPEI.

Los porcentajes, el plazo y las comisiones salen de [`src/config/protocolFees.ts`](../src/config/protocolFees.ts).

## 5. Mapa del código

| Ruta | Qué hay |
|---|---|
| `src/components/` | Pantallas React |
| `src/core/chain/` | Puertos y su versión simulada. Aquí se agregan las versiones de testnet |
| `src/core/` | Lógica de negocio: cripto, políticas de comercio justo, IA, sincronización |
| `src/config/protocolFees.ts` | Porcentajes oficiales del protocolo |
| `server.ts`, `src/server/` | Servidor Express: IA (Gemini) y preparación de transacciones sin firmar. Reglas en [`arquitectura/SERVIDOR.md`](./arquitectura/SERVIDOR.md) y tablas en [`arquitectura/BASE_DE_DATOS.md`](./arquitectura/BASE_DE_DATOS.md) |
| `contracts/` | Contratos Soroban en Rust |
| `contracts/deployments/testnet.json` | IDs de los contratos desplegados en testnet |
| `docs/adr/` | Decisiones de arquitectura |

## 6. Qué falta

El trabajo pendiente está en las issues de GitHub con la etiqueta `drips-eligible`. El [ADR-004](./adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) (sección 4) dice qué issue cubre cada pieza, y su sección 5 dice qué hay que resolver antes de usar dinero real.

Los diagramas de la arquitectura v2 (capas, firma, dinero y atestaciones) y cada pieza con sus issues están en [`arquitectura/`](./arquitectura/README.md). La issue fijada "Por dónde empezar (estudiantes)" (#152) dice el orden de trabajo.
