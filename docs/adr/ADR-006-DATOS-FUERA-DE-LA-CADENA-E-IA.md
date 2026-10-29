# ADR-006: Datos fuera de la cadena e inteligencia artificial

* **Estado:** Propuesta (borrador). No se construye nada de aquí hasta que los mantenedores la acepten.
* **Fecha:** 29 de octubre de 2026
* **Decide:** Mantenedores de Yucu Protocol (Open Hub TecNM, Tlaxiaco)
* **Relación:** Se apoya en [ADR-002](./ADR-002-COMMUNICATION-CHANNELS-AND-WHATSAPP-ALTERNATIVES.md) (chat propio en lugar de WhatsApp), [ADR-003](./ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md) (puertos, preparar → firmar → enviar) y [ADR-004](./ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md) (D5: lo mínimo en la cadena; D9: los datos de KYC no pasan por Yucu). Privacidad: [`docs/research/PRIVACIDAD.md`](../research/PRIVACIDAD.md).

---

## 1. Contexto

La app de Yucu funciona como un chat tipo WhatsApp para que la fricción sea menor: la artesana habla, y la app debería registrar su producto. La investigación de campo lo apoya: una persona hablante de mixteco dijo que para una persona mayor "puede ser más sencillo hablar y grabar un audio que escribir" (`docs/research/field-interviews/entrevista-04-hablante-mixteco.md`), y los productores de una unión de miel ya reportan "de palabra o por WhatsApp".

Revisión del código el 28 y 29 de octubre de 2026:

**Inteligencia artificial**
* `server.ts` usa `@google/genai` con una `GEMINI_API_KEY` de Google AI Studio para tres cosas: transcribir audio (`/api/transcribe-audio`), conversar (`/api/chat`) y analizar fotos (`/api/analyze-image`).
* `ChatScreen.tsx` graba audio real, pero **el audio no registra el lote**: el flujo es audio → texto → respuesta del bot → un botón que abre el formulario (`RegisterCoffeeLotScreen.tsx`).
* Sin Gemini o sin red, el chat responde con guiones por palabras clave, y algunos **inventan resultados**: la transcripción devuelve "Reporte de voz verificado: Audio recibido con éxito" sin haber escuchado nada; el análisis de foto dice "Aprobación comunal: Calidad avalada… a $45/litro"; un bot afirma que existe "pesaje certificado". Eso choca con la regla 3 de `AGENTS.md`.
* Los términos de la API de Gemini dicen que en los **servicios gratuitos** (AI Studio y la cuota gratuita) Google usa el contenido para mejorar sus productos, que **"revisores humanos pueden leer"** las entradas y salidas, y piden **"no enviar información sensible, confidencial o personal"**. La voz de una artesana es un dato personal.

**Datos fuera de la cadena**
* **No hay base de datos.** Los lotes y productos que ve el comprador están escritos a mano en `src/data/mockData.ts`, con nombres de productores que no dicen ser ficticios.
* Lo que registra la artesana vive solo en el estado de React (`App.tsx`): si cierra la app, se pierde.
* `src/utils/offlineStorage.ts` guarda lotes pendientes en el teléfono (IndexedDB), pero no hay servidor con el cual sincronizarlos.

## 2. Decisiones

**D1. Nunca datos reales en el nivel gratuito de AI Studio.** Para cualquier prueba con artesanas reales, la IA corre en **Vertex AI** (Google Cloud) o en la **API de Gemini de pago**. En Vertex AI, según su documentación de gobierno de datos, Google no entrena con los datos sin permiso; además se desactivan el registro de solicitudes y la caché duradera, y se usa un endpoint regional. El nivel gratuito queda solo para desarrollo con datos inventados. La llave va en `.env` (regla 6).

**D2. La IA detrás de puertos, igual que Stellar.** La UI no llama a un proveedor de IA. Se separan tres trabajos, cada uno con su versión simulada:

| Trabajo | Entra | Sale |
|---|---|---|
| **Transcribir** | Audio | Texto y su idioma, o un error |
| **Extraer el lote** | Texto | Solo los campos permitidos (D3), con salida estructurada y validada |
| **Conversar** | Texto | Respuesta del asistente |

En el servidor, cada trabajo tiene un adaptador por proveedor, así que cambiar de Gemini a otro proveedor no toca las pantallas. En el cliente, la UI usa un puerto en `src/core/` (por ejemplo `AssistantPort`), como manda la regla 4.

**D3. Registro por voz con confirmación.**
1. La artesana graba un audio.
2. Se transcribe (D2).
3. La extracción llena **solo** los campos de `RegisterLotRequest` (ADR-004, D5): categoría y variedad de la lista cerrada, municipio o región, y rango de volumen. **Nunca nombres**, teléfonos, comunidad exacta ni montos. Si un campo no quedó claro, lo deja vacío; no lo adivina.
4. La app **lee en voz alta** lo que entendió ("Entendí: café, unos 3 costales, de [municipio]. ¿Es correcto?") con botones grandes de Sí y No, y deja corregir cada campo con voz o con el dedo.
5. Ella confirma y firma con su PIN o su tarjeta: preparar → firmar → enviar (#91, #93, #117).

La foto del producto sigue el flujo actual (su hash va en `photoHashHex`).

**D4. Respuestas honestas.** Si la IA no está disponible o no entendió, la app lo dice ("No te escuché bien. ¿Lo intentamos otra vez o lo escribes?"). Nunca devuelve una transcripción, un diagnóstico, un precio ni una certificación inventados. Los "agentes" de guion del chat (tesorería, agrónomo, comercial) se reducen a un asistente con flujos reales; lo simulado lleva `source: 'simulated'` y `<DemoBadge />`.

**D5. El audio no se guarda.** Se transcribe y se borra, en el teléfono y en el servidor. Sin señal, se guarda en el teléfono solo hasta transcribirlo al volver la conexión (#99). Antes de grabar por primera vez, consentimiento informado leído en voz alta (#107), que diga a qué proveedor se manda la voz.

**D6. Elegir el proveedor de voz midiendo, no por promesa.** Antes de fijar el proveedor de transcripción, una prueba de campo con grabaciones reales, con consentimiento y guardadas en `.investigacion_privada/` (nunca en el repositorio). Se comparan:

| Candidato | Por qué | Límite conocido |
|---|---|---|
| Gemini en Vertex AI | Es el código de hoy | No hay evidencia de que entienda Tu'un Savi |
| Whisper (OpenAI, licencia MIT, en servidor propio) | El audio nunca sale del servidor de Yucu | Su lista oficial de idiomas no incluye ninguna lengua indígena de México |
| MMS de Meta (en servidor propio) | Es el único que encontramos con variantes de mixteco en su lista (por ejemplo `mib`, `mie`, `mih`, `mil`, `mio`, `mit`, `miy`, `mxt`, `xtm`) | Licencia **CC-BY-NC 4.0 (no comercial)**: sirve para investigación; para uso con comisiones, consultar al abogado |

Se mide cuántos lotes quedan bien registrados por voz comparado con el formulario, cuánto tardan y qué tan bien funciona en español rural y en la variante de Tu'un Savi de la zona. Hasta tener ese resultado, **no se promete soporte de Tu'un Savi**.

**D7. Base de datos fuera de la cadena.** PostgreSQL más un almacén de fotos, solo detrás de la API de `server.ts`. La UI los usa a través de un puerto (por ejemplo `CatalogPort`), con versión simulada. Cualquier PostgreSQL administrado sirve; si se usa uno que se pueda alojar en servidor propio (por ejemplo Supabase), mejor, para no depender de un solo proveedor.

| Dato | Dónde va | Regla |
|---|---|---|
| Catálogo: foto del producto, descripción, precio, disponibilidad | Base de datos y almacén de fotos | Fotos del producto, nunca de personas |
| Lote registrado | En la cadena lo mínimo (ADR-004, D5); en la base de datos, el resto | El hash de la foto en la cadena permite comprobar que la tienda muestra la foto registrada |
| Perfil de la artesana | Dirección `G…`, grupo, código de municipio y nivel de visibilidad (`ArtisanVisibilityLevel` en `src/types.ts`) | Su nombre solo con consentimiento, y como ella elija mostrarlo |
| Pedidos | Base de datos, con el ID del escrow de Trustless Work | El dinero no pasa por la base de datos |
| Retiros | Solo los IDs de MicoPay o Etherfuse y su estado | — |
| Audio | **No se guarda** (D5) | — |
| Datos de KYC | **Nunca** (ADR-004, D9) | — |
| Llaves privadas | **Nunca** (ADR-003) | — |

**D8. Inicio de sesión sin contraseñas ni teléfonos.** El servidor manda un reto y la artesana lo firma con la llave de su teléfono o de su tarjeta (SEP-10 para cuentas `G…`). El servidor solo conoce su dirección pública y entrega una sesión corta. La promotora y los compradores entran igual, con su propia llave. No se guardan contraseñas ni números de teléfono.

**D9. Sin señal primero.** Lo que la artesana registra se guarda en el teléfono (`offlineStorage.ts`) y se sincroniza con el servidor y con la cadena al volver la red (#99). El servidor rechaza un registro repetido (el código del lote es único), así que reintentar no duplica nada.

**D10. Privacidad y datos de demostración.**
* Lo mínimo: si un dato no hace falta para vender o verificar, no se guarda.
* La artesana puede pedir que se borre su perfil y su catálogo. Lo que está en la cadena no se puede borrar, y por eso ahí no va ningún dato personal.
* Los datos de `src/data/mockData.ts` se marcan como ficticios en el código y en la pantalla (`<DemoBadge />`), y no usan nombres de personas reales.
* Aviso de privacidad y región de los datos: preguntas para el abogado (sección 4).

## 3. Consecuencias

* Issues nuevas para alumnos:
  * puerto de IA en el servidor con su versión simulada, y fin de las respuestas inventadas del chat;
  * registro de lote por voz con confirmación (D3);
  * base de datos y `CatalogPort` (D7);
  * inicio de sesión con firma (D8);
  * prueba de campo de transcripción (D6), como issue de investigación.
* Hay que revisar que #106, #108 y #109 cubran las respuestas inventadas del chat (D4); si no, se amplían.
* El chat de `ChatScreen.tsx` (más de 2,500 líneas) se simplifica: menos guion, un flujo real de registro.
* Costos nuevos: la IA de pago y la base de datos. Se estiman en la issue de cada una con precios oficiales del momento; no se escriben cifras sin esa revisión.

## 4. Preguntas abiertas

1. **Abogado:** ¿mandar la voz de una artesana a un proveedor de IA en otro país requiere algo más que el consentimiento y el aviso de privacidad (LFPDPPP, transferencia de datos)? ¿En qué región deben vivir la base de datos y la IA?
2. **Abogado:** ¿usar MMS (licencia no comercial) en una prueba del TecNM es compatible con que Yucu cobre comisiones después?
3. ¿Quién paga la IA de pago y la base de datos mientras no haya ingresos? ¿Cabe en un apoyo del SCF o del TecNM?
4. ¿La prueba de campo de D6 se hace junto con la de pagos (`docs/ux-testing/GUIA_CAMPO_ADR004_PAGOS_EN_PESOS.md`) o aparte?

## 5. Fuentes revisadas

* Google, [Términos adicionales de la API de Gemini](https://ai.google.dev/gemini-api/terms): servicios gratuitos y de pago (revisado el 28 de octubre de 2026).
* Google Cloud, [Gobierno de datos de Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/data-governance): entrenamiento, caché y retención.
* OpenAI, [Whisper](https://github.com/openai/whisper) (licencia MIT) y su [lista de idiomas](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py).
* Meta, [MMS `mms-1b-all`](https://huggingface.co/facebook/mms-1b-all): 1,162 idiomas, licencia CC-BY-NC 4.0.
* [SEP-10](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md): autenticación web con cuentas de Stellar.
* Código de Yucu: `server.ts`, `src/components/ChatScreen.tsx`, `src/components/RegisterCoffeeLotScreen.tsx`, `src/utils/offlineStorage.ts`, `src/data/mockData.ts`, `src/App.tsx`.
