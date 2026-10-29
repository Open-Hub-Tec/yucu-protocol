# ADR-004: La artesana cobra en pesos con una cuenta invisible

* **Estado:** Fase 1 aceptada · Fase 2 aceptada solo en testnet (mainnet requiere resolver la sección 5)
* **Fecha:** 26 de octubre de 2026
* **Decide:** Mantenedores de Yucu Protocol (Open Hub TecNM, Tlaxiaco), después de una validación de arquitectura con revisión de código, contratos, integraciones, amenazas, privacidad y experiencia de uso
* **Relación:** Confirma [ADR-003](./ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md) (no custodial; D5: llave en el teléfono de cada persona) y lo adapta a personas mayores con celular compartido. Retoma la tarjeta QR comunitaria de [ADR-002](./ADR-002-OFFLINE-FIRST-PWA-AND-RURAL-IDENTITY.md).

> El nombre del archivo dice "sin billetera" porque así se llamó la primera propuesta. La decisión final es que la artesana **sí tiene su propia cuenta**, pero **invisible**: nunca ve la palabra billetera ni nada de cripto.

---

## 1. Contexto

| Lo que sabemos de las comunidades | Qué implica |
|---|---|
| Las artesanas piensan y cobran en **pesos**; hoy, en efectivo. Piden defender su precio (QR de origen), vender directo y **cobrar rápido**. | La interfaz no habla de cripto. |
| Los grupos están **organizados (asamblea, presidente) pero no constituidos legalmente**: sin RFC ni cuenta bancaria. | El grupo **no debe recibir ni repartir dinero de sus socias**: sería custodia de dinero de terceros por un grupo informal. |
| **Algunas artesanas tienen cuenta bancaria y otras no.** | Hacen falta dos formas de cobrar: SPEI y efectivo. |
| La mayoría tiene **Android y WhatsApp, pero comparte el celular con sus hijos**. | Desbloquear el celular no debe bastar para firmar. |
| Algunas **no tienen celular**. | Hace falta una forma de firmar sin celular propio. |
| Para cobrar en efectivo irían a **tiendas de la cabecera municipal**. | Una red de tiendas es viable si se recluta localmente. |
| Se quiere vender **primero en México y después en el extranjero**. | La primera fase no mueve dinero en Stellar. |

**Requisito legal y de diseño:** para ser no custodial de punta a punta, **la artesana firma y recibe en su propia cuenta**. Ni Yucu ni el grupo controlan su llave ni su dinero. En el registro del lote, su firma es además su **consentimiento y la prueba de su autoría**.

## 2. Qué encontró la validación

| Supuesto | Resultado | Evidencia |
|---|---|---|
| `lot_passport` exige la firma de la productora | ✅ Ya lo hace | `register_lot`: `producer.require_auth()`. |
| Trustless Work paga a un receptor distinto por hito | ✅ | Escrow *multi-release*; el receptor puede ser distinto del *service provider*. Necesita trustline de USDC. Comisión del protocolo: 0.3 %. |
| MicoPay acepta una cuenta de **una sola llave** para crear un retiro | ✅ | Su backend inicia sesión verificando una llave (`challenge.service.ts`); su contrato exige la firma de quien paga. |
| MicoPay acepta una cuenta **multifirma** | ❌ | Por eso se descarta que el grupo reciba el dinero. |
| El QR de MicoPay se cobra horas después | ❌ | Dura **15 minutos** a propósito, por seguridad; la tienda se elige antes de bloquear. El retiro se crea **en la tienda**. |
| Etherfuse paga por SPEI a cualquier artesana | ⚠️ | Exige **CURP, RFC**, correo, identificación, selfie con prueba de vida y una CLABE **a su nombre** (no acepta tarjeta de débito ni efectivo). El retiro sale de su propia cuenta Stellar: ella firma una transacción que arma Etherfuse. Solo para quien tenga RFC. Revisado en su documentación v2 el 28 de octubre de 2026. |
| Un socio puede mandar a Etherfuse los datos de la persona | ✅ | Su "KYC por API" lo permite; a la persona solo se le pide lo que falta. La selfie con prueba de vida **no** se puede mandar por API: la hace ella en la página de Etherfuse. El sandbox es gratuito y funciona en testnet; producción exige el alta real (KYB) del socio. |
| MicoPay acepta USDC | ❌ hoy | Su escrow solo acepta XLM; USDC está pendiente en su plan. El cobro en efectivo de la fase 2 se construye con la versión simulada hasta entonces. |
| Koywe paga en pesos desde la cuenta de la artesana | ❌ | Revisado el 27 de octubre de 2026 en su documentación: no soporta Stellar, y su modelo paga desde el saldo de una empresa, así que Yucu custodiaría el dinero. |
| MoneyGram Ramps o Pago46 pagan en efectivo sin RFC | ⚠️ sin verificar | Los dos cambian USDC en Stellar por efectivo en México. MoneyGram pide identificación oficial en la agencia; Pago46 paga en cadenas de tiendas. Los dos piden dar de alta a la app como socia. No se confirmaron sus comisiones en México ni si tienen puntos cerca de Tlaxiaco. |
| Un escrow de Trustless Work acepta uno o varios hitos | ✅ | De 1 a 50 hitos, cada uno con su monto y su receptora (`core/validators/escrow.rs`, rama `multi-release-main`). |
| La comisión de Trustless Work (0.3 %) se puede cobrar en testnet | ⚠️ por confirmar | En su contrato de código abierto va a una dirección fija que no existía en testnet el 26 de octubre de 2026. Se pregunta en #96. |
| Yucu puede resolver disputas | ❌ | Quien resuelve decide a dónde va el dinero: contradice ADR-003 D1. |
| Un PIN de 4 dígitos protege una llave copiada del celular | ⚠️ | Son 10 000 combinaciones: se pueden probar todas fuera de la app. Se mitiga con llave no exportable, límites y avisos. |

## 3. Decisiones

### Fase 1 — aceptada

**D1. La artesana solo ve pesos.** Tiene su propia cuenta Stellar, pero la interfaz nunca muestra "billetera", USDC, XLM, direcciones, hashes ni llaves. Ve su lote, su QR, cuánto le pagarán en pesos y cuándo.

**D2. Compradores en México: el dinero va directo y en pesos.** SPEI a la artesana con banco, o efectivo al entregar. **El dinero no pasa por Stellar.** En Stellar solo va el **pasaporte del lote**.

**D3. La artesana firma el registro de su lote.** Lo firman **ella y el certificador** (ADR-003 D6). El grupo puede acompañarla, pero no firma por ella.

**D4. Dónde vive su llave.**
* **Con celular:** la llave se genera en su celular, cifrada con un **PIN de 4 dígitos** (botones grandes, issue #97). Se guarda **no exportable** cuando el navegador lo permite. Tarjeta de recuperación en papel que se queda con ella.
* **Sin celular:** su llave va en su **tarjeta QR**, cifrada con un **PIN de 6 dígitos**. La promotora del grupo escanea la tarjeta en su celular, la artesana escribe su PIN, se firma y **la llave se borra de ese celular al terminar**. Nunca se guarda en el celular de otra persona.
* **Límites y avisos:** límite por cobro y aviso por WhatsApp a ella, o a una persona de confianza que ella elija, en cada cobro.

**D5. Una cuenta por artesana y lo mínimo en la cadena.** En el registro van: municipio o región (no la comunidad exacta), categoría y variedad de una lista cerrada, volumen por rangos, hash de la foto y **ningún monto**. Sus lotes quedan ligados a su dirección; esa es la contraparte de firmar ella misma, y la reducción de datos evita que la identifiquen fácilmente.

**D6. El teléfono arma el resumen de lo que se firma** a partir de la transacción, no del texto que manda el servidor.

### Fase 2 — se construye en testnet

Compradores del extranjero y compras protegidas. Los estudiantes la construyen en testnet, sin dinero real. Pasar a mainnet exige resolver la sección 5.

**D7. Pago del comprador.** USDC **desde su propia billetera** (por ejemplo, Freighter), con una guía neutral para conseguirlo. Yucu no integra la compra de USDC (exigiría registrar a Yucu como organización ante Etherfuse) y no ve datos de identidad del comprador. Los compradores de México que prefieran pesos usan la fase 1.

**D8. Escrow de Trustless Work (V1, testnet), *multi-release*.**

| Rol | Quién | ¿Toca dinero? |
|---|---|---|
| Receptora de cada hito | **La artesana** (su cuenta) | Sí, le llega directo |
| Libera el pago (*release signer*) | **La artesana**: cuando el comprador aprueba, le llega "Ya te pagaron. Toca para recibir" y confirma con su PIN | Solo libera hacia su propia cuenta; el contrato no deja cambiar la receptora |
| Marca el hito como "enviado" (*service provider*) | El grupo o la promotora | No |
| Aprueba los hitos | El comprador | No |
| Plataforma (*platform address*) | La entidad constituida que cobra la comisión (D11). En testnet, una cuenta de prueba | Recibe solo su comisión, en el momento de liberar |
| Resuelve disputas | Un tercero, como parámetro (en testnet, una cuenta multifirma de prueba de la asamblea; nunca Yucu) | Decide el reparto en disputa; no debe recibir. **El contrato no lo impide**, por eso es una persona de confianza de las dos partes (#103) |

**Hitos: de 1 a N, según una plantilla.** Por defecto, **un solo hito (100 %)** que se paga cuando el comprador confirma que recibió. Se deja lista una segunda plantilla, "con adelanto" (por ejemplo, 30 % al enviar y 70 % al recibir), que se activa si la visita de campo muestra que las artesanas necesitan el adelanto. Cambiar de plantilla no cambia el contrato ni las pantallas.

**Protecciones del comprador.** Antes de fondear, su app lee el escrow en la cadena y comprueba receptoras, montos, comisión y roles; el contrato rechaza el fondeo si el escrow cambió (`expected_escrow`). Solo aprueba los hitos de la plantilla, así un hito agregado después no se paga.

Si el comprador no aprueba, se puede abrir disputa **15 días** después de "enviado". **Ese plazo lo aplica la app; el contrato no tiene plazos.** Plantillas de hitos, plazo, comisión de Trustless Work (0.3 %) y comisión de la plataforma van en `src/config/protocolFees.ts`. Cada equipo de estudiantes usa su propia API key de testnet en su `.env` local; el CI usa una versión simulada.

**D9. Salida a pesos desde su propia cuenta, detrás de `PayoutPort`.**
* **Efectivo — MicoPay:** cuando la artesana ya está en la tienda, crea el retiro desde su cuenta con su PIN y recibe el QR (vale 15 minutos). No espera a nadie.
* **SPEI — Etherfuse:** solo para quien tenga RFC y cuenta bancaria a su nombre, desde su propia cuenta. Es **opcional**: el efectivo sigue siendo el camino principal, así que la fricción del alta solo la vive quien elige SPEI.
  * **Revisión previa y alta asistida.** Con la promotora, la app revisa en el teléfono, sin conexión y con reglas públicas: formato y dígito verificador de la CURP, del RFC y de la CLABE; que los primeros 10 caracteres de la CURP y del RFC coincidan (si no, avisa sin bloquear); el nombre tal como en la INE; las dos caras de la INE sin reflejos ni partes borrosas, y si traen domicilio; la ocupación con un menú sencillo; el correo con un código. No consulta RENAPO, el SAT ni a terceros.
  * **Yucu solo pasa los datos, no los guarda.** Como la llave de API no puede vivir en el teléfono, `server.ts` reenvía los datos a la API de KYC de Etherfuse en cuanto llegan, sin guardarlos ni escribirlos en logs. Al terminar se borran del teléfono (igual que la regla de la tarjeta en el celular de la promotora, #117). Yucu guarda solo el número de cliente en Etherfuse y el estado del alta. Antes de empezar, consentimiento informado leído en voz alta (#107).
  * **A ella solo le queda la selfie**, dentro de la app, en la página de Etherfuse en español. Aceptar el contrato de Etherfuse lo puede hacer en esa misma página, o dentro de los términos de Yucu si los incluyen.
  * **Retiro sin cripto visible.** Ella firma con su PIN la transacción que arma Etherfuse; Yucu la envuelve en una *fee-bump* para pagar la comisión de red, y las reservas y la *trustline* van patrocinadas (#94). La comisión de socio que permite Etherfuse (hasta 5 %) queda **en 0** en los retiros (D11).
  * Se construye y se prueba ya contra el sandbox de Etherfuse (W34). Para artesanas reales falta el alta de la entidad con RFC como socia y la opinión del abogado sobre los datos personales (sección 5).
* **Candidatos para el efectivo, por verificar:** MoneyGram Ramps y Pago46 (sección 2). Si alguno confirma que acepta la cuenta propia de la artesana, cobra poco y tiene puntos cerca, puede reemplazar o acompañar a MicoPay sin cambiar las pantallas.
* Todos van detrás de `PayoutPort`, con una versión simulada para construir sin esperar a los proveedores.
* **Comisión del retiro:** si el proveedor cobra por retirar, esa comisión no puede salir del precio de la artesana (D11). La app la suma a lo que paga el comprador o, si no se puede, se lo dice a la artesana en pesos antes de retirar. Se decide cuando se conozcan las comisiones reales.

**D10. El grupo nunca recibe dinero de las ventas.** Sus roles son: acompañar el registro, marcar "enviado", y poner el **sello comunitario** en las regalías (`perpetual_royalties`). Se descarta cualquier diseño en que una cuenta del grupo o de una responsable reciba el dinero de las socias. **El escrow no descuenta Tequio.** El Tequio (2 %) solo existe en las **reventas** que pasan por `perpetual_royalties`, y va a una cuenta **de la comunidad que Yucu nunca controla** (en testnet, una cuenta de prueba).

**D11. Sostenibilidad: la artesana nunca paga.** El proyecto necesita ingresos, y los cobra a quien obtiene valor:
* **Comisión de plataforma en la compra protegida (fase 2), encima del precio.** La app ajusta el monto del escrow para que la artesana reciba **su precio completo**. La comisión se reparte en la misma transacción que libera el pago: nadie retiene el dinero, así que no es custodia. Es **un porcentaje con una cuota mínima** (se cobra la mayor de las dos), porque un porcentaje solo sobre piezas de 100 a 500 pesos, que es lo que gastan los compradores encuestados (#81), no alcanza a cubrir el costo de operar. Si la API de Trustless Work solo acepta porcentajes, la app calcula el porcentaje que equivale a la cuota mínima en cada escrow.
* **Servicios para compradores y marcas:** verificación de origen, sello embebible (#79), API de pasaportes, atestaciones (ADR-005) y pasaporte digital de producto (#77). Se cobran a empresas, **fuera de la cadena** (por paquete o por suscripción, con factura), para no recibir criptoactivos de las marcas. Funcionan también en la fase 1 y no tocan el dinero de las artesanas.
* **Tequio comunitario** en las reventas (D10).

Tres condiciones: la comisión va a la cuenta de una **entidad constituida** con RFC que emita facturas (CFDI), nunca a la cuenta personal de un mantenedor; **el porcentaje y la cuota mínima no se inventan**: se definen con cifras justificadas en `src/config/protocolFees.ts` (en testnet se usan valores de prueba marcados como tales); y **ninguna comisión se cobra en mainnet** antes de la opinión fiscal y legal de la sección 5 (preguntas en [`docs/sostenibilidad/`](../sostenibilidad/PREGUNTAS_CONTADOR_Y_ABOGADO.md)).

*Fuera de esta decisión:* cobrar en las compras en pesos de México (fase 1) exigiría que el dinero pase por un proveedor de pagos regulado con pagos divididos. Eso cambia D2 y necesitaría su propio ADR, después de la opinión fiscal.

## 4. Qué cambia

**Fase 1**
* **Contratos** (#110, un solo redespliegue junto con el rol `certifier` del PR #102): se mantiene la firma de la productora; pasaporte que no expira; inicialización segura; `revoke_certification`; regalías robustas ante falta de trustline; campos con formato cerrado.
* **#91:** billetera de cada artesana con PIN, llave no exportable, límites y avisos.
* **#117:** tarjeta QR con la llave cifrada y firma en el celular de la promotora.
* **#92 y #93:** registro firmado por la artesana y el certificador.
* **#118:** configuración de red: leer `contracts/deployments/testnet.json` y elegir entre la versión simulada y testnet.

**Fase 2 (testnet)**
* **#96:** escrow *multi-release* con la artesana como receptora y quien libera, plantillas de 1 a N hitos y comisión de plataforma encima del precio.
* **#112:** `PayoutPort` desde la cuenta de la artesana.
* **#114:** "Ya estoy en la tienda": la artesana crea su propio retiro.
* **#115:** billetera del comprador. **#116:** guía para conseguir USDC.
* **#119:** "Mis cobros": la artesana ve en pesos lo que ha recibido.

## 5. Preguntas abiertas (antes de mainnet)

1. **Campo** (guía en `docs/ux-testing/`): ¿las artesanas recuerdan su PIN? ¿Quién guarda la tarjeta? ¿Cuántas tienen celular propio y RFC? ¿Qué tienda sería la primera?
2. **MicoPay:** ¿cuándo acepta USDC? ¿Haría un piloto en la Mixteca? ¿Agregaría una palabra clave para cobrar? ¿Cuándo llega a mainnet? (Está en desarrollo.)
3. **Etherfuse:** ¿hay alternativa al RFC para montos bajos? ¿Límites y montos mínimos por persona? ¿Aceptan cuentas del Banco del Bienestar y cuentas de bajo nivel? ¿Su revisión de "unos 1.5 XLM" acepta reservas patrocinadas, y aceptan que Yucu envuelva su transacción en una *fee-bump*? ¿Cuáles son los motivos de rechazo más comunes en México? En sus *embedded wallets*, ¿quién guarda la llave? **MoneyGram y Pago46:** ¿aceptan la cuenta propia de la artesana? ¿Cuánto cobran por retirar en México? ¿Tienen puntos cerca de Tlaxiaco? ¿Tienen entorno de pruebas?
4. **Disputas:** quién resuelve (#103).
5. **Sostenibilidad:** qué entidad cobra la comisión (TecNM, una asociación civil o una cooperativa de servicios), cuál es el porcentaje, la cuota mínima y por qué, y cuánto pagaría una marca por los servicios (se valida con marcas en #131, igual que #68 con compradores).
6. **Campo:** ¿las artesanas necesitan un adelanto al enviar? Decide la plantilla de hitos por defecto.
7. **Legal:** confirmar con un abogado que este diseño no tiene custodia por parte de Yucu ni del grupo, que una dirección por persona en una cadena pública es aceptable con la reducción de datos, que la comisión de plataforma no convierte a la entidad en captadora de recursos, y quién puede recibir el Tequio de las reventas. Con un contador: si cobrar una comisión sobre ventas de personas físicas obliga a la entidad a retener impuestos y a reportar a las artesanas como plataforma digital, aunque la entidad no reciba el precio. Si la respuesta es sí, este diseño de comisión se revisa antes de mainnet.

## 6. Consecuencias

**A favor**
* No custodial de punta a punta: ni Yucu ni el grupo controlan la llave o el dinero de la artesana.
* Su firma prueba su autoría y su consentimiento.
* El dinero le llega directo, y MicoPay funciona con su cuenta tal como está hoy.
* Ella sigue viendo solo pesos.

**En contra / riesgos**
* Tiene que recordar un PIN (4 dígitos con celular, 6 con tarjeta).
* Si pierde el celular y la tarjeta de recuperación, o la tarjeta QR, pierde el acceso.
* Sus lotes quedan ligados a una dirección pública (mitigado con lo mínimo en la cadena).
* Un PIN corto se puede adivinar si alguien copia la llave cifrada (mitigado con llave no exportable, límites y avisos).
