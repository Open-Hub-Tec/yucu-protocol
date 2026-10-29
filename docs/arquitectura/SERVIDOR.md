# Guía del servidor

Esta guía es para los equipos que trabajan issues del servidor. Unos 11 equipos van a tocar `server.ts` al mismo tiempo; si cada uno sigue estas reglas, sus PRs no chocan y el servidor queda parejo. Donde una issue diga algo distinto, manda la issue; si te parece que la issue está mal, coméntalo en ella antes de programar.

Léela junto con [`AGENTS.md`](../../AGENTS.md), [ADR-003](../adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md), [ADR-004](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) y [ADR-006](../adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md).

## 1. Qué hace el servidor y qué nunca hace

El servidor es Express (`server.ts`). Corre en tu computadora con `npm run dev`, en Google AI Studio y, desde #170, en Vercel como función.

**Hace:**
* Prepara transacciones **sin firmar** para que la persona las firme en su teléfono (patrón preparar → firmar → enviar).
* Firma solo con **llaves de la plataforma** y solo en su papel: el certificador cofirma un registro (#92) y la cuenta patrocinadora paga comisiones (#94).
* Habla con servicios externos que necesitan una llave secreta (Gemini, Trustless Work, Etherfuse), para que la llave no llegue al navegador.
* Guarda datos que no van en la cadena: catálogo, perfil y pedidos (#156).

**Nunca:**
* Recibe, genera, guarda ni deriva la llave de una persona.
* Retiene dinero de nadie.
* Inventa hashes, ledgers, verificaciones ni certificaciones (#106). Lo simulado lleva `source: 'simulated'`.
* Guarda o registra en logs nombres, teléfonos, CURP, RFC, audio, fotos de personas o llaves.

## 2. Dónde va el código

`server.ts` no se mueve (ver la sección 8 de [`README.md`](./README.md)). Para que los equipos no editen las mismas líneas, **cada área va en su propio archivo** dentro de `src/server/`, y `server.ts` solo los monta:

```
src/server/
├── routes/
│   ├── ai.ts          /api/chat, /api/analyze-image, /api/transcribe-audio   (#154, #107)
│   ├── chain.ts       /api/chain/*                                            (#92, #94)
│   ├── escrow.ts      /api/escrow/*                                           (#96)
│   ├── payout.ts      /api/payout/*                                           (#146)
│   ├── auth.ts        /api/auth                                               (#157)
│   ├── catalog.ts     /api/catalog/*, /api/profile                            (#156)
│   └── legacy.ts      /api/v1/*                                               (#106)
├── store/             estado compartido (sección 5)
└── errors.ts          formato de error (sección 4)
```

```ts
// server.ts: una línea por área
app.use("/api/chain", chainRoutes);
```

Reglas:
* Cada archivo exporta un `Router` de Express. Si tu issue crea el área, crea el archivo; si ya existe, agrega tus rutas ahí.
* Si tu PR mueve una ruta que ya existe de `server.ts` a su archivo, **no le cambies la dirección ni la respuesta** en el mismo PR. Mover y cambiar van en commits separados, para que la revisión sea clara.
* El código de `src/server/` puede importar `@stellar/stellar-sdk` y los SDK de los proveedores. **El código del navegador (`src/components/`, `src/core/`) nunca importa nada de `src/server/`**, porque se iría al paquete del teléfono con todo y sus dependencias.
* `/api/dossier` y `/api/download/*` (presentaciones) no son parte de la arquitectura. No las toques.

## 3. Mapa de rutas

| Ruta | Hoy | Después | Issue |
|---|---|---|---|
| `GET /api/health` | ✅ Real | Igual; se prueba con la `app` exportada | #170 |
| `POST /api/chat` | 🟡 Llama a Gemini; a veces inventa | Detrás del puerto de IA, sin inventar | #154 |
| `POST /api/analyze-image` | 🟡 Llama a Gemini; diagnósticos fijos sin llave | Puerto de IA; solo con consentimiento | #154 · #107 |
| `POST /api/transcribe-audio` | 🟡 Llama a Gemini; transcripción "verificada" falsa | Puerto de IA; el audio no se guarda | #154 · #107 |
| `POST /api/chain/lots/prepare` | ❌ No existe | Prepara `register_lot` sin firmar; el certificador cofirma | #92 |
| `POST /api/chain/submit` | ❌ No existe | Fee-bump patrocinado con lista blanca | #94 |
| Alta de cuenta con reserva patrocinada | ❌ No existe | La firma una promotora o grupo dado de alta | #94 |
| `/api/escrow/*` | ❌ No existe | Proxy de Trustless Work; devuelve XDR sin firmar | #96 |
| `/api/payout/*` | ❌ No existe | Proxy del sandbox de Etherfuse; no guarda datos personales | #146 |
| `GET /api/auth` · `POST /api/auth` | ❌ No existe | Reto SEP-10 y sesión corta | #157 |
| `/api/catalog/*` · `/api/profile` | ❌ No existe | Catálogo público, escritura con sesión, borrar perfil | #156 |
| `/api/v1/*` | 🔴 Responde valores inventados | `501` o `source: 'simulated'` | #106 |
| Servidor MCP | ❌ No existe | Junto a `server.ts`, usa `AttestationPort` | #166 |

Los nombres que no fija una issue (por ejemplo, la ruta del alta de cuenta) los propone el equipo en su PR, dentro del prefijo de su área.

**No hay API de lectura propia.** El verificador y las apps leen la red directamente por los puertos (ADR-005), y los agentes de IA usan el servidor MCP (#166). Una API que repita lo que dice la cadena obligaría a confiar en Yucu.

## 4. Respuestas y errores

**Éxito:** JSON. Si devuelves algo que viene de la cadena o de una simulación, incluye `source` (`'testnet'` o `'simulated'`, como `ChainSource` en `src/core/chain/ports.ts`). Una transacción para firmar se devuelve como `UnsignedTransaction` (mismo archivo).

**Error:** siempre la misma forma.

```json
{ "error": "Esta cuenta no está dada de alta.", "code": "NOT_REGISTERED" }
```

* `error`: una frase corta en español que se pueda mostrar a una persona mayor tal cual. Sin términos técnicos ni detalles internos.
* `code`: en inglés y mayúsculas, para que la app decida qué hacer. Es opcional.
* Nunca mandes la pila del error (`stack`), el mensaje del proveedor ni datos de la petición.

| Código | Cuándo |
|---|---|
| 400 | Los datos de la petición no son válidos |
| 401 | Falta la sesión o ya venció (#157) |
| 403 | Hay sesión, pero no puede hacer eso (otra cuenta, otro grupo, cuenta no dada de alta) |
| 404 | No existe |
| 409 | Ya existe (por ejemplo, `LotAlreadyExists`) |
| 413 | La petición es demasiado grande |
| 429 | Pasó el límite; agrega `Retry-After` |
| 501 | La ruta todavía no tiene versión real (#106) |
| 503 | Falta una variable de entorno; el servidor no se cae |
| 500 | Solo para errores que no esperabas |

## 5. Estado compartido: nada importante en memoria

En Vercel cada petición puede caer en una copia distinta del servidor, y la memoria se pierde entre una y otra. Lo que guardes en una variable (`new Map()`) **no sirve** para:

| Dato | Issue | Por qué |
|---|---|---|
| Retos de inicio de sesión de un solo uso | #157 | Si otra copia no lo conoce, el reto se podría usar dos veces |
| Cuentas dadas de alta | #94 (las crea) · #92 (las consulta) | El certificador no debe cofirmar a cualquiera |
| Consecutivo de folios por grupo | #92 | Dos copias darían el mismo folio |
| Límites por cuenta y por día | #92 · #94 | Cada copia contaría por su lado |
| Catálogo, perfiles y pedidos | #156 | Se perderían |

Regla: **cada uno de estos datos va detrás de una interfaz pequeña en `src/server/store/`** con dos versiones: una en memoria, para las pruebas y para trabajar mientras no existe la base de datos, y otra en PostgreSQL cuando se fusione #156. Así nadie se queda esperando a #156, y cambiar de una a otra no toca las rutas. La versión en memoria se nombra para que se note (por ejemplo, `MemoryStore`) y el servidor avisa al arrancar si la está usando.

¿Quién escribe la versión PostgreSQL? #156 deja la conexión y las migraciones. Cada equipo agrega la tabla y la versión PostgreSQL de **sus** datos. Si cuando abras tu PR #156 todavía no se ha fusionado, tu PR llega con la versión en memoria y en él dices qué tabla hará falta, para abrir la issue que la complete.

El límite de peticiones a la IA (`aiRateLimit`) también vive en memoria; #170 propone cómo resolverlo en Vercel.

## 6. Variables de entorno

Todas van en `.env` (ignorado por git) y aparecen en `.env.example` **sin valores reales**. Si tu issue agrega una, agrégala a esta tabla en el mismo PR. Todo es **testnet**: ninguna llave de mainnet entra al proyecto hasta cumplir lo de la sección 7 de [`README.md`](./README.md).

| Variable | Qué es | Issue | En Vercel |
|---|---|---|---|
| `GEMINI_API_KEY` | Llave de la IA. Gratuita = solo datos inventados (ADR-006, D1) | #154 | Production y Preview |
| `AI_PROVIDER` | `gemini` o `simulated` | #154 | Production y Preview |
| `STELLAR_CERTIFIER_SECRET` | Llave del certificador de `lot_passport` (de la plataforma) | #92 | Solo Production, *Sensitive* |
| Llave de la cuenta patrocinadora | Paga comisiones y reservas (nombre lo propone #94) | #94 | Solo Production, *Sensitive* |
| `SPONSOR_MAX_FEE`, `SPONSOR_MAX_TX_PER_DAY`, `SPONSOR_MAX_ACCOUNTS_PER_DAY` | Topes del patrocinio | #94 | Production y Preview |
| Llave de la API de Trustless Work | Cada equipo usa la suya | #96 | Production y Preview |
| `ETHERFUSE_API_KEY` | Sandbox de Etherfuse | #146 | Production y Preview |
| Llave que firma el reto SEP-10 y secreto de la sesión | De la plataforma | #157 | Solo Production, *Sensitive* |
| Cadena de conexión de PostgreSQL | Base de datos. En Vercel, la que usa *pooling* (cada función abre su conexión) | #156 | Production (y Preview si hay una base de pruebas) |
| `APP_URL` | Dirección pública; si falta, la que da Vercel | #170 | La pone Vercel |

* Si falta una variable que tu ruta necesita, responde 503 con un mensaje claro (sección 4). No dejes que el servidor se caiga al arrancar.
* Nunca imprimas una variable secreta, ni siquiera una parte, ni para depurar.
* Las vistas previas de los PRs no tienen las llaves que firman. Por eso, ahí esas rutas responden 503, y es lo esperado.

## 7. Pruebas

* Desde #170, `server.ts` exporta `app`. Las pruebas la levantan en un puerto libre y le hacen peticiones:

  ```ts
  import http from "node:http";
  const server = http.createServer(app).listen(0);
  const { port } = server.address() as { port: number };
  const res = await fetch(`http://127.0.0.1:${port}/api/health`);
  ```
* **El CI no llama a servicios externos** (Google, Stellar, Trustless Work, Etherfuse). Usa la versión simulada del proveedor o del almacén.
* Cada regla nueva tiene una prueba positiva y una negativa. En el servidor, la negativa casi siempre es un código de la sección 4 (403, 409, 429…).
* Prueba que no se registran datos personales ni secretos: cambia el logger por uno falso que guarde lo que recibe y revisa que no aparezcan.
* Si agregas un archivo en `src/tests/`, agrégalo al script `test` de `package.json`.

## 8. En qué orden

```
#170 exportar app ─┬─▶ todas las pruebas del servidor la usan
#106 sin inventos  │
#154 puerto de IA ─┴─▶ #107 consentimiento

#156 base de datos ──▶ #157 sesión SEP-10 ──▶ escritura del catálogo
#94 alta y patrocinio ─┐
#110 contratos ────────┴─▶ #92 preparar register_lot ──▶ #93 registrar un lote real

Fase 2 (testnet): #96 escrow · #146 retiro SPEI · #166 MCP (necesita #141)
```

#170, #106 y #154 no dependen de nadie: son buenas para empezar. Las demás pueden avanzar con la versión en memoria del almacén (sección 5) y cambiar a PostgreSQL cuando se fusione #156.

## 9. Lista para tu PR del servidor

- [ ] Tus rutas están en su archivo de `src/server/routes/`, no sueltas en `server.ts`.
- [ ] Errores con la forma `{ error, code? }` y el código HTTP de la sección 4.
- [ ] Nada de la sección 5 guardado en una variable en memoria fuera de `src/server/store/`.
- [ ] Variables nuevas en `.env.example` (sin valor) y en la tabla de la sección 6.
- [ ] Ningún secreto ni dato personal en el código, las pruebas, los logs o los mensajes de error.
- [ ] Lo simulado lleva `source: 'simulated'`.
- [ ] Pruebas con la `app` exportada, sin llamar a servicios externos.
- [ ] `npm run lint`, `npm test` y `npm run build` pasan.
