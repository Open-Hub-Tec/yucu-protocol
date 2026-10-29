# ADR-005: Atestaciones sobre Attest Protocol, con un índice abierto y las reglas de Yucu

* **Estado:** **Aceptada** el 29 de octubre de 2026 para construir en testnet. Sigue abierto: la fecha de Attest Protocol v3 (mientras tanto se construye contra v2 y contra la versión simulada de `AttestationPort`, D10), quién paga la renta (D7) y las preguntas de la sección 8. Mainnet exige lo de la sección 5 de [ADR-004](./ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) y una auditoría de los contratos de Yucu.
* **Fecha:** 27 de octubre de 2026. Reescrita el 28 de octubre con fuentes oficiales, y otra vez el 29 de octubre de 2026, cuando Attest Protocol aceptó las propuestas de D10 (sección 1).
* **Decide:** Mantenedores de Yucu Protocol (Open Hub TecNM, Tlaxiaco)
* **Relación:** Se apoya en [ADR-003](./ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md) (no custodial, puertos) y [ADR-004](./ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) (D5: lo mínimo en la cadena; D11: servicios para compradores y marcas). El motor de voz que usa estas atestaciones está en [ADR-007](./ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md). Los diagramas están en [`docs/arquitectura/`](../arquitectura/README.md).

---

## 1. Contexto

Yucu necesita que **personas y organizaciones de fuera** usen el protocolo (ADR-004, D11):

* **Emisores:** grupos, cooperativas, certificadoras, marcas o instituciones que afirman algo sobre un lote, una pieza o una cuenta.
* **Verificadores:** cualquier comprador, tienda, contrato o agente de IA que quiere saber si esa afirmación sigue vigente, sin cuenta ni billetera.

**El contrato actual no sirve para eso.** `contracts/attestation_registry` acepta un solo emisor por esquema, recibe los IDs desde fuera, guarda textos libres en la cadena, guarda un campo `signature` que no verifica, y el administrador lo puede inicializar cualquiera que llegue primero (#110).

**Attest Protocol** ([`daccred/attestprotocol`](https://github.com/daccred/attestprotocol), licencia MIT) es el registro de atestaciones de referencia en Stellar. Recibió del SCF 120.6 mil dólares en dos rondas (#29 y #32), su versión 2 está desplegada en mainnet (`CAMZUX…`, 31 de agosto de 2026) y en testnet (`CA2QET…`), y corrigió los hallazgos de la auditoría de Halborn (PR #109 y #110 de ese repositorio).

La versión anterior de esta ADR proponía un núcleo propio y decía (D10): *primero proponer las correcciones a Attest Protocol; el núcleo propio, solo si no se aceptan*. El 28 de octubre se abrieron cuatro issues en su repositorio y **el 29 de octubre las aceptó un contribuidor del proyecto**:

| Issue | Propuesta | Respuesta |
|---|---|---|
| [#126](https://github.com/daccred/attestprotocol/issues/126) | Atestar sobre un sujeto distinto del emisor | Aceptada para v3: `attest_for(attester, subject, schema_uid, value, expiration_time)` e `is_valid_for(uid, schema_uid, subject)`. Para sujetos que no son una cuenta (un lote), el hash va en `value`. Reciben un PR a `canary`. |
| [#127](https://github.com/daccred/attestprotocol/issues/127) | Patrocinio con autorización nativa de Soroban, sin BLS | Ya funciona con el contrato desplegado: el emisor firma solo su entrada de autorización y otra cuenta envía y paga. Reciben un PR con la documentación y una prueba. |
| [#128](https://github.com/daccred/attestprotocol/issues/128) | Esquemas en almacenamiento `persistent` | Aceptada para v3, con nueva revisión de auditoría. Reciben un PR. |
| [#129](https://github.com/daccred/attestprotocol/issues/129#issuecomment-6499001931) | Extender el TTL de esquemas y atestaciones | Lo hacen ellos en v3 (`extend_ttl` público y extensión al escribir). Rechazan cambiar `initialize` por un constructor. |

Por eso esta ADR **deja de proponer un núcleo propio**. Attest Protocol es la base auditada; Yucu construye encima lo que falta.

## 2. Lo que Attest Protocol v2 hace y lo que no

Revisado en su código (rama `canary`, commit `c0c4529` del 11 de septiembre de 2026). No hay todavía una rama de v3.

| Tema | v2 hoy | Consecuencia para Yucu |
|---|---|---|
| Sujeto | `attest()` usa al emisor como sujeto | Hasta v3 (`attest_for`), el sujeto real va en `value` (D3) |
| Contenido | `value: String` | Se define un formato fijo en la especificación (D3) |
| Revocar | Solo el emisor (`revoker == attester`, `attestation.rs:299`) | La persona que debe poder revocar tiene que ser **la emisora** de su atestación (D6) |
| *Resolvers* | `onattest` y `onrevoke` antes de guardar; reciben `uid`, `schema_uid`, `recipient`, `attester`, `data`, vencimiento; si fallan, se revierte todo (`attestation.rs:197` y `:331`) | Aquí van el índice y las reglas de Yucu (D2) |
| Esquema | El *resolver* se fija al registrar el esquema y entra en el cálculo de su ID | No se puede cambiar después: se diseña antes de registrar los esquemas de Yucu en mainnet |
| Almacenamiento | Atestaciones `persistent`; esquemas en `instance` (cambia en v3) | No hay atestaciones `temporary` (#100 se cierra) |
| Listas por sujeto o emisor | No hay; su indexador (`apps/horizon`, Express y MongoDB) cubre las búsquedas | Yucu pone las listas en su *resolver* (D2) |
| Renta | Nada extiende el TTL (cambia en v3) | Mientras tanto, el SDK de Yucu renueva con `ExtendFootprintTTL` (D7) |
| Referencias entre atestaciones | No hay `ref_uid` | Va en `value` (D3) |

## 3. Decisiones

**D1. Cuatro capas.**

| Capa | Qué es | Quién la controla |
|---|---|---|
| **Base** | Attest Protocol: esquemas, atestaciones, revocación, vencimiento | Sus mantenedores; contrato auditado |
| **Índice de Yucu** | Un *resolver* abierto que guarda listas y contadores (D2). Lo puede usar cualquier proyecto | Nadie: sin administrador |
| **Reglas** | Contratos de reglas por esquema: quién emite, cofirma, corte por llave robada (D5) | Cada proyecto. Las de Yucu, con administrador multifirma declarado |
| **Motor y apps** | `AttestationPort`, el motor de voz (ADR-007), el verificador, la consola de emisores y la pantalla de la artesana | Yucu, como software abierto |

**D2. El índice: listas y contadores sin indexador.** Un contrato *resolver* que cualquier esquema puede usar.

* En `onattest` guarda, con llaves fijas:
  * `BySubject(subject_ref, n) -> uid` y un contador por sujeto, donde `subject_ref` es el hash del lote o la pieza (D3), o la dirección si el sujeto es una cuenta;
  * `ByAttester(attester, n) -> uid` y un contador por emisor;
  * `ByRecipient(cuenta, n) -> uid`, para que la artesana vea lo que se dice de ella;
  * `Status(uid) -> { schema_uid, attester, subject_ref, expiration_time, revoked }`;
  * `SchemaStats(schema_uid) -> { total, revoked }`.
* En `onrevoke` marca `revoked` y sube el contador de revocadas.
* Funciones de lectura: `list_by_subject`, `list_by_attester`, `list_by_recipient` (por páginas) y `schema_stats`. Un cliente también puede leer las llaves con `getLedgerEntries`, que acepta hasta 200 llaves por llamada.
* **Solo acepta llamadas del contrato de Attest Protocol.** Guarda su dirección en el constructor y llama `require_auth()` sobre ella. Sin eso, cualquiera podría llenar las listas con basura.
* **No vuelve a entrar a un contrato que ya está en la llamada.** Soroban no permite la reentrada: mientras Attest Protocol espera a `onattest`, ni el índice ni las reglas pueden llamar de nuevo a Attest, y las reglas no pueden llamar de nuevo al índice. Por eso el índice lleva su propio `Status(uid)` y, si `value` trae un `ref_uid`, **les pasa a las reglas el estado de esa atestación** (vigente, revocada, vencida, de qué esquema y de quién). Los alumnos lo confirman con una prueba.
* **Encadenable.** Para cada esquema, su autor configura **una sola vez** un contrato de reglas opcional (`configure(schema_uid, rules)`); el índice comprueba la autoría con `get_schema` fuera de la emisión. En cada emisión, el índice llama a las reglas con los datos de la atestación y el estado de su `ref_uid`; si las reglas dicen que no, se revierte todo. Así otro proyecto obtiene las listas y conserva sus propias reglas.
* **Sin administrador ni `upgrade`.** Se despliega con `__constructor`. Una corrección es otro despliegue.
* Los contadores no guardan región, producto ni persona: esos datos van en el hash con sal y la cadena no los conoce.
* **Límite:** solo entran en las listas las atestaciones de esquemas registrados con este índice. Las que ya existen en Attest Protocol no.

**D3. Formato de `value`.** La especificación (#140) define un texto de campos fijos que un contrato puede leer sin interpretar JSON, por ejemplo:

```
yucu:1:<subject_ref, 64 hex>:<hash con sal del contenido, 64 hex>[:<ref_uid, 64 hex>]
```

* `subject_ref = sha256("lot:" + código)`, `"item:"`, `"sale:"`… Cuando v3 traiga `attest_for`, el sujeto que sea una cuenta (la artesana, un grupo) va en `subject`, y el lote sigue en `subject_ref`.
* El contenido va siempre como **hash con sal aleatoria obligatoria**: datos con pocas opciones, como "25 kg" o un municipio, se adivinan probando todas las combinaciones.
* `ref_uid` encadena procedencia → venta → entrega → reventa.
* La especificación trae **vectores de prueba**: con la misma entrada, cualquier implementación obtiene el mismo texto y los mismos hashes.
* El formato se propone a Attest Protocol como convención documentada (la sugirieron en #126).

**D4. Esquemas y su manifiesto.** Cada esquema de Yucu se registra en Attest Protocol con una definición corta que incluye el hash de su **manifiesto**: un JSON público que dice qué campos lleva, cuáles son públicos, cuáles van solo como hash y cuáles están prohibidos, quién firma y quién cofirma, y cómo se pregunta y se confirma por voz. El manifiesto lo usan el motor (ADR-007), la consola y el verificador.

| Esquema | Emisor | Reglas |
|---|---|---|
| Origen comunitario | El grupo | Solo grupos dados de alta por Yucu después de verificarlos fuera de la cadena |
| Consentimiento | **La artesana** | Ella lo emite y ella lo revoca (D6) |
| Colaboración | La marca | Exige un consentimiento vigente de la artesana (`ref_uid`); el índice pasa su estado a las reglas |
| Entrega | El comprador o el grupo | Exige `ref_uid` a la venta o al escrow |
| Tránsito (pesaje, humedad) | El grupo o la promotora | Lista de emisores. Fuera de la cadena con raíz de Merkle (D8) cuando son muchos |
| Dictamen de IA | El servicio de IA de Yucu | Se muestra siempre como "dictamen de IA", nunca como certificación (regla 3 de AGENTS.md) |

En la cadena nunca va un nombre, un teléfono ni una coordenada.

**D5. Reglas de Yucu.** Contratos de reglas conectados al índice (D2):

* lista de emisores autorizados por esquema;
* exigir un consentimiento vigente antes de una colaboración, con el estado que les pasa el índice (D2);
* **cofirma**: la regla llama `require_auth()` sobre la cuenta de la artesana, que firma su propia entrada de autorización en su teléfono. Está por probar que la firma alcance la llamada anidada (Attest → índice → reglas);
* corte por llave robada: dejar de aceptar a un emisor a partir de una fecha;
* cobros por emitir, si algún día se decide (ADR-004, D11), siempre al emisor y nunca a la artesana.

Tienen un administrador multifirma, y eso se declara en el manifiesto de cada esquema.

**D6. La persona de la que se habla puede retirar su palabra.** En Attest Protocol solo quien emite puede revocar. Por eso el consentimiento lo **emite la artesana**, con su llave, y la colaboración de la marca apunta a él. Si ella lo revoca, la colaboración deja de valer para el verificador y para los contratos, aunque la marca no haga nada: al verificar una colaboración, `AttestationPort.verify` y los contratos siguen su `ref_uid` y revisan también el consentimiento. Es la ventaja sobre EAS de la sección 5, conseguida sin cambiar Attest.

**D7. Renta.** Mientras v3 no traiga `extend_ttl`, el SDK de Yucu renueva las entradas importantes con la operación `ExtendFootprintTTL` de la red, que cualquiera puede pagar. El verificador simula la lectura: si una entrada está archivada, muestra "archivada, se puede restaurar", no "no existe". Quién paga la renta de las atestaciones de origen es una pregunta abierta (sección 6). Antes de fijar tamaños, los alumnos miden en testnet el costo real de una emisión con el índice. No se escriben cifras sin esa medición.

**D8. Emitir sin pagar, sin conexión y en volumen.**

* **Patrocinio:** el emisor firma su entrada de autorización y otra cuenta envía y paga (confirmado en #127). Sirve para el patrocinio de #94 y para llaves no exportables del teléfono (#91). No hace falta BLS.
* **Fuera de la cadena:** el emisor firma el contenido con SEP-53 (Final, v1.0.0). Solo prueba una llave ed25519; los emisores con multifirma o cuentas de contrato emiten en la cadena.
* **En volumen:** un emisor junta muchas atestaciones de tránsito y emite una sola en la cadena con su raíz de Merkle; cada una se comprueba con su prueba. Encaja con la cola sin conexión de #21.
* Más adelante se puede exportar una atestación como credencial verificable de W3C (VC 2.0) para compradores en el extranjero (#77).

**D9. `AttestationPort` en `src/core/chain/ports.ts`.** Sigue el patrón de ADR-003: preparar → firmar → enviar. Habla con Attest Protocol y con el índice a través de un adaptador, así que el paso de v2 a v3 no toca las pantallas.

```ts
export interface AttestationPort {
  prepareAttest(req: AttestRequest): Promise<UnsignedTransaction>;
  prepareRevoke(attestationId: string, revokerAddress: string): Promise<UnsignedTransaction>;
  /** Envía la emisión firmada y devuelve el ID que calculó el contrato. */
  submitAttest(signedXdr: string): Promise<ChainReceipt & { attestationId: string }>;
  submit(signedXdr: string): Promise<ChainReceipt>;
  /** Lectura directa de la red: el verificador no depende del servidor de Yucu. */
  verify(attestationId: string, expected?: { schemaId: string; subjectRef: string }): Promise<{
    valid: boolean; revoked: boolean; expired: boolean; archived: boolean; source: ChainSource;
  }>;
  listForLot(lotCode: string): Promise<{ items: AttestationRecord[]; source: ChainSource }>;
  listForIssuer(issuerAddress: string): Promise<{ items: AttestationRecord[]; source: ChainSource }>;
  listForRecipient(address: string): Promise<{ items: AttestationRecord[]; source: ChainSource }>;
  schemaStats(schemaId: string): Promise<{ total: number; revoked: number; source: ChainSource }>;
}
```

`AttestRequest` lleva el esquema, el emisor, el código del lote, el contenido y una fecha de vencimiento opcional. El puerto calcula `subject_ref`, agrega la sal y arma `value` (D3); nunca manda nombres. Las listas se leen del índice directamente de la red: **no hay índice en el servidor** y nada depende de confiar en Yucu. Un explorador con búsquedas libres sí necesitaría un indexador; si llega a hacer falta, se usa el de Attest Protocol o un proveedor de la lista oficial de Stellar.

**D10. Colaborar con Attest Protocol, no competir.**

1. Yucu usa Attest Protocol como base y **no despliega un registro propio**.
2. Los cambios aceptados en #126, #127 y #128 se proponen como PR a su rama `canary`. Si los hacen estudiantes, cuentan como contribución al ecosistema, pero no suman puntos de Drips en este repositorio; se decide caso por caso.
3. Mientras no exista v3, todo se construye contra v2 en testnet y contra la versión simulada de `AttestationPort` (#141). El formato de D3 funciona igual en v2 y en v3.
4. Si Attest Protocol se abandona, el índice y el adaptador permiten cambiar de base sin tocar las pantallas: el índice recibe las mismas llamadas `onattest` y `onrevoke` de cualquier registro con esa interfaz.
5. La interfaz del índice y el formato de D3 se pueden proponer como SEP **junto con** ese equipo, siguiendo el proceso oficial: primero una discusión pública, después el borrador.
6. **Build verificado antes de mainnet.** Al 29 de octubre de 2026, los contratos de Attest Protocol aparecen como *unverified* en StellarExpert: nadie ha comprobado públicamente que el wasm desplegado (`2b699bf3…`, el mismo en testnet y mainnet) salga del código auditado. Se pidió a daccred un release verificado ([daccred/attestprotocol#130](https://github.com/daccred/attestprotocol/issues/130)) y los alumnos intentan reproducir el build (issue W55). Yucu no emite en mainnet hasta que se cumpla una de estas, en orden:
   1. daccred publica un release y StellarExpert verifica el wasm desplegado;
   2. el build se reproduce con un commit que incluye las correcciones de la auditoría de Halborn, y el resultado se publica;
   3. daccred vuelve a desplegar desde un release verificado (cambia la dirección; el adaptador de `AttestationPort` lo absorbe);
   4. como último recurso, Yucu despliega su propia instancia del código auditado, con build verificado. Se pierde el registro compartido con el resto de Stellar, así que esta opción necesita una decisión explícita del mantenedor.

## 4. Calidad exigida

* Especificación de `value`, del manifiesto y del índice, con **vectores de prueba**.
* Una prueba positiva y una negativa por regla (AGENTS.md), con `try_...` y `assert_eq!(res, Err(Ok(Error::X)))`.
* Pruebas de lo que hace a esta capa mejor que las alternativas (sección 5):
  * la artesana revoca su consentimiento y la colaboración de la marca deja de valer;
  * el índice rechaza una llamada que no viene de Attest Protocol;
  * `list_by_subject`, `list_by_attester` y `list_by_recipient` devuelven exactamente lo emitido, sin servidor;
  * `schema_stats` sube en 1 al emitir y `revoked` sube en 1 al revocar, y una emisión rechazada por las reglas no cambia nada;
  * una cuenta distinta del emisor paga la transacción sin poder cambiar lo firmado;
  * una llave no exportable del teléfono firma una emisión;
  * el costo real de una emisión con el índice, medido en testnet.
* Modelo de amenazas (STRIDE) del índice y de cada contrato de reglas.
* Auditoría externa del índice y de las reglas antes de mainnet. La base ya está auditada; su v3 la revisan sus mantenedores. El Soroban Security Audit Bank solo atiende proyectos financiados por el SCF.

## 5. Ventajas frente a EAS, y lo que falta demostrar

Revisado en el contrato oficial de EAS (`EAS.sol`) el 28 de octubre de 2026. Solo cuentan cuando existan en código y pasen las pruebas de la sección 4.

| Ventaja | EAS (comprobado en su código) | Este diseño |
|---|---|---|
| La persona de la que se habla puede retirar su palabra | Solo revoca el emisor (líneas 526 y 527) | El consentimiento lo emite ella, y la colaboración depende de él (D6) |
| "Válida" es válida | `isAttestationValid` solo revisa que el ID exista (líneas 381 a 383) | `is_valid_for` (v3) y el índice revisan revocación, vencimiento, esquema y sujeto |
| Otra cuenta paga | Funciones de delegación aparte, con EIP-712 | Autorización nativa de Soroban (D8) |
| Llave del teléfono | Las cuentas normales usan secp256k1, que WebCrypto no soporta | ed25519 en cuentas `G…` y secp256r1 en cuentas de contrato |
| Listar sin servidor | No hay listas en el contrato; depende de su API GraphQL | Listas por sujeto, emisor y destinatario en el índice (D2) |
| Privacidad | `data` va en claro | Hash con sal obligatoria (D3) |

**Donde EAS va adelante:** su sitio oficial reporta más de 9.5 millones de atestaciones y más de 450 mil emisores en más de 13 redes, con explorador, API y SDK. Ninguna cadena comprueba el mundo físico: la confianza viene del emisor y del proceso de campo.

## 6. Consecuencias

* **Se descarta el núcleo propio.** `contracts/attestation_registry` queda como material de práctica y no se redespliega: sale del alcance de #110. #100 se cierra.
* `perpetual_royalties` sigue usando `provenance_attestation_uid` (32 bytes); el ID ahora viene de Attest Protocol. Hasta v3, comprueba la atestación con el índice, no solo con "existe".
* El trabajo de los alumnos cambia de forma: menos contrato base y más índice, reglas, puerto, verificador y motor de voz (ADR-007). Las issues afectadas reciben un recuadro: #140, #141, #142, #143, #148, #151, #110 y #100.
* **No se construye un indexador.**
* El widget de #79 se vuelve parte del verificador.
* Los documentos de `docs/standards/` sobre atestaciones siguen obsoletos.

## 7. Alternativas descartadas

* **Núcleo propio** (la versión del 28 de octubre de esta ADR). Daba control total, pero competía con un registro que el SCF ya financió, necesitaba su propia auditoría y duplicaba trabajo. Se descartó cuando Attest Protocol aceptó los cambios.
* **Pedir las listas dentro de Attest Protocol.** Ellos prefieren su indexador; el índice como *resolver* da lo mismo sin cambiar su contrato auditado.
* **Usar su indexador para las listas.** Haría que la verificación dependa de un servidor de terceros. Se deja solo para un explorador futuro.
* **Solo atestaciones fuera de la cadena.** Baratas y sin conexión, pero `perpetual_royalties` no las puede leer. Se mantienen como complemento (D8).

## 8. Preguntas abiertas

1. ¿Cómo se verifica a un grupo o a una marca antes de darlo de alta en las reglas de Yucu, y quién lo decide?
2. ¿Quién paga las comisiones de red y la renta de las atestaciones de origen? ¿El patrocinio de #94 las cubre?
3. ¿Se cobra a los emisores por el servicio (ADR-004, D11)? ¿Cuánto, y lo cobra la misma entidad con RFC?
4. ¿Cuándo despliega Attest Protocol su v3 en testnet? (Se preguntó en #126.)
5. ¿La cofirma alcanza la llamada anidada Attest → índice → reglas (D5)?
6. ¿El índice vive en este repositorio o en uno aparte de la organización, para que otros lo adopten sin la app? (Ver la sección 8 de `docs/arquitectura/README.md`.)

## 9. Fuentes revisadas (28 y 29 de octubre de 2026)

* Código de [`daccred/attestprotocol`](https://github.com/daccred/attestprotocol), rama `canary`, commit `c0c4529`: `contracts/stellar/protocol/src/instructions/attestation.rs` (llamadas a *resolvers* y revocación), `state.rs`, `utils.rs` (cálculo de IDs), `resolvers/src/interface.rs`, `deployments.json`.
* Respuestas en [#126](https://github.com/daccred/attestprotocol/issues/126), [#127](https://github.com/daccred/attestprotocol/issues/127), [#128](https://github.com/daccred/attestprotocol/issues/128) y [#129](https://github.com/daccred/attestprotocol/issues/129).
* Stellar Docs, [State archival](https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival) y [Authorization](https://developers.stellar.org/docs/learn/fundamentals/contract-development/authorization).
* [SEP-53](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md) y el [proceso de los SEP](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/README.md).
* Stellar Docs, [getLedgerEntries](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLedgerEntries) (hasta 200 llaves por llamada).
* [Soroban Security Audit Bank](https://stellar.org/grants-and-funding/soroban-audit-bank).
* [Stellar Attestation Service en el SCF](https://communityfund.stellar.org/project/stellar-attestation-service-lda).
* EAS, [`EAS.sol`](https://github.com/ethereum-attestation-service/eas-contracts/blob/master/contracts/EAS.sol) y [sitio oficial](https://attest.org/).
