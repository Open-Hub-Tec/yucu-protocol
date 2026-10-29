# ADR-005: Infraestructura de atestaciones abierta para Stellar, con Yucu como primer usuario

* **Estado:** Propuesta (borrador). No se construye nada de aquí hasta que los mantenedores la acepten.
* **Fecha:** 27 de octubre de 2026. Reescrita el 28 de octubre de 2026 con fuentes oficiales (sección 9); ese mismo día se agregaron las listas en el contrato y la comparación con EAS.
* **Decide:** Mantenedores de Yucu Protocol (Open Hub TecNM, Tlaxiaco)
* **Relación:** Se apoya en [ADR-003](./ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md) (no custodial, puertos) y [ADR-004](./ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) (D5: lo mínimo en la cadena; D11: servicios para compradores y marcas). Los diagramas están en [`docs/arquitectura/`](../arquitectura/README.md).

---

## 1. Contexto

Yucu necesita que **personas y organizaciones de fuera** usen el protocolo (ADR-004, D11):

* **Emisores:** grupos, cooperativas, certificadoras, marcas o instituciones que afirman algo sobre un lote, una pieza o una cuenta.
* **Verificadores:** cualquier comprador, tienda o contrato que quiere saber si esa afirmación sigue vigente, sin cuenta ni billetera.

Queremos que la infraestructura sea **útil para cualquier proyecto de Stellar**, no solo para Yucu. Eso cambia el diseño: un registro que solo sirve a Yucu, con un administrador de Yucu, no lo adoptaría una certificadora ni otro proyecto.

**El contrato actual no sirve para eso.** `contracts/attestation_registry` acepta un solo emisor por esquema, recibe los IDs desde fuera, guarda textos libres en la cadena, lleva un contador global que no usa nadie, guarda un campo `signature` que no verifica, y el administrador puede inicializarlo cualquiera que llegue primero (#110). Otros contratos solo pueden preguntar `verify_attestation(uid) -> bool`: `fair_escrow` aceptaría como "prueba de entrega" cualquier atestación vigente, de cualquier esquema y sobre cualquier cosa.

**Lo que ya existe en Stellar** (revisado el 28 de octubre de 2026):

* **Attest Protocol** ([`daccred/attestprotocol`](https://github.com/daccred/attestprotocol), licencia MIT, commit `c0c4529` del 11 de septiembre de 2026). Recibió del SCF 120.6 mil dólares en dos rondas (#29 y #32) y lo mantiene una sola persona. Tiene esquemas, *resolvers* (`onattest`, `onrevoke`, `onresolve`), delegación, revocación y vencimiento, y en `contracts/stellar/audit/` hay reportes de Almanax (noviembre de 2025) y de Scout, además de citas a hallazgos de Halborn. Es la referencia más cercana a lo que queremos, pero hoy tiene cuatro bloqueos para Yucu (sección 6).
* **No hay un SEP de atestaciones.** Las "attestations" de los SEP actuales se refieren a la verificación de builds, no a afirmaciones sobre bienes o personas.
* La SDF no tiene una convocatoria (RFP) de atestaciones abierta y su roadmap no las menciona. Proponerlo como estándar requiere demostrar que otros proyectos lo necesitan.

## 2. Qué significa "profesional" aquí

1. **Genérico:** el núcleo no sabe nada de lotes, artesanas ni la Mixteca. Lo de Yucu vive en sus esquemas y *resolvers*.
2. **Nadie controla las atestaciones de otros:** el núcleo no tiene administrador ni `upgrade`. Una versión nueva es otro despliegue.
3. **Reimplementable:** la especificación define el cálculo de cada ID con vectores de prueba, para que otro equipo obtenga los mismos IDs.
4. **Compatible:** el modelo de datos y la interfaz de *resolvers* siguen a Attest Protocol y a EAS (Ethereum), para poder migrar o interoperar.
5. **Privado por diseño:** en la cadena no va ningún dato personal; el contenido sensible va como hash con sal.
6. **Revisable:** modelo de amenazas, pruebas de propiedades y auditoría externa antes de mainnet.

## 3. Decisiones

**D1. Tres capas separadas.**

| Capa | Qué es | Quién la controla |
|---|---|---|
| **Núcleo** | Contrato genérico: esquemas, atestaciones, revocación, vencimiento, referencias | Nadie (inmutable) |
| **Esquemas y *resolvers* de Yucu** | Las reglas de Yucu: quién emite el origen, la cofirma de la artesana, quién revoca | Yucu, de forma pública y declarada (D8) |
| **Apps** | Verificador público, consola de emisores y `AttestationPort` en la PWA | Yucu |

**D2. Modelo de datos del núcleo.** Los nombres siguen a Attest Protocol y EAS; la forma final la ajustan los alumnos en su issue.

```rust
struct Schema {
    creator: Address,              // quien lo registró y pagó su renta
    definition_hash: BytesN<32>,   // sha256 de la definición (JSON Schema) publicada fuera de la cadena
    resolver: Option<Address>,     // contrato con reglas propias del esquema (D3)
    revocable: bool,
    storage: StorageKind,          // Persistent o Temporary (#100)
}

struct Attestation {
    schema_uid: BytesN<32>,
    attester: Address,             // quien afirma; firma con require_auth
    subject: BytesN<32>,           // sobre qué: sha256("lot:" + código), "item:", "addr:", "sale:"...
    recipient: Option<Address>,    // la cuenta a la que se refiere, si la hay
    ref_uid: Option<BytesN<32>>,   // atestación relacionada (procedencia → entrega → reventa)
    data: Bytes,                   // hash con sal, o datos codificados con tamaño máximo
    nonce: u64,                    // por emisor; permite reemitir después de revocar
    time: u64,                     // hora del ledger; la hora de la observación va en el contenido
    expiration_time: Option<u64>,
    revocation_time: Option<u64>,
}
```

* **IDs calculados en el contrato.** `schema_uid = sha256(prefijo ‖ definition_hash ‖ creator ‖ resolver ‖ revocable ‖ storage)` y `uid = sha256(prefijo ‖ dirección del contrato ‖ schema_uid ‖ attester ‖ subject ‖ nonce)`. El prefijo de dominio y la dirección del contrato evitan que un ID de otra red o de otro despliegue coincida.
* **El nonce es por emisor**, guardado en su propia entrada `persistent`. No hay contador global, así que las emisiones no compiten por la misma entrada.
* **Listas en el contrato, sin indexador.** Cada atestación agrega dos llaves fijas: `BySubject(subject, n) -> uid` (con un contador por sujeto) y `ByAttester(attester, nonce) -> uid`. Así cualquiera puede listar las atestaciones de un lote o de un emisor leyendo el estado del contrato, sin un servidor de índice: `getLedgerEntries` acepta hasta 200 llaves por llamada y un lote tiene pocas atestaciones. No hay listas que crezcan sin límite. La renta de estas dos entradas se mide en testnet en la issue del núcleo.
* **Contadores por esquema.** Una entrada `SchemaStats(schema_uid) -> { total, revoked }` que suben `attest` y `revoke`. Son dos números por esquema, no listas. Permiten publicar cifras de uso leídas de la cadena (para el SCF y para la página de impacto) sin indexador. No guardan región, producto ni persona: esos datos van en el hash con sal y la cadena no los conoce.
* **Esquemas sin permiso:** cualquiera registra un esquema y paga su renta. Cada esquema es una entrada `persistent` propia, no `instance` (ver sección 6), así que no hay un límite común que se pueda llenar.
* **Se quitan** `name`, `description`, el texto de la definición y `signature`. La autenticidad la da `require_auth` del emisor.

**D3. Funciones del núcleo.**

```rust
fn register_schema(creator, definition_hash, resolver, revocable, storage) -> BytesN<32>;
fn attest(attester, schema_uid, subject, recipient, ref_uid, data, expiration_time) -> BytesN<32>;
fn revoke(revoker, uid);
fn get_schema(schema_uid) -> Schema;
fn get_attestation(uid) -> Attestation;
fn is_valid(uid) -> bool;                                   // existe, no venció, no se revocó
fn is_valid_for(uid, schema_uid, subject) -> bool;          // lo que deben usar los otros contratos
fn extend_ttl(uid);                                          // cualquiera puede pagar la renta
fn timestamp(hash) -> u64;                                   // ancla un hash (D6)
fn revoke_offchain(revoker, hash) -> u64;                    // revoca una atestación fuera de la cadena (D6)
fn list_by_subject(subject, start, limit) -> Vec<BytesN<32>>;   // atestaciones de un lote, por páginas
fn list_by_attester(attester, start, limit) -> Vec<BytesN<32>>; // historial de un emisor, por páginas
fn schema_stats(schema_uid) -> (u64, u64);                     // emitidas y revocadas de un esquema
```

* `attest` rechaza un `expiration_time` que ya pasó, un `ref_uid` que no existe y un `data` más grande que el máximo.
* `revoke` lo puede hacer el emisor. Otro firmante solo puede revocar si el *resolver* del esquema lo aprueba en `onrevoke` (por ejemplo, la artesana que retira su consentimiento).
* Las funciones de varios a la vez (`multi_attest`, `multi_revoke`) se agregan si las mediciones de costo lo justifican.
* `fair_escrow` y `perpetual_royalties` deben usar `is_valid_for`, nunca solo `is_valid`.
* `list_by_subject` y `list_by_attester` son de solo lectura y devuelven a lo más `limit` IDs. Un cliente también puede leer las llaves directamente con `getLedgerEntries`.
* **Eventos:** `attest`, `revoke` y `register_schema` emiten eventos con `schema_uid`, `attester` y `subject` en los temas. Nadie depende de ellos hoy (la RPC los guarda unos 7 días), pero son casi gratis y permiten que un indexador futuro, propio o de un proveedor, se conecte sin cambiar el contrato.

**D4. *Resolvers* con la misma interfaz que Attest Protocol.** `onattest(data) -> bool` y `onrevoke(data) -> bool` se llaman antes de guardar y, si fallan, se revierte todo. `onresolve` se llama después y su fallo no revierte. Usar los mismos nombres y tipos permite llevar un *resolver* de un registro al otro. Con *resolvers* se resuelven, sin tocar el núcleo:

* lista de emisores autorizados por esquema, o un quórum;
* **cofirma:** el *resolver* llama `require_auth()` sobre la dirección de la artesana, que firma su propia entrada de autorización en su teléfono;
* revocación por la persona a quien se refiere la atestación;
* corte por llave robada: el *resolver* deja de aceptar a un emisor a partir de una fecha;
* cobros por emitir, si algún día se decide (ADR-004, D11), siempre al emisor y nunca a la artesana.

**D5. Gobierno.** El núcleo no tiene administrador, ni `initialize`, ni `upgrade`: se despliega con `__constructor` y sin estado de control. Una corrección es un despliegue nuevo (v1, v2) y la especificación dice cómo migrar. Los *resolvers* de Yucu sí tienen administrador (una cuenta multifirma), y eso se declara en la especificación de cada esquema.

**D6. Emitir sin pagar, sin conexión y en volumen.**

* **Patrocinio:** en Soroban, la firma de autorización y la transacción pueden ser de cuentas distintas. El emisor firma su entrada con `require_auth` y otra cuenta envía y paga. No hace falta delegación con BLS12-381, que WebCrypto no soporta. Sirve para el patrocinio de #94.
* **Fuera de la cadena:** el emisor firma el contenido con SEP-53 (Final, v1.0.0) usando el mismo `schema_uid`. La revocación (`revoke_offchain`) y la fecha cierta (`timestamp`) sí van a la cadena. SEP-53 solo prueba una llave ed25519; con cuentas multifirma o contratos no prueba el control de la cuenta, así que esos emisores emiten en la cadena.
* **Lotes:** un emisor junta muchas atestaciones de tránsito, ancla su raíz de Merkle con `timestamp` y cada atestación se comprueba con su prueba. Encaja con la cola sin conexión de #21. Solo para tipos que no se revocan uno por uno.
* Más adelante se puede exportar una atestación como credencial verificable de W3C (VC 2.0) para compradores en el extranjero.

**D7. Almacenamiento y renta.**

* Según la documentación oficial, una entrada `temporary` que llega a TTL 0 **se borra para siempre**, y una `persistent` **se archiva** y debe restaurarse antes de usarla. Desde el protocolo 23 la restauración puede ir dentro de la misma transacción si la simulación la incluye.
* El verificador simula la lectura. Si la simulación pide restaurar, muestra "archivada, se puede restaurar", no "no existe".
* El tipo de almacenamiento lo fija el esquema (#100). El tránsito usa `temporary`; el origen, `persistent`.
* `extend_ttl` es pública. Quién paga la renta de las atestaciones de origen es una pregunta abierta (sección 7).
* Antes de fijar tamaños máximos, los alumnos miden en testnet el costo real de una atestación. No se escriben cifras sin esa medición.

**D8. Esquemas iniciales de Yucu.** Cada uno se publica con su definición JSON, su hash y la descripción de su *resolver*.

| Esquema | Emisor | *Resolver* | Almacenamiento |
|---|---|---|---|
| Origen comunitario | El grupo | Lista de grupos dados de alta por Yucu después de verificarlos fuera de la cadena | `persistent` |
| Colaboración con consentimiento | La marca | Exige la cofirma de la artesana; ella puede revocar | `persistent` |
| Entrega | El comprador o el grupo | Exige `ref_uid` a la venta o al escrow | `persistent` |
| Tránsito (pesaje, humedad) | El grupo o la promotora | Lista de emisores | `temporary` |
| Dictamen de IA | El servicio de IA de Yucu | Se muestra siempre como "dictamen de IA", nunca como certificación (regla 3 de AGENTS.md) | `temporary` |

Todos guardan en `data` un hash con **sal aleatoria obligatoria**: datos con pocas opciones, como "25 kg" o un municipio, se adivinan probando todas las combinaciones. En la cadena nunca va un nombre ni una coordenada. El verificador muestra el producto, el emisor, el municipio o región y las fechas.

**D9. `AttestationPort` en `src/core/chain/ports.ts`.** Sigue el patrón de ADR-003: preparar → firmar → enviar. Habla con el núcleo a través de un adaptador, así que funciona igual con el núcleo propio o con Attest Protocol (D10).

```ts
export interface AttestationPort {
  prepareAttest(req: AttestRequest): Promise<UnsignedTransaction>;
  prepareRevoke(attestationId: string, revokerAddress: string): Promise<UnsignedTransaction>;
  /** Envía la emisión firmada y devuelve el ID que calculó el contrato. */
  submitAttest(signedXdr: string): Promise<ChainReceipt & { attestationId: string }>;
  submit(signedXdr: string): Promise<ChainReceipt>;
  /** Lectura directa de la red: el verificador no depende del servidor de Yucu. */
  verify(attestationId: string, expected?: { schemaId: string; subject: string }): Promise<{
    valid: boolean; revoked: boolean; expired: boolean; archived: boolean; source: ChainSource;
  }>;
  listForLot(lotCode: string): Promise<{ items: AttestationRecord[]; source: ChainSource }>;
  listForIssuer(issuerAddress: string): Promise<{ items: AttestationRecord[]; source: ChainSource }>;
  schemaStats(schemaId: string): Promise<{ total: number; revoked: number; source: ChainSource }>;
}
```

`AttestRequest` lleva el esquema, el emisor, el código del lote, el contenido y una fecha de vencimiento opcional. El puerto calcula `subject`, agrega la sal y el hash, y nunca manda nombres. `listForLot` y `listForIssuer` leen las listas del contrato (D2) directamente de la red, igual que `verify`: **no hay índice en el servidor** y nada depende de confiar en Yucu. Un indexador solo haría falta para un explorador público o para estadísticas (buscar en todas las atestaciones, contar por esquema); si llega a hacer falta, se usa el de Attest Protocol o un proveedor de la lista oficial de Stellar, no uno propio.

**D10. Primero proponer los cambios a Attest Protocol; el núcleo propio, solo si no se aceptan.**

1. Antes de escribir código del núcleo, abrir en `daccred/attestprotocol` una issue por cada bloqueo de la sección 6, con la propuesta de esta ADR.
2. Si los acepta antes de la fecha que fijen los mantenedores, Yucu usa Attest Protocol con sus propios *resolvers* (D8) y **no despliega un registro propio**.
3. Si no, los alumnos construyen el núcleo de D2 y D3 con la misma interfaz de *resolvers* (D4), y el adaptador de D9 permite cambiar después.
4. En los dos casos, la interfaz común se propone como SEP **junto con** ese equipo, siguiendo el proceso oficial: primero una discusión pública (GitHub Discussions de `stellar-protocol` o el Discord de desarrolladores), después el borrador con el número "por asignar".

Así Yucu no compite con un proyecto que el SCF ya financió, y el trabajo de los alumnos mejora una pieza que usa todo el ecosistema.

## 4. Calidad exigida

* Especificación con el cálculo de IDs, la codificación de `data` y **vectores de prueba**.
* Pruebas de conformidad que cualquier implementación debe pasar, con una prueba positiva y una negativa por regla (AGENTS.md), más pruebas de propiedades y *fuzzing* del cálculo de IDs y de la autorización.
* Modelo de amenazas (STRIDE) del núcleo y de cada *resolver*. El tramo 2 del Integration Track del SCF lo pide.
* Builds reproducibles y verificables del contrato antes de cualquier despliegue público (SEP-55, en borrador).
* **Una prueba por cada ventaja** sobre EAS (sección 7), para demostrarla con evidencia y no solo con texto:
  * la artesana revoca su consentimiento y la marca no puede impedirlo;
  * `is_valid_for` rechaza una atestación revocada, vencida, de otro esquema o de otro sujeto;
  * una cofirma falla si falta cualquiera de las dos firmas;
  * una cuenta distinta del emisor paga la transacción sin poder cambiar lo firmado;
  * una llave no exportable del teléfono firma una emisión;
  * `list_by_subject` y `list_by_attester` devuelven exactamente lo emitido, sin servidor;
  * `schema_stats` sube en 1 al emitir y `revoked` sube en 1 al revocar, y una revocación fallida no cambia nada;
  * el costo real de una emisión, medido en testnet.
* Auditoría externa antes de mainnet. El Soroban Security Audit Bank solo atiende proyectos financiados por el SCF y pide un 5 % del costo por adelantado, que se reembolsa si los hallazgos se corrigen en 20 días hábiles.

## 5. Consecuencias

* El `attestation_registry` actual queda como material de prueba y no se despliega a mainnet. Su reemplazo (propio o Attest Protocol) entra en el mismo redespliegue de #110, para que los IDs cambien una sola vez.
* Issues nuevas para alumnos: especificación y vectores (#140); núcleo (solo si aplica D10.3); *resolvers* de Yucu; `AttestationPort` con su versión simulada (#141); verificador público (#142); consola mínima de emisores (#143); y la **pantalla de la artesana**, donde ve lo que se dice de sus lotes y revoca su consentimiento.
* **No se construye un indexador.** Las listas y los contadores viven en el contrato (D2).
* **Dashboards:** un resumen para cada emisor en su consola (con `list_by_attester`) y una página pública de impacto con los contadores por esquema. Ninguno muestra datos por región, producto o persona, y toda cifra simulada lleva `<DemoBadge />`. Un explorador con búsquedas y gráficas necesitaría un indexador y queda para después.
* Los documentos de `docs/standards/` sobre atestaciones quedan obsoletos hasta reescribirlos con esta ADR.
* El widget de #79 se vuelve parte del verificador.
* El plan de trabajo crece. Con dos semestres se recomienda: especificación, *resolvers*, `AttestationPort` y el verificador completo, más una consola mínima donde un emisor emite y revoca.

## 6. Alternativas descartadas

* **Un registro solo para Yucu** (la versión anterior de esta ADR, con administrador de Yucu y reglas fijas). Sirve para Yucu, pero ningún otro proyecto lo adoptaría.
* **Usar Attest Protocol tal como está** (commit `c0c4529`). Revisado en el código:
  * en `attest()` directo el sujeto es siempre el emisor (`let subject = attester.clone();`), así que un grupo no puede atestar sobre un lote ni sobre otra cuenta sin la delegación;
  * la delegación usa firmas BLS12-381, que WebCrypto no soporta (no sirve con la llave no exportable de #91);
  * los esquemas se guardan en `instance`, que se carga en cada llamada y tiene un tamaño máximo común;
  * no llama `extend_ttl`. (Su `initialize` guarda un administrador que no se usa en ningún otro lado: es un detalle menor, no un bloqueo.)
  Si esos puntos se corrigen, esta alternativa pasa a ser la preferida (D10).
* **Solo atestaciones fuera de la cadena.** Son baratas y sirven sin conexión, pero `fair_escrow` y `perpetual_royalties` no las pueden leer. Se mantienen como complemento (D6).

## 7. Ventajas sobre EAS que el núcleo debe demostrar

Revisado en el contrato oficial de EAS (`EAS.sol`) el 28 de octubre de 2026. Son ventajas **de diseño**: solo cuentan cuando existan en código y pasen las pruebas de la sección 4.

| Ventaja | EAS (comprobado en su código) | Este diseño |
|---|---|---|
| La persona de la que se habla puede revocar | `_revoke` falla con `AccessDenied` si quien revoca no es el emisor (líneas 526 y 527) | El *resolver* puede permitir que la artesana revoque (D3, D4) |
| "Válida" es válida | `isAttestationValid` solo revisa que el ID exista (líneas 381 a 383) | `is_valid_for` revisa revocación, vencimiento, esquema y sujeto |
| Dos firmas en una transacción | Un solo emisor; la cofirma necesita un *resolver* con firmas propias | `require_auth` de las dos cuentas, nativo de Soroban |
| Otra cuenta paga | Funciones de delegación aparte, con EIP-712 | Quien firma y quien paga pueden ser distintos (D6) |
| Llave del teléfono | Las cuentas normales usan secp256k1, que WebCrypto no soporta | ed25519 en cuentas `G…` y secp256r1 en cuentas de contrato |
| Listar sin servidor | No hay listas en el contrato; depende de su API GraphQL | Listas por sujeto y por emisor en el contrato (D2) |
| Privacidad | `data` va en claro; los datos privados con Merkle son opcionales | Hash con sal obligatoria (D8) |

**Donde EAS va adelante:** su sitio oficial reporta más de 9.5 millones de atestaciones y más de 450 mil emisores en más de 13 redes; tiene explorador, API GraphQL y SDK; y lo escrito no paga renta. Este diseño no tiene nada desplegado todavía. Ninguna cadena comprueba el mundo físico: la confianza viene del emisor y del proceso de campo, en EAS y aquí.

## 8. Preguntas abiertas

1. ¿Cómo se verifica a un grupo o a una marca antes de darlo de alta en un *resolver* de Yucu, y quién lo decide?
2. ¿Quién paga las comisiones de red y la renta de las atestaciones de origen? ¿El patrocinio de #94 las cubre?
3. ¿Se cobra a los emisores por el servicio (ADR-004, D11)? ¿Cuánto, y lo cobra la misma entidad con RFC?
4. ¿Qué plazo se le da a Attest Protocol para responder (D10)?
5. ¿El núcleo, si se construye, vive en este repositorio o en uno aparte de la organización para que otros lo adopten sin la app?

## 9. Fuentes revisadas (28 de octubre de 2026)

* Stellar Docs, [State archival](https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival): tipos de almacenamiento, archivado y restauración automática desde el protocolo 23.
* Stellar Docs, [Authorization](https://developers.stellar.org/docs/learn/fundamentals/contract-development/authorization): `require_auth`, firmante distinto de quien paga, multifirma con umbral medio, cuentas de contrato.
* [SEP-53](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md): firma de mensajes, Final v1.0.0, y su limitación con multifirma.
* [Proceso de los SEP](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/README.md).
* [Soroban Security Audit Bank](https://stellar.org/grants-and-funding/soroban-audit-bank).
* [Stellar Attestation Service en el SCF](https://communityfund.stellar.org/project/stellar-attestation-service-lda) y el código de [`daccred/attestprotocol`](https://github.com/daccred/attestprotocol) (commit `c0c4529`).
* EAS, [`EAS.sol`](https://github.com/ethereum-attestation-service/eas-contracts/blob/master/contracts/EAS.sol) (revocación y validez) y [sitio oficial](https://attest.org/) (cifras de uso).
* Stellar Docs, [getLedgerEntries](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLedgerEntries) (hasta 200 llaves por llamada) y [getEvents](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents) (unos 7 días de eventos).
* EAS, [`IEAS.sol`](https://github.com/ethereum-attestation-service/eas-contracts/blob/master/contracts/IEAS.sol): modelo de atestación, `refUID`, delegación, `timestamp` y `revokeOffchain`.
