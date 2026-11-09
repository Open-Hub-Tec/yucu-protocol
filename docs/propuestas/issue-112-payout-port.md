# Propuesta de solución — Issue #112

## `PayoutPort`: salida a pesos con versión simulada

**Issue:** <https://github.com/Open-Hub-Tec/yucu-protocol/issues/112>
**Estado:** propuesta para revisión. Este documento no implementa el puerto.
**Rama de la propuesta:** `docs/issue-112-payout-port-propuesta`
**Rama de implementación sugerida:** `feat/issue-112-payout-port`

---

## 0. Skills de Yucu consultadas

| Skill | Uso en esta propuesta |
|---|---|
| [`skills/stellar-soroban-rwa/SKILL.md`](../../skills/stellar-soroban-rwa/SKILL.md) | Capa de puertos, `PayoutPort`, MicoPay/Etherfuse, fee-bump CAP-15, USDC SEP-41 y regla de no ser ancla |
| [`skills/student-git-collaboration/SKILL.md`](../../skills/student-git-collaboration/SKILL.md) | Rama `feat/issue-112-...`, prefijos de commit, `npm run verify` y `Resolves #112` |
| [`skills/student-rwa-attestations/SKILL.md`](../../skills/student-rwa-attestations/SKILL.md) | No aplica: esta issue no emite atestaciones |
| [`skills/student-soroban-contracts/SKILL.md`](../../skills/student-soroban-contracts/SKILL.md) | No aplica: esta issue no toca contratos Rust |
| [`skills/student-offline-pwa/SKILL.md`](../../skills/student-offline-pwa/SKILL.md) | Se usará después, cuando la pantalla de retiro se conecte al puerto; el retiro en sí requiere conexión |

Las reglas de [`AGENTS.md`](../../AGENTS.md) siguen mandando sobre las skills.

---

## 1. Qué pide la issue

Agregar a `src/core/chain/ports.ts` un puerto `PayoutPort` con el patrón no custodial
**preparar → firmar en el teléfono → enviar**:

| Método | Responsabilidad |
|---|---|
| `quote(amountUsdc)` | Cuántos pesos netos recibiría la artesana |
| `prepareCashout(req)` | Preparar el retiro **desde su cuenta** hacia una tienda, sin nombres ni llaves |
| `submit(signedXdr)` | Enviar lo firmado y devolver código/QR y vencimiento |
| `getStatus(id)` | `pending`, `ready`, `collected`, `expired` o `refunded`, con `source` |

Además:

- `SimulatedPayout` en `SimulatedChain.ts`, único lugar donde se permite inventar resultados,
  con `source: 'simulated'`.
- Exponerlo como `chain.payout` en `src/core/chain/index.ts`.
- Regla extra de la tarjeta QR: con `walletKind: 'card'`, el código debe vencer en
  **15 minutos o menos**; uno de 24 a 72 horas se rechaza.
- Pruebas en `src/tests/chain_ports.test.ts`: `ready → collected`, vencido → `refunded`,
  monto menor o igual a cero rechazado, tarjeta con 15 minutos aceptada y con 24 horas rechazada.

---

## 2. Estado actual del repositorio

| Archivo | Estado |
|---|---|
| `src/core/chain/ports.ts` | Termina en `EscrowPort`; no existe `PayoutPort` |
| `src/core/chain/index.ts` | Tiene el comentario `// La salida a pesos (payout: PayoutPort) la agrega #112` |
| `src/core/chain/SimulatedChain.ts` | Solo billeteras, lotes y escrow |
| `src/tests/chain_ports.test.ts` | Cubre esos puertos; no hay pruebas de payout |
| `README.md` | Ya lista `PayoutPort` y dice que `HybridSettlementOrchestrator` es simulado y debe reemplazarse |
| `docs/arquitectura/README.md` | Dice `PayoutPort · Por construir · W18 #112` |

**No reutilizar `HybridSettlementOrchestrator`.** Ese archivo recibe `producerName`, genera
folios SPEI falsos y guarda destinos con nombre. El nuevo puerto debe trabajar solo con
direcciones `G…`, montos y un `storeId`.

Tampoco se debe tocar `MyPaymentsModal` en este issue: hoy genera claves de cajero falsas.
Eso es una pantalla aparte; cuando se conecte al puerto deberá mostrar `<DemoBadge />` y usar
`source`.

---

## 3. Decisiones de diseño

### 3.1. Flujo no custodial

```text
UI                    PayoutPort                 Billetera de la artesana
 │  quote(amount) ─────────▶
 │  prepareCashout(req) ───▶ UnsignedTransaction
 │  sign(tx, PIN) ─────────────────────────────────────▶ firma en el dispositivo
 │  submit(signedXdr) ─────▶ CashoutReceipt (código/QR)
 │  getStatus(payoutId) ──▶ estado
```

El puerto **nunca firma, nunca recibe llaves privadas y nunca recibe el nombre de la persona**.
La firma la hace `chain.wallets.device.sign(...)` o `chain.wallets.card.sign(...)`, según el
`walletKind`.

### 3.1.1. Reglas de `stellar-soroban-rwa` que aplican

- `PayoutPort` es la capa de salida a pesos. Los proveedores quedan detrás: **MicoPay para
  efectivo** (HTLC) y **Etherfuse para SPEI** (ADR-004, D9).
- **Yucu no es un ancla SEP-24/38.** No custodia pesos ni recibe fondos de personas; solo
  prepara, hace firmar y envía. La conversión y la entrega de efectivo las hace el proveedor.
- El activo que se retira es **USDC SEP-41**. El adaptador real debe revisar trustline y saldo
  antes de preparar la transacción; si falta algo, se avisa antes de firmar, no después.
- La comisión de red se cubre con **fee-bump CAP-15**: la llave del patrocinador vive solo en
  el `.env` del servidor y solo paga comisiones. Antes de envolver, el servidor valida la
  transacción contra la lista blanca de #94 para que nadie pueda vaciar al patrocinador.
- El servidor **prepara transacciones sin firmar**; nunca recibe la llave de la artesana ni
  retiene su dinero.
- El estado del retiro se guarda en **PostgreSQL**, no en memoria: en Vercel cada petición puede
  caer en otra instancia (`BASE_DE_DATOS.md`).

### 3.2. Semántica de `expired` y `refunded`

La issue incluye los dos estados, pero no dice cuándo ocurre cada uno. Se propone esta máquina
explícita:

| Estado | Significado |
|---|---|
| `pending` | El proveedor todavía no genera el código |
| `ready` | Código listo para cobrar en la tienda |
| `collected` | La artesana ya cobró |
| `expired` | El código venció, pero el reembolso aún no está confirmado |
| `refunded` | El dinero ya regresó a su cuenta |

En la simulación el reembolso es inmediato, así que `getStatus()` después del vencimiento
devuelve directamente `refunded`. `expired` queda reservado para un proveedor real que tarde en
confirmar la devolución. Así se cumple el criterio “un retiro vencido se vuelve `refunded`” sin
dejar estados muertos.

### 3.3. `walletKind`

- `device`: teléfono de la artesana.
- `card`: tarjeta QR leída en el celular de la promotora; **solo cobro presencial**, código de
  15 minutos o menos.
- `external`: billetera del comprador. **Se rechaza**: el retiro debe salir de la cuenta de la
  artesana, no de la de otra persona.

La regla de los 15 minutos se valida dos veces: al preparar y al enviar, por si el proveedor
devuelve otra vigencia.

### 3.4. Dinero y comisiones

`quote` debe separar claramente:

- `amountUsdc`
- `rateMxnPerUsdc` (en simulación es un valor inventado, marcado con `source: 'simulated'`)
- `providerFeeMxn`
- `netAmountMxn`

No se escribe ningún porcentaje a mano. En la simulación la comisión del proveedor es cero y la
de Yucu en retiros también (ADR-004, D11). Si un proveedor real cobra, la comisión se muestra en
pesos **antes** de firmar; nunca se esconde ni se descuenta del precio de la artesana.

### 3.5. Simulación determinista

`SimulatedPayout` debe recibir un reloj inyectable:

```ts
constructor(private readonly now: () => number = Date.now) {}
```

Así las pruebas avanzan 15 minutos sin usar `setTimeout` ni esperar de verdad. Los ayudantes
`markCollected()` y `expireNow()` son **solo de demostración** y no forman parte de
`PayoutPort`.

---

## 4. Propuesta de tipos

En `src/core/chain/ports.ts`:

```ts
// ─────────────────────────────── Salida a pesos (PayoutPort) ───────────────────────────────

/** Estados de un retiro. `expired` = código vencido sin reembolso confirmado. */
export type PayoutStatus = 'pending' | 'ready' | 'collected' | 'expired' | 'refunded';

export interface PayoutQuote {
  source: ChainSource;
  amountUsdc: number;
  /** Pesos mexicanos por 1 USDC. En la simulación es un valor inventado. */
  rateMxnPerUsdc: number;
  /** Comisión del proveedor en pesos. Yucu no cobra comisión de socio en retiros. */
  providerFeeMxn: number;
  /** Pesos que recibe la artesana en la mano. */
  netAmountMxn: number;
  /** Vigencia máxima que permite el proveedor para el código. Para efectivo, 15 minutos. */
  maxExpiryMinutes: number;
}

export interface CashoutRequest {
  /** Dirección pública G... de la artesana. Nunca su nombre, teléfono ni llave. */
  producerAddress: string;
  /** USDC a retirar; debe ser mayor que 0. */
  amountUsdc: number;
  /** ID de la tienda o punto de cobro del proveedor. Nunca el nombre de una persona. */
  storeId: string;
  /** 'device' o 'card'. 'external' se rechaza: no es la cuenta de la artesana. */
  walletKind: WalletKind;
  /** Minutos que vale el código. Por defecto, 15. */
  expiresInMinutes?: number;
}

export interface CashoutReceipt extends ChainReceipt {
  payoutId: string;
  /** Código o contenido del QR. Es un dato sensible: no se registra en logs. */
  cashoutCode: string;
  netAmountMxn: number;
  /** Momento (ms) en que vence. Si no se cobra, el dinero regresa a su cuenta. */
  expiresAt: number;
}

export interface PayoutState {
  payoutId: string;
  status: PayoutStatus;
  netAmountMxn: number;
  expiresAt: number;
  collectedAt?: number;
  refundedAt?: number;
  source: ChainSource;
}

export interface PayoutPort {
  /** Cuántos pesos netos recibiría por `amountUsdc`. Rechaza montos <= 0. */
  quote(amountUsdc: number): Promise<PayoutQuote>;
  /** Prepara el retiro desde la cuenta de la artesana hacia una tienda. */
  prepareCashout(req: CashoutRequest): Promise<UnsignedTransaction>;
  /** Envía lo firmado y devuelve el código/QR con su vencimiento. */
  submit(signedXdr: string): Promise<CashoutReceipt>;
  /** Estado del retiro, con `source`. */
  getStatus(id: string): Promise<PayoutState>;
}
```

`PayoutState` **no incluye la dirección de la artesana**, solo el `payoutId`. Así el estado no
filtra datos que la pantalla no necesita.

---

## 5. Implementación simulada propuesta

En `src/core/chain/SimulatedChain.ts`:

```ts
const DEMO_MXN_PER_USDC = 18.5; // Solo demostración: no es una cotización real.
const CASHOUT_MINUTES = 15;

interface DemoPayoutRecord {
  payoutId: string;
  status: PayoutStatus;
  netAmountMxn: number;
  expiresAt: number;
  collectedAt?: number;
  refundedAt?: number;
}

interface DemoCashoutPayload {
  op?: string;
  walletKind?: WalletKind;
  expiresInMinutes?: number;
  netAmountMxn?: number;
}

export class SimulatedPayout implements PayoutPort {
  private readonly payouts = new Map<string, DemoPayoutRecord>();
  private readonly receiptsByXdr = new Map<string, CashoutReceipt>();
  private seq = 0;

  /** El reloj se inyecta para probar el vencimiento sin esperar 15 minutos. */
  constructor(private readonly now: () => number = Date.now) {}

  async quote(amountUsdc: number): Promise<PayoutQuote> {
    if (!Number.isFinite(amountUsdc) || amountUsdc <= 0) {
      throw new Error('El monto a retirar debe ser mayor que cero.');
    }
    const netCents = Math.round(amountUsdc * DEMO_MXN_PER_USDC * 100);
    return {
      source: 'simulated',
      amountUsdc,
      rateMxnPerUsdc: DEMO_MXN_PER_USDC,
      providerFeeMxn: 0,
      netAmountMxn: netCents / 100,
      maxExpiryMinutes: CASHOUT_MINUTES,
    };
  }

  async prepareCashout(req: CashoutRequest): Promise<UnsignedTransaction> {
    if (!Number.isFinite(req.amountUsdc) || req.amountUsdc <= 0) {
      throw new Error('El monto a retirar debe ser mayor que cero.');
    }
    if (!req.producerAddress.startsWith('G')) {
      throw new Error('La cuenta de origen no es una dirección pública válida.');
    }
    const storeId = req.storeId.trim();
    if (!storeId) {
      throw new Error('Elige la tienda donde vas a cobrar.');
    }
    if (req.walletKind === 'external') {
      throw new Error('El retiro se hace desde tu teléfono o tu tarjeta, no desde la billetera de otra persona.');
    }

    const minutes = req.expiresInMinutes ?? CASHOUT_MINUTES;
    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new Error('El código debe durar un número entero de minutos mayor que cero.');
    }
    if (req.walletKind === 'card' && minutes > CASHOUT_MINUTES) {
      throw new Error('Con tu tarjeta, el código solo puede durar 15 minutos o menos.');
    }

    const quote = await this.quote(req.amountUsdc);
    return demoTx(
      `Vas a retirar $${quote.netAmountMxn.toFixed(2)} pesos en la tienda ${storeId}. ` +
        `El código vence en ${minutes} minutos. Si no lo cobras, el dinero regresa a tu cuenta.`,
      {
        op: 'cashout',
        walletKind: req.walletKind,
        expiresInMinutes: minutes,
        netAmountMxn: quote.netAmountMxn,
      },
    );
  }

  async submit(signedXdr: string): Promise<CashoutReceipt> {
    const previous = this.receiptsByXdr.get(signedXdr);
    if (previous) return previous;

    let payload: DemoCashoutPayload;
    try {
      payload = JSON.parse(decodeURIComponent(escape(atob(signedXdr)))) as DemoCashoutPayload;
    } catch {
      throw new Error('La transacción firmada no es válida.');
    }

    const minutes = payload.expiresInMinutes;
    if (
      payload.op !== 'cashout' ||
      payload.walletKind === 'external' ||
      typeof minutes !== 'number' ||
      !Number.isInteger(minutes) ||
      minutes <= 0 ||
      typeof payload.netAmountMxn !== 'number'
    ) {
      throw new Error('La transacción firmada no corresponde a un retiro en pesos.');
    }
    if (payload.walletKind === 'card' && minutes > CASHOUT_MINUTES) {
      throw new Error('Con tarjeta, el código no puede durar más de 15 minutos.');
    }

    const payoutId = `RETIRO-${++this.seq}`;
    const expiresAt = this.now() + minutes * 60_000;
    const receipt: CashoutReceipt = {
      ...demoReceipt(),
      payoutId,
      cashoutCode: `YUCU-COBRO-${randomHex(4).toUpperCase()}`,
      netAmountMxn: payload.netAmountMxn,
      expiresAt,
    };
    this.payouts.set(payoutId, {
      payoutId,
      status: 'ready',
      netAmountMxn: payload.netAmountMxn,
      expiresAt,
    });
    this.receiptsByXdr.set(signedXdr, receipt);
    return receipt;
  }

  async getStatus(id: string): Promise<PayoutState> {
    const record = this.require(id);
    if ((record.status === 'pending' || record.status === 'ready') && this.now() >= record.expiresAt) {
      // En la simulación el reembolso es inmediato.
      record.status = 'refunded';
      record.refundedAt = this.now();
    }
    return { ...record, source: 'simulated' };
  }

  /** Solo demostración: simula que la artesana cobró el efectivo en la tienda. */
  markCollected(id: string): PayoutState {
    const record = this.require(id);
    if (record.status === 'collected') return { ...record, source: 'simulated' };
    if (record.status !== 'ready' || this.now() >= record.expiresAt) {
      if (record.status === 'ready') {
        record.status = 'refunded';
        record.refundedAt = this.now();
      }
      throw new Error('El código ya venció; el dinero regresó a la cuenta de la artesana.');
    }
    record.status = 'collected';
    record.collectedAt = this.now();
    return { ...record, source: 'simulated' };
  }

  private require(id: string): DemoPayoutRecord {
    const record = this.payouts.get(id);
    if (!record) throw new Error(`No encontramos el retiro ${id}.`);
    return record;
  }
}
```

Y en `src/core/chain/index.ts`:

```ts
import type {
  CardWalletPort,
  DeviceWalletPort,
  EscrowPort,
  ExternalWalletPort,
  LotRegistryPort,
  PayoutPort,
} from './ports';

import {
  SimulatedCardWallet,
  SimulatedEscrow,
  SimulatedExternalWallet,
  SimulatedLotRegistry,
  SimulatedPayout,
  SimulatedWallet,
} from './SimulatedChain';

export interface Chain {
  // ...
  /** Salida a pesos desde la cuenta de la artesana (#112, ADR-004 D9). */
  payout: PayoutPort;
}

export const chain: Chain = {
  // ...
  payout: new SimulatedPayout(),
};
```

### 5.1. Notas para el adaptador real (fuera del alcance de #112)

La simulación no toca la red. El adaptador real de #114, #145 y #146 debe seguir estas reglas de
la skill `stellar-soroban-rwa`:

1. **Efectivo (MicoPay):** preparar el retiro con el HTLC de MicoPay desde la cuenta de la
   artesana. El código o QR lo emite el proveedor; Yucu no lo inventa.
2. **SPEI (Etherfuse):** solo si la artesana lo elige y tiene RFC y cuenta bancaria a su nombre.
   El alta y el KYC van en un flujo aparte (ADR-004, D9).
3. **USDC SEP-41:** revisar trustline y saldo antes de preparar. Si no hay trustline, avisar en
   español claro antes de pedir el PIN.
4. **Fee-bump CAP-15:** el servidor envuelve la transacción ya firmada y paga la comisión de red.
   La llave del patrocinador vive solo en `.env`, nunca en el teléfono ni en el repositorio, y la
   transacción se valida contra la lista blanca de #94 antes de envolverla.
5. **Persistencia:** guardar `payoutId`, estado y vencimiento en PostgreSQL. No usar memoria
   (Vercel cambia de instancia) y no guardar el código de cobro en claro ni en logs.
6. **Idempotencia:** usar una clave por intento para que un reintento no cree dos retiros.
7. **Estado:** consultar al proveedor por webhook o polling y mapear la respuesta a
   `pending`, `ready`, `collected`, `expired` o `refunded`.
8. **Rutas:** si hace falta un endpoint propio, va en `src/server/routes/`, un archivo por área,
   siguiendo `SERVIDOR.md`.
9. **Nunca ser ancla:** Yucu no implementa SEP-24/38 ni guarda pesos. Eso lo hace el proveedor.

---

## 6. Validaciones que debe cubrir

| Regla | Dónde | Error esperado |
|---|---|---|
| `amountUsdc` finito y mayor que cero | `quote`, `prepareCashout` | “El monto a retirar debe ser mayor que cero.” |
| Dirección pública `G…` | `prepareCashout` | “La cuenta de origen no es una dirección pública válida.” |
| `storeId` no vacío | `prepareCashout` | “Elige la tienda donde vas a cobrar.” |
| `walletKind: 'external'` rechazado | `prepareCashout`, `submit` | “El retiro se hace desde tu teléfono o tu tarjeta…” |
| Vigencia entera y mayor que cero | `prepareCashout` | “El código debe durar un número entero de minutos…” |
| Tarjeta con vigencia mayor a 15 minutos | `prepareCashout`, `submit` | “Con tu tarjeta, el código solo puede durar 15 minutos o menos.” |
| XDR de otra operación | `submit` | “La transacción firmada no corresponde a un retiro…” |
| `payoutId` desconocido | `getStatus` | “No encontramos el retiro…” |
| `submit` repetido con el mismo XDR | `submit` | Devuelve el mismo comprobante, no crea otro retiro |

La validación de dirección en la simulación puede ser solo `startsWith('G')`; el adaptador real
debe usar `StrKey` de `@stellar/stellar-sdk` en el servidor, no en la UI.

---

## 7. Pruebas propuestas

En `src/tests/chain_ports.test.ts`, con un reloj falso:

```ts
let now = 1_700_000_000_000;
const payout = new SimulatedPayout(() => now);
```

### Positivas

1. `chain.payout` existe y es un `PayoutPort`.
2. `quote(20)` devuelve `source: 'simulated'`, `providerFeeMxn: 0`, `netAmountMxn: 370` y
   `maxExpiryMinutes: 15`.
3. `prepareCashout` genera un resumen con el monto y la tienda, **sin la dirección ni nombres**.
4. `submit` devuelve `payoutId`, `cashoutCode`, `expiresAt` y `source: 'simulated'`.
5. `getStatus` inicia en `ready`.
6. `markCollected` y luego `getStatus` devuelven `collected`.
7. `walletKind: 'card'` con 15 minutos se acepta.
8. Dos `submit` con el mismo XDR devuelven el mismo `payoutId`.

### Negativas

1. `quote(0)` y `quote(-1)` se rechazan.
2. `prepareCashout` con monto cero o negativo se rechaza.
3. `walletKind: 'external'` se rechaza.
4. `walletKind: 'card'` con `24 * 60` minutos se rechaza.
5. `expiresInMinutes` en cero, negativo o no entero se rechaza.
6. `storeId` vacío se rechaza.
7. `getStatus` con un id inexistente se rechaza.
8. `submit` con el XDR de un lote se rechaza.
9. Con el reloj avanzado 15 minutos, `getStatus` devuelve `refunded`; `markCollected` después
   del vencimiento falla y el estado sigue en `refunded`.
10. Llamar `markCollected` dos veces **no** convierte un retiro cobrado en reembolsado.

---

## 8. Archivos y plan de trabajo

| Archivo | Cambio |
|---|---|
| `src/core/chain/ports.ts` | Agregar tipos y `PayoutPort` |
| `src/core/chain/SimulatedChain.ts` | Agregar `SimulatedPayout` |
| `src/core/chain/index.ts` | Exponer `chain.payout` |
| `src/tests/chain_ports.test.ts` | Pruebas positivas y negativas |
| `docs/arquitectura/README.md` | Cambiar `PayoutPort · Por construir` a `PayoutPort · Existe (simulado)` |

`README.md` no requiere cambio: la fila de `PayoutPort` ya existe.

### Pasos

1. Pedir asignación de #112 antes de escribir código.
2. Crear rama `feat/issue-112-payout-port`, sin nombres de personas en el nombre de la rama.
3. Implementar tipos, simulación y exposición.
4. Escribir las pruebas.
5. Ejecutar `npm ci` y `npm run verify` (lint + test + build).
6. Abrir PR con `Resolves #112`, explicar el flujo no custodial y cómo se probó.
7. No tocar `contracts/` ni `package.json`.

Los commits deben llevar prefijo (`feat:`, `fix:`, `docs:` o `test:`) según la skill
`student-git-collaboration`. Esta propuesta vive en una rama `docs/`; la implementación va en la
rama `feat/` para no mezclar documentación con código.

---

## 9. Antecedentes y diferencias con el PR de referencia #189

El PR #189 ya esboza una solución y sirve para ver el flujo, pero conviene no copiarlo tal cual:

| Punto | Problema a evitar |
|---|---|
| `markCollected()` | Si se llama sobre un retiro ya `collected`, lo cambia a `refunded` y luego lanza error. Un cobro exitoso no debe poder “deshacerse”. |
| `expire()` | Escribe `refunded` directamente y hace que `getStatus` nunca observe `expired`; el estado queda en el tipo pero es inalcanzable. |
| `walletKind` | Acepta `'external'` sin rechazarlo; un retiro podría prepararse desde la billetera del comprador. |
| Pruebas de vencimiento | Usan un método que fuerza el estado en vez de avanzar el reloj, así que no prueban la transición real por tiempo. |
| Idempotencia | Un `submit` repetido crea otro retiro. |
| Validación de dirección | Solo `startsWith('G')`; aceptable en simulación, pero debe documentarse que el adaptador real usa `StrKey`. |

La propuesta de este documento corrige esos puntos y mantiene el alcance pequeño.

---

## 10. Fuera de alcance de #112

- Conectar `MyPaymentsModal` al puerto. Es una pantalla distinta; cuando se haga, debe usar
  `chain.payout`, mostrar `source` y `<DemoBadge />` cuando sea `'simulated'`.
- Implementar MicoPay o Etherfuse reales. Eso son #114, #145 y #146.
- Retiros por SPEI. Este issue es efectivo en tienda; el puerto queda preparado para agregar el
  método después.
- Persistir retiros en base de datos. La simulación vive en memoria; el adaptador real necesita
  las tablas de `BASE_DE_DATOS.md`.
- Reemplazar `HybridSettlementOrchestrator`. Se puede marcar como obsoleto en otro issue, pero no
  usarlo aquí.

---

## 11. Cómo cumple los criterios de aceptación

| Criterio | Cómo se cumple |
|---|---|
| Todo resultado lleva `source` | `PayoutQuote`, `CashoutReceipt` (hereda de `ChainReceipt`) y `PayoutState` |
| Sin llaves ni nombres | Solo `producerAddress` (`G…`), `storeId`, monto y `walletKind`; el resumen no incluye la dirección |
| `ready → collected` | `submit` crea `ready`; `markCollected` y `getStatus` lo pasan a `collected` |
| Vencido → `refunded` | Reloj falso avanza 15 minutos; `getStatus` devuelve `refunded` |
| Monto menor o igual a cero rechazado | `quote` y `prepareCashout` |
| Tarjeta con 15 minutos aceptada | `prepareCashout` con `walletKind: 'card'` y `expiresInMinutes: 15` |
| Tarjeta con 24 horas rechazada | `prepareCashout` con `walletKind: 'card'` y `expiresInMinutes: 1440` |
| Expuesto en `chain` | `chain.payout: PayoutPort` |

---

## 12. Preguntas abiertas para el equipo

1. ¿Se acepta que `expired` quede reservado para proveedores reales y que la simulación devuelva
   `refunded` de inmediato?
2. ¿El `rateMxnPerUsdc` de demostración debe ser una constante del archivo o un parámetro del
   constructor de `SimulatedPayout` para poder probar distintos escenarios?
3. ¿Se agrega `provider: 'micopay'` al comprobante desde este issue, o se deja para el adaptador
   real de #114?
4. ¿La pantalla de pagos se conecta en un issue aparte para no mezclar UI con puertos?

---

## 13. Referencias

- [`AGENTS.md`](../../AGENTS.md)
- [`skills/stellar-soroban-rwa/SKILL.md`](../../skills/stellar-soroban-rwa/SKILL.md)
- [`skills/student-git-collaboration/SKILL.md`](../../skills/student-git-collaboration/SKILL.md)
- [ADR-003: no custodial y Trustless Work](../../docs/adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md)
- [ADR-004: pagos en pesos sin billetera](../../docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md)
- [`docs/arquitectura/SERVIDOR.md`](../../docs/arquitectura/SERVIDOR.md)
- [`docs/arquitectura/BASE_DE_DATOS.md`](../../docs/arquitectura/BASE_DE_DATOS.md)
- [`src/config/protocolFees.ts`](../../src/config/protocolFees.ts)
