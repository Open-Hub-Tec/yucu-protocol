# Carta de entendimiento · Equipo 2 — Sprint 4

**Sub-issue:** [#211](https://github.com/Open-Hub-Tec/yucu-protocol/issues/211)  
**Módulo:** [#140 · Attestation specification with test vectors](https://github.com/Open-Hub-Tec/yucu-protocol/issues/140)

> **BORRADOR PARA REVISIÓN CRUZADA.** Los campos entre corchetes se completan con datos reales. En el repo público solo aparecen roles y `@usuario`; la firma, el documento de representación y cualquier dato personal quedan en almacenamiento privado.

**Entre:**

- **Unión de Productores de Miel de San Juan Ñumí, Oaxaca**, representada por [ROL_DE_LA_PERSONA_CON_AUTORIDAD], cuya representación se acredita con un documento que permanece en almacenamiento privado; y
- **Equipo 2 del TecNM Campus Tlaxiaco**, integrado por @LuisAlexisMorales (eduScrum Master), @DiegoSosa-05, @Felix-Angel y @al3-dan.

Los estudiantes **no firman a nombre del TecNM**. Esta carta se hace de buena fe y no crea obligaciones económicas ni legales; no sustituye la revisión jurídica del plantel.

## Antecedentes y propósito

En las sesiones de trabajo del Sprint 1 se registraron entrevistas anonimizadas con compradores y artesanas de la Mixteca. El consolidado público ([Hito 1.3](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/docs/ux-testing/HITO_1.3_VALIDACION_COMPRADORES.md)) reporta 14 participantes (11 compradores o consumidores y 3 estudiantes) y un SUS de 55. Con esa evidencia, la propuesta final define el módulo de atestaciones (#140).

**Propósito:** acordar la entrega de una especificación determinista de atestaciones, cinco esquemas sin datos personales y seis vectores de prueba, para que la organización pueda revisar el origen de sus productos sin exponer a las personas de la comunidad.

## Compromisos del equipo

| Compromiso verificable | Fecha | Responsable |
| --- | --- | --- |
| Entregar `ATTESTATION_SPEC.md` y los 5 manifiestos de esquema | 2026-11-24 | @DiegoSosa-05 |
| Entregar `ids.ts`, los 6 vectores y sus pruebas | 2026-12-01 | @Felix-Angel |
| Reportar avance semanal con datos del tablero y semáforo | 2026-11-23 y cada lunes | @al3-dan |
| Entregar la carta leída y con minuta de la sesión | 2026-12-01 | @LuisAlexisMorales |

Estos compromisos se copian del cronograma de la propuesta final y no prometen más de lo que el equipo puede entregar.

## Compromisos de la organización

| Compromiso | Fecha | Responsable |
| --- | --- | --- |
| Disponer de [TIEMPO_DE_PRUEBA] para probar la demo de lectura de atestaciones | [FECHA_PRUEBA] | [ROL_DE_LA_ORGANIZACIÓN] |
| Proporcionar la información pública necesaria (municipio y tipo de producto), sin datos personales | [FECHA_INFORMACION] | [ROL_DE_LA_ORGANIZACIÓN] |
| Facilitar un espacio para la lectura de la carta y la asamblea | [FECHA_ASAMBLEA] | [ROL_DE_LA_ORGANIZACIÓN] |

Todos los compromisos son **sin costo para la organización**. No se le pide dinero, equipo ni conexión permanente.

## Alcance y exclusiones

Queda escrito que este trabajo:

- es **sin costo** y no genera cobro, comisión ni cuota;
- **no garantiza ventas ni ingresos**;
- **no otorga certificaciones**;
- Yucu es un **prototipo** en la red de prueba de Stellar, no un servicio desplegado para uso público;
- nadie de Yucu ni del equipo guarda las llaves ni el dinero de la organización; cada transacción se firma en el dispositivo de la persona correspondiente.

## Datos personales

Solo se usarán el rol de la persona (por ejemplo, “la presidenta del comité”) y el código de municipio, con el fin de explicar el origen del producto y probar la demo. No se pedirán nombres, teléfonos, CURP, números de control, fotos ni grabaciones. La información sensible se representa con un hash con sal y se guarda en la cadena como una dirección o un código, nunca como nombre. Se aplica el [aviso de privacidad](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/docs/research/PRIVACIDAD.md) y se pide consentimiento libre e informado antes de cualquier entrevista; la persona puede negarse sin consecuencias.

## Propiedad intelectual e imagen

El código de Yucu se distribuye bajo licencia **MIT**. Los diseños, recetas, fotografías y conocimientos tradicionales siguen siendo propiedad de la organización. El nombre y las imágenes de la organización solo se usarán para mencionar su participación en el prototipo y en la Feria de Integración, previa autorización; no se usarán con fines comerciales ni para sugerir respaldo a productos externos.

## Comunicación, vigencia y terminación

- **Contacto del equipo:** @LuisAlexisMorales. **Contacto de la organización:** [ROL_DE_LA_ORGANIZACIÓN].
- **Vigencia:** del 2026-11-20 al 2027-06-30.
- **Terminación:** cualquiera de las partes puede darla por terminada con aviso por escrito con [DIAS_DE_AVISO] días naturales de anticipación.
- **Diferencias:** se resuelven primero con diálogo y, si hace falta, en asamblea, con minuta de los acuerdos.

## Consentimiento informado y firma

La carta se leyó en lenguaje sencillo [Y_EN_SU_LENGUA_SI_APLICA], se dejó tiempo para consultarla en asamblea y se levantó minuta de esa sesión. La firma original y el documento que acredita la representación se guardan fuera del repositorio; aquí solo queda el estado y, cuando corresponda, la huella SHA-256 del PDF firmado.

**Estado: borrador**

Próxima fecha de asamblea: [FECHA_ASAMBLEA].
