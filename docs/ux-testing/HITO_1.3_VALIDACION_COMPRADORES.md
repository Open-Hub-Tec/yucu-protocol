# Hito 1.3 · Validación con compradores (issue #68)

* **Estado:** consolidado al 27 de octubre de 2026 con lo que entregaron los equipos de 5.º semestre (ISC, TecNM Tlaxiaco). **Actualizado el 9 de noviembre de 2026** con lo que llegó después: [#127](https://github.com/Open-Hub-Tec/yucu-protocol/issues/127), la prueba de Cuquila y el reporte del día de plaza ([#134](https://github.com/Open-Hub-Tec/yucu-protocol/issues/134)). Lo nuevo está en la [sección 7](#7-actualización-del-9-de-noviembre-de-2026); las secciones 1 a 6 se conservan como estaban.
* **Privacidad ([`PRIVACIDAD.md`](../research/PRIVACIDAD.md)):** aquí solo hay roles y municipios. Los nombres de las personas entrevistadas, las fotos, los audios y los PDF originales se guardan en la carpeta privada del equipo (`.investigacion_privada/`), no en el repositorio.

## 1. De dónde salen los datos

| Fuente | Equipo (GitHub) | Fecha | Participantes | Qué se midió | ¿Se usa aquí? |
|---|---|---|---|---|---|
| Entrevista a una compradora, Tlaxiaco | `hernandezsantiagoj843-alt` y equipo | 14 oct 2026 | 1 compradora de productos de la Mixteca | 5 preguntas abiertas. El SUS no se completó porque la participante tenía poco tiempo y no entendió algunas preguntas | Sí |
| Prueba de usabilidad con la PWA ([#82](https://github.com/Open-Hub-Tec/yucu-protocol/issues/82)) | `vallevelascofernando-ship-it` y equipo | 15 y 25 oct 2026 | 3 estudiantes que simulan consumidores éticos | Tareas T1–T5 con *think-aloud* y SUS | Sí, con la salvedad de que no son compradores reales |
| Encuesta a consumidores ([#81](https://github.com/Open-Hub-Tec/yucu-protocol/issues/81)) | `Jorge3105` y equipo | oct 2026 | 3 consumidores | 10 preguntas cerradas sobre hábitos de compra | Sí |
| Requisitos de un comprador de chocolate de metate | `YulianaMorales18` y equipo | oct 2026 | 1 comprador | Entrevista de requisitos. Las tareas y el SUS **no** se midieron: el equipo usó el ejemplo de #68 y lo marcó como referencia | Solo los requisitos y la disposición a pagar |
| [`buyer-validation-report.md`](./buyer-validation-report.md) | `LuisAlexisMorales` | 21 oct 2026 | 6 perfiles (Tlaxiaco, Oaxaca, Huajuapan, Ñumí, Puebla) | Necesidades por frecuencia. No dice fechas ni quién entrevistó | Sí, como indicio |
| "Benchmark resuelto" de #68 y su copia en #84 | — | — | — | Tiempos y SUS de 95 | **No.** Es un ejemplo de cómo llenar el reporte, no una prueba de campo |
| #83 y #85 | — | — | — | La plantilla está vacía | No |

En total hay **14 personas**: 11 compradores o consumidores y 3 estudiantes. Es una muestra exploratoria, útil para orientar el diseño, no para dar porcentajes del mercado.

## 2. Qué dicen los compradores

1. **Quieren saber si de verdad lo hizo una artesana de la región.** Es lo que más frustra a la compradora de Tlaxiaco: "a veces no sé si el producto realmente fue elaborado en la comunidad o si solamente lo están revendiendo". Le pasó una vez: lo descubrió porque vio el mismo producto en otro lugar a otro precio y nadie le supo decir de dónde venía. En el reporte de 6 perfiles, 5 piden confianza en el productor y autenticidad.
2. **Hoy verifican preguntando y comprando en persona.** Preguntan de dónde viene y quién lo hizo, y prefieren los mercados o el trato directo. No tienen forma de saber si el pago fue justo, porque no conocen el costo de producción.
3. **Prefieren tratar directo con quien lo hace.** Aceptan que un intermediario sirva para transportar y vender, pero no que se quede con una parte grande.
4. **Quieren ver precios y costo de envío antes de decidir** (5 de 6 perfiles), un catálogo claro con fotos (6 de 6) y opciones de entrega (4 de 6). El comprador de chocolate pide además ingredientes, porcentaje de cacao, peso, disponibilidad y seguimiento del pedido.
5. **Ningún equipo reporta que se pidieran datos personales de la productora.** En la prueba de #82 se apoyó certificar sin datos personales para proteger su identidad.

Encuesta de #81 (3 personas): compran una vez al mes o cada 3 a 6 meses, gastan de $100 a $500 por compra y compran en mercados, ferias o redes sociales. Los problemas que mencionaron fueron precios altos, no poder localizar a los artesanos y pocas opciones de compra.

## 3. Usabilidad de la PWA

| Medida | Resultado | Fuente |
|---|---|---|
| Tareas completadas | 14 de 15 (93 %) | #82, 3 estudiantes |
| Frustración | 1.2 de 5 | #82 |
| **SUS** | **55 de 100** (participantes: 70, 45 y 50) | #82 |
| SUS con una compradora real | No se pudo completar | Equipo de `hernandezsantiagoj843-alt` |

* **Un SUS de 55 está debajo de 68**, la marca de una usabilidad aceptable. Es el único SUS medido. El 95 del ejemplo de #68 no es un dato de campo.
* **La tarea más difícil fue la T3:** el hash y la tarjeta de Stellar "resultaron demasiado técnicos y generaron confusión". Es la misma fricción que describe el ejemplo de #68.
* **Las preguntas del SUS se entendieron mal** con una compradora real. Para la siguiente ronda conviene leer las afirmaciones en voz alta con palabras sencillas y dejar más tiempo.

## 4. Disposición a pagar más

| Quién | Cuánto pagaría de más si puede comprobar el origen y el pago justo |
|---|---|
| Compradora, Tlaxiaco | Entre 10 % y 15 % |
| Comprador de chocolate de metate | Entre $50 y $100 por kilo |

Son dos respuestas. No alcanzan para fijar precios ni comisiones, pero sí muestran que el sobreprecio que aceptan depende de **poder comprobarlo**.

## 5. Qué cambia para Yucu

| Hallazgo | Qué implica | Dónde |
|---|---|---|
| El hash de Stellar confunde (T3) y el SUS es bajo | El comprador tampoco debe ver hashes ni términos técnicos: un sello que diga "Origen verificado" y, solo si lo pide, el enlace al explorador. Va en la misma línea que ADR-004 (D1) para la artesana | [#98](https://github.com/Open-Hub-Tec/yucu-protocol/issues/98), [#108](https://github.com/Open-Hub-Tec/yucu-protocol/issues/108) |
| Quieren ver precio y envío antes de decidir | La compra muestra precio, costo de envío y fecha aproximada desde el principio. En la fase 2 la comisión va encima del precio y se muestra (ADR-004, D11) | [#96](https://github.com/Open-Hub-Tec/yucu-protocol/issues/96), [#115](https://github.com/Open-Hub-Tec/yucu-protocol/issues/115) |
| Rechazan comisiones altas | Confirma que la artesana no pague y que la comisión sea baja, pública y justificada en `src/config/protocolFees.ts`. El "0 % de comisión" del texto de #68 ya no es cierto para la compra protegida | [ADR-004](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), D11 |
| Les preocupa la reventa | Es justo lo que prueba el pasaporte del lote firmado por la artesana (ADR-004, D3) y el verificador público | [#110](https://github.com/Open-Hub-Tec/yucu-protocol/issues/110), [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) |
| Nadie reporta haber pedido datos personales | Respalda publicar lo mínimo (ADR-004, D5) | — |

## 6. Límites y siguiente ronda

* La muestra es chica y 3 de las 14 personas son estudiantes. Ningún comprador del extranjero participó.
* No hay tiempos por tarea medidos con compradores reales, solo con estudiantes.
* **Siguiente ronda:** de 5 a 8 compradores reales (por ejemplo, en el mercado de Tlaxiaco o en una tienda de artesanías), con la plantilla de [`GUIA_Y_PLANTILLA_ISSUE_ENTREVISTA_COMPRADORES.md`](./GUIA_Y_PLANTILLA_ISSUE_ENTREVISTA_COMPRADORES.md). Hay que medir T1–T5 y el SUS leído en voz alta, y repetir la T3 después de cambiar el sello por un texto sin términos técnicos.

## 7. Actualización del 9 de noviembre de 2026

### 7.1 Fuentes nuevas

| Fuente | Equipo (GitHub) | Fecha | Participantes | Qué se midió | ¿Se usa aquí? |
|---|---|---|---|---|---|
| Cuestionario y entrevistas a compradores de una panadería del centro de Tlaxiaco ([#127](https://github.com/Open-Hub-Tec/yucu-protocol/issues/127)) | `Fidel20-01` y equipo | 27 oct 2026 | 10 compradores (cuestionario) y 2 entrevistas | 6 preguntas cerradas, 1 abierta y un prototipo en papel. Las tareas y el SUS quedaron pendientes | Sí. Ojo: el producto es pan, no artesanía |
| Prueba con una compradora de barro de Santa María Cuquila ([`TEST_06_BARRO_CUQUILA_COMPRADORA_UX.md`](./TEST_06_BARRO_CUQUILA_COMPRADORA_UX.md)) | `elisa1223` y equipo | 24 oct 2026 | 1 compradora real | Entrevista, tareas T1–T5 y SUS | Sí |
| Día de plaza en Tlaxiaco ([`TEST_06_DIA_DE_PLAZA_COMPRADORES_UX.md`](./TEST_06_DIA_DE_PLAZA_COMPRADORES_UX.md), [#134](https://github.com/Open-Hub-Tec/yucu-protocol/issues/134)) | `IsaiasBrayanLopez` y equipo | 28 oct 2026 | 6 perfiles (C1 a C6) | Tareas T1–T5 y SUS de 82.5 | **Todavía no.** Ver 7.4 |
| PR [#195](https://github.com/Open-Hub-Tec/yucu-protocol/pull/195) y [#196](https://github.com/Open-Hub-Tec/yucu-protocol/pull/196) | — | 3 y 4 nov 2026 | — | — | No: siguen abiertos. #195 es un PDF y debe entregarse en Markdown sin datos personales |

Con esto hay **25 personas**: 22 compradores reales y 3 estudiantes, **todos de la Mixteca**. Sigue siendo una muestra exploratoria.

### 7.2 Qué se confirma

1. **El problema es real: no saber si es original.** En #127 es la primera razón para no comprar (4 de 10, empatada con el precio alto). La compradora de Cuquila lo dice así: *"Hay comales que traen de fuera, de fábrica, y los venden como si fueran de aquí. Uno los conoce por el barro, pero la gente de fuera no sabe."*
2. **Pagarían un poco más si se puede comprobar, pero poco.**

   | Quién | Cuánto más pagaría |
   |---|---|
   | 10 compradores (#127) | 3 nada más · 5 hasta 10 % · 2 hasta 20 %. Nadie más de 20 % |
   | Compradora de Cuquila | Comal: de $30 a $50 · olla mediana: de $50 a $80 |
   | Antes (sección 4) | Tlaxiaco: de 10 % a 15 % · chocolate: de $50 a $100 por kilo |

   La cifra que se puede defender es **alrededor de 10 %, con un máximo de 20 %**.
3. **No hace falta exponer a la artesana.** En Cuquila: *"Que ella diga si quiere su nombre. Hay quien no quiere salir."* y *"Que no pongan dónde vive la señora, eso está bien."* Respalda ADR-004 (D5).
4. **No todas las artesanas tienen WhatsApp propio:** *"a veces el hijo les maneja el teléfono"* (Cuquila). Respalda la firma con tarjeta QR (#117) y no depender de WhatsApp.

### 7.3 Qué sigue sin validarse

| Pregunta | Lo que hay | Qué falta |
|---|---|---|
| **¿Es fácil de usar?** | Los SUS confiables son **55** (#82, estudiantes) y **57.5** (Cuquila, 3 de 5 tareas logradas). Los dos están debajo de 68 | Repetir con la versión sin términos técnicos (#98, #108, #182) en la prueba de campo #183 |
| **¿Cómo quieren pagar?** | En #127: efectivo al recoger 7 de 10, transferencia 2 y tarjeta 1. Recoger en Tlaxiaco 6 de 10 | El pago protegido (Trustless Work, USDC, Freighter: #96, #115, #116) está pensado para quien compra **a distancia**, y **no se ha entrevistado a ningún comprador a distancia ni del extranjero**. Entrevistar de 5 a 8 (tiendas de Oaxaca o CDMX, compradores en línea) |
| **¿Quién paga el negocio?** | ADR-004 (D11) propone que marcas y tiendas paguen por verificar origen y consentimiento | Nadie lo ha preguntado: es [#131](https://github.com/Open-Hub-Tec/yucu-protocol/issues/131), sin equipo |

**Para el comprador local, verificar ya tiene valor sin pago en línea:** escanear el QR y ver el origen, y pagar en efectivo como siempre. Conviene que la Feria y la prueba #183 muestren primero eso.

### 7.4 Sobre el reporte del día de plaza (#134)

Su SUS de **82.5** está muy por encima de los otros (55 y 57.5). Además, en las 5 tareas los 6 participantes quedan siempre en el mismo orden de rapidez (C4 la más rápida, C1 la más lenta) y casi en la misma proporción. En campo eso es poco común. **No es una acusación**: puede ser una forma de resumir. Pero hasta que el equipo comparta su hoja de registro o sus notas de campo (sin datos personales), **no se usa como evidencia** ni se cita su SUS.

### 7.5 Cifras que se pueden citar hoy

* "Entrevistamos a 22 compradores de la Mixteca. Su principal miedo es que la pieza no sea original, y la mayoría pagaría hasta 10 % más si se puede comprobar el origen; nadie más de 20 %."
* "La usabilidad medida es baja (SUS de 55 a 57.5) y la estamos mejorando quitando los términos técnicos."

No citar el SUS de 82.5 ni el 95 del ejemplo de #68.

---

Gracias a los equipos de `hernandezsantiagoj843-alt`, `vallevelascofernando-ship-it`, `Jorge3105`, `YulianaMorales18`, `LuisAlexisMorales`, `Fidel20-01`, `elisa1223` e `IsaiasBrayanLopez`.
