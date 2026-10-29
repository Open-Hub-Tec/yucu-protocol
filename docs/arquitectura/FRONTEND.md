# Guía del front end

Esta guía es para los equipos que trabajan pantallas. La app la usan artesanas y productores de la Mixteca: muchas personas son mayores, ven poco con el sol y usan WhatsApp con notas de voz, pero no formularios. **La meta es que puedan pedir lo que quieren hablando o escribiendo, como en WhatsApp, y que todo se lea en letra grande.** Si una pantalla obliga a llenar un formulario, a leer letra chica o a entender una palabra técnica, está mal hecha aunque funcione.

Donde una issue diga algo distinto, manda la issue; si te parece que la issue está mal, coméntalo en ella antes de programar. Léela junto con [`AGENTS.md`](../../AGENTS.md), [ADR-004](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) (la artesana solo ve pesos), [ADR-006](../adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md), [ADR-007](../adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) y [ADR-008](../adr/ADR-008-COMMUNICATION-CHANNELS-AND-WHATSAPP-ALTERNATIVES.md) (chat propio en lugar de WhatsApp).

## 1. Lo que dijo el campo

Pruebas con unas 7 personas en 4 comunidades ([`HITO_1.2`](../ux-testing/HITO_1.2_AUDITORIA_FRICCION_UX.md) y los archivos de su matriz: `TIJALTEPEC_FRICTION_AUDIT.md`, `TEST_02` y `TEST_03`):

| Hallazgo | Qué exige a la app |
|---|---|
| Grabar una nota de voz les sale en segundos; ya lo hacen en WhatsApp | La voz es la entrada principal; escribir siempre es opción |
| Una persona dejó presionado el botón en lugar de tocarlo una vez | El botón de grabar funciona **de las dos formas**: tocar para empezar y tocar para enviar, o mantener presionado y soltar |
| La letra chica y gris no se lee con el sol | Letra grande de verdad, contraste alto, nada de texto gris claro (sección 4) |
| Miedo a "borrar algo" o "romper" el teléfono | Toda acción se puede cancelar; antes de algo importante, la app explica qué va a pasar |
| El sello se confundió con un trámite de Hacienda | Explicar el sello en una frase: "Este sello dice que tú lo hiciste. No cobra nada." |
| Primero quieren ver quién lo hizo y de dónde es | Lo comunitario arriba; lo técnico, escondido o fuera |

## 2. La app es un chat

La pantalla principal es una conversación, como WhatsApp: burbujas, una caja para escribir y un botón grande de micrófono. Encima de la caja, **botones de respuesta rápida** con lo más usado ("Registrar", "Mis pagos", "Cobrar"). El menú numerado ("diga 1, 2, 3 o 4") se queda para quien lo prefiera.

Reglas del chat:
* **Voz o texto, siempre.** Nunca una pantalla que solo acepte escribir.
* **Cada respuesta se puede escuchar** con un botón "Escuchar" (sección 5), y las de confirmación se leen solas.
* **Una idea por mensaje**, máximo 2 renglones, y como mucho 3 botones.
* **Nada técnico:** ni hash, ni billetera, ni USDC, ni XLM, ni dirección, ni llave (sección 6).
* **Nunca se firma desde una burbuja.** El chat abre la pantalla de la función y la firma pasa por la pantalla accesible de #97.

## 3. El motor de pedidos

Es lo que convierte "quiero cobrar lo de mi miel" en abrir la función de cobro. Tiene tres capas, de la más barata a la más cara:

```
Lo que dijo o escribió la persona
        │
        ▼
1. En el teléfono, sin señal ni IA ─── números del menú ("2") y frases conocidas
        │ no reconoció                  ("mis pagos", "cobrar", "registrar")
        ▼
2. IA en el servidor (W52 #181) ───────── interpretRequest(texto) → una función de la
        │ no está segura                lista cerrada + sus datos + qué tan segura está
        ▼
3. Preguntar ─────────────────────── "¿Quieres registrar un producto o ver tus
                                        pagos?" con 2 o 3 botones, o el menú
```

`interpretRequest` es un **cuarto trabajo de IA**, nuevo, que construye W52 #181 sobre el puerto de #154 (ADR-006, D2, ampliada). #154 no lo construye.

**El catálogo de funciones es cerrado.** La IA solo puede elegir de esta lista; si devuelve otra cosa, se descarta:

| Función | Ejemplos de lo que dice la persona | ¿Firma? | Issue |
|---|---|---|---|
| `registrar_producto` | "Tengo 20 kilos de café", "quiero subir mi huipil" | Sí | #155 |
| `ver_mis_productos` | "¿Qué tengo registrado?", "mis lotes" | No | #156 (lista) · #93 (cada lote en la cadena) |
| `ver_mis_pagos` | "¿Ya me pagaron?", "¿cuánto tengo?" | No | #96 |
| `recibir_pago` | "Ya me dijeron que me pagaron" | Sí | #96 |
| `cobrar_en_efectivo` | "Quiero cobrar", "ya estoy en la tienda" | Sí | #114 |
| `cobrar_en_banco` | "Que me lo manden al banco" | Sí | #146 |
| `dar_consentimiento` / `retirar_consentimiento` | "Ya no quiero que usen mi diseño" | Sí | #148 |
| `que_dicen_de_mi` | "¿Qué dicen de mis piezas?" | No | #148 |
| `cambiar_letra` | "Ponlo más grande", "no veo" | No | W51 #180 |
| `ayuda` | "No sé", "¿cómo le hago?" | No | — |

Reglas del motor:
* **Pedir no es hacer.** Una función reconocida **abre** su pantalla con los datos que se entendieron. Lo que mueve dinero o firma siempre pasa por la lectura en voz alta, los botones Sí / No y el PIN (ADR-007, D2).
* **Si no está segura, pregunta.** Nunca adivina entre dos funciones. Un umbral de confianza decide cuándo preguntar; se fija en la prueba de campo (W54 #183).
* **Sin señal, funciona la capa 1** y la app dice "Sin señal. Puedes usar el menú o intentarlo cuando haya señal."
* **La IA solo recibe el texto**, nunca llaves ni datos de la cuenta, y no guarda lo que se dice. Los campos que la persona diga y estén prohibidos (por ejemplo, su nombre en un registro) se descartan.
* El catálogo vive en un solo archivo, con las frases de ejemplo de cada función, para que el teléfono (capa 1) y el servidor (capa 2) usen la misma lista.

**Cómo sabemos que es bueno.** En la prueba de campo (W54 #183) se mide, por observación y sin guardar datos personales: cuántos pedidos se entienden a la primera, cuántas veces hay que corregir un dato, cuánto tarda alguien desde que habla hasta que firma y en qué paso se rinde.

## 4. Letra grande y accesibilidad

**Tres tamaños**, que la persona elige con un botón visible en todas las pantallas o diciendo "ponlo más grande":

| Tamaño | Texto normal | Botón principal | Para quién |
|---|---|---|---|
| Normal | 18 px | 56 px de alto | Quien ve bien |
| Grande | 22 px | 72 px | Personas mayores (recomendado al empezar) |
| Muy grande | 28 px | 96 px | Vista cansada o pantalla con sol |

Reglas:
* **La elección se guarda en el teléfono** y sigue al volver a abrir la app. Hoy se apaga cada vez.
* **Todo tamaño de letra va en `rem`** (por ejemplo, las clases `text-base`, `text-lg` de Tailwind), para que cambie con el tamaño elegido y con el del sistema de Android. **Prohibido `text-[11px]`, `text-[10.5px]` y cualquier tamaño fijo en píxeles, entero o decimal, en código nuevo.** Hoy hay 1,417 tamaños fijos en `src/components/` y `src/App.tsx`, y 453 son de 10 a 11.5 px: W51 #180 los cambia.
* **Ningún texto debajo de 16 px** en el tamaño Normal.
* **Contraste de al menos 7:1** para texto (nivel AAA de WCAG), porque se usa con sol. Nada de gris claro sobre blanco.
* **Con letra Muy grande y una pantalla de 360 px de ancho, nada se corta ni se encima** y no hay desplazamiento horizontal.
* **Cada ícono lleva texto.** Nada se entiende solo por el color.
* **Las áreas que se tocan miden al menos 56 × 56 px** y están separadas para no tocar la equivocada.

## 5. Voz: grabar y escuchar

**Grabar** (ADR-006, ADR-008):
* Botón de micrófono grande, abajo a la derecha, como en WhatsApp. Funciona tocando o manteniendo presionado.
* Mientras graba: un contador, una onda que se mueve y un botón "Cancelar".
* Opus a 24 kbps y como máximo 60 segundos, para que pese poco y quepa en el límite del servidor (#170).
* Antes de la primera grabación, el consentimiento leído en voz alta (#107).
* Sin señal, el audio se guarda en el teléfono solo hasta transcribirlo; después se borra (ADR-006, D5).
* Si la IA no entendió: "No te escuché bien. ¿Lo intentamos otra vez o lo escribes?". Nunca un texto inventado.

**Escuchar:**
* Un solo componente para leer en voz alta, con `speechSynthesis` en español de México, un poco más lento que lo normal, y botones "Escuchar" y "Repetir".
* Si el teléfono no tiene voz en español, se muestra el texto en letra Muy grande y un aviso para la promotora.
* El mixteco está en evaluación (#158): no se promete voz en mixteco hasta esa prueba.

## 6. Palabras

Tú, frases cortas, verbos claros. Ninguna palabra técnica en pantallas de la artesana (ADR-004, D1).

| No digas | Di |
|---|---|
| Billetera, wallet, cuenta Stellar | (nada; no se menciona) |
| USDC, XLM, token | pesos |
| Firmar la transacción | Confirmar con tu PIN |
| Hash, ledger, contrato, blockchain | (nada; si hace falta: "comprobante") |
| Atestación | "lo que dices de tu pieza", "tu permiso" |
| Certificado oficial | "Este sello dice que tú lo hiciste" (nunca "oficial", regla 8) |
| Error 500, falló la solicitud | "Algo salió mal. Inténtalo otra vez." |
| Sincronizando | "Se enviará cuando haya señal" |

Los textos de cada pantalla van juntos en un archivo de textos, no regados en el código, para poder revisarlos y, más adelante, traducirlos.

## 7. Sin señal

| Funciona sin señal | Necesita señal |
|---|---|
| Menú, capa 1 del motor, letra, escuchar | La IA (transcribir, entender pedidos libres) |
| Guardar un registro como borrador | Preparar y enviar la transacción |
| Ver lo que ya se guardó | Ver pagos actualizados |

La app siempre dice en qué estado está algo: "Guardado en tu teléfono", "Se enviará cuando haya señal", "Listo". Las transacciones firmadas no se guardan para después, porque vencen en minutos (#99).

## 8. Dónde va el código

* **Pantallas nuevas en archivos chicos**, agrupados por área: `src/components/<área>/` (por ejemplo `chat/`, `registro/`, `pagos/`, `atestaciones/`). Un archivo de más de 300 líneas casi siempre se puede partir.
* **No agregues código a `ChatScreen.tsx` (2,566 líneas) ni a `RegisterCoffeeLotScreen.tsx` (2,148).** Si tu issue toca esas pantallas, saca la parte que cambias a su propio archivo.
* **Preferencias** (tamaño de letra, idioma, voz) en un solo lugar compartido, guardadas en el teléfono.
* **Solo puertos** (regla 4): las pantallas usan `chain.*` y los puertos de IA, catálogo y sesión. Nada de `fetch` a mano ni `@stellar/stellar-sdk` en `src/components/`.
* **Lo simulado se ve:** `<DemoBadge />` en toda pantalla con datos de demostración.
* **El verificador, la consola y la página de impacto** son entradas aparte del mismo Vite (`verificar.html`, `consola.html`, `impacto.html`); comparten `src/core/` (sección 8 de [`README.md`](./README.md)). El verificador es para compradores: puede mostrar más detalle técnico, pero con las mismas reglas de letra y contraste.

## 9. Pruebas

* La lógica sin pantalla (la capa 1 del motor, el catálogo de funciones, el formato de los textos) va en funciones puras con pruebas en `src/tests/` (agrégalas al script `test`).
* El motor de pedidos tiene pruebas con frases reales de ejemplo: cada función se reconoce con al menos 3 frases, y una frase ambigua termina en pregunta, no en adivinanza.
* Cada PR de pantallas lleva capturas en un celular de 360 px con letra **Normal** y **Muy grande**.
* Revisión de accesibilidad de Chrome (Lighthouse) en las pantallas que cambiaste: 90 o más.

## 10. Mapa de pantallas

| Pantalla | Hoy | Después | Issue |
|---|---|---|---|
| Chat principal | Guion con "agentes" (tesorería, agrónomo) | Motor de pedidos con funciones reales | W52 #181 |
| Letra Grande | Un botón que casi no cambia nada y no se guarda | 3 tamaños en `rem`, guardados | W51 #180 |
| Registrar producto | Formulario de 2,148 líneas; la voz no registra | Habla o escribe → lectura en voz alta → PIN | #155 |
| Firma | — | Pantalla accesible con resumen leído en voz alta | #97 |
| Mis lotes, mis pagos | Datos de demostración | Leídos por los puertos | #93, #95, #156 |
| Cobrar | — | "Ya estoy en la tienda" o banco | #114, #146 |
| Lo que dicen de mí | — | Ver y retirar consentimiento | #148 |
| Pasaporte y QR | Textos que dicen de más | Sello explicado, sin "oficial" | #108, W53 #182 |
| Verificador, consola, impacto | — | Entradas aparte | #142, #143, #151, #165 |

## 11. En qué orden

```
#180 letra grande real ─────────────────────────────────────────────┐
#154 puerto de IA ─▶ #181 motor de pedidos ─▶ #155 registro por voz ─┤
#91 PIN ─▶ #97 pantalla de firma ────────────────────────────────────┼─▶ #183 prueba de campo
#182 ajustes del campo (sello, cancelar, escuchar) ──────────────────┘
#106, #108, #168 textos honestos (antes de mostrar la app a compradores)
```

W51 #180 y W53 #182 no dependen de nadie: son buenas para empezar.

## 12. Lista para tu PR de pantallas

- [ ] Se puede usar con voz y con texto.
- [ ] Ningún tamaño de letra en píxeles; probado con letra Normal y Muy grande en 360 px (capturas en el PR).
- [ ] Contraste de 7:1 o más; nada de texto gris claro.
- [ ] Ninguna palabra de la columna "No digas".
- [ ] Toda acción se puede cancelar, y nada se firma sin lectura en voz alta y PIN.
- [ ] Sin señal, la pantalla dice qué pasa y no se queda trabada.
- [ ] Solo puertos; lo simulado con `<DemoBadge />`.
- [ ] Archivos nuevos chicos; no agregaste código a `ChatScreen.tsx` ni a `RegisterCoffeeLotScreen.tsx`.
- [ ] Pruebas de la lógica en `src/tests/` y en el script `test`.
