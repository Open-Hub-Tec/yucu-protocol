# ADR-007: Motor de atestaciones por voz y texto

* **Estado:** Propuesta (borrador). No se construye nada de aquí hasta que los mantenedores la acepten.
* **Fecha:** 29 de octubre de 2026
* **Decide:** Mantenedores de Yucu Protocol (Open Hub TecNM, Tlaxiaco)
* **Relación:** Generaliza el registro por voz de [ADR-006](./ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md) (D2 a D6) y usa las atestaciones de [ADR-005](./ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) (Attest Protocol, índice, manifiesto). Respeta [ADR-003](./ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md): preparar → firmar en el teléfono → enviar.

---

## 1. Contexto

ADR-006 decidió que la artesana pueda registrar un lote **hablando**, con confirmación en voz alta antes de firmar (#155). Ese flujo sirve para mucho más que lotes: cualquier persona que sabe algo y puede decirlo (un grupo que pesa café, una panadería que registra un horno, una marca que acuerda una colaboración) necesita lo mismo.

Hoy, quien quiere que una IA registre algo **verificable** tiene que resolver por su cuenta cuatro problemas:

1. Convertir voz o texto en datos estructurados **sin que la IA invente**.
2. Asegurar que **la persona confirmó y firmó**, y no la máquina.
3. Decidir qué datos **nunca** suben a la cadena.
4. Contestar preguntas con lo que está probado, sin alucinar.

Lo que hay en Stellar (revisado el 29 de octubre de 2026):

* **Attest Protocol** guarda y revoca atestaciones, con contrato auditado, pero solo ofrece herramientas para programadores: SDK, línea de comandos e indexador. No tiene IA ni pantallas para el usuario final (ADR-005, sección 2).
* **x402** (pagos por consulta para agentes de IA) y **MPP** funcionan en mainnet de Stellar, según la [reunión de desarrolladores de abril de 2026](https://developers.stellar.org/meetings/2026/04/16) y la [documentación oficial](https://developers.stellar.org/docs/build/agentic-payments/x402). La SDF anunció un servidor MCP con x402; no se encontró confirmación de que ya esté publicado.
* Las propuestas de identidad y credenciales para agentes de IA (MCP con credenciales verificables) son productos de proveedores y borradores individuales del IETF, no estándares adoptados.

**Lo que no se encontró en Stellar:** un componente abierto que vaya de la voz de una persona a una atestación firmada por ella, y de vuelta a una respuesta con fuente en la cadena.

## 2. Principio

**La IA habla, la persona firma, la cadena prueba.**

* La IA **prepara y explica**. Nunca firma, nunca emite por su cuenta y nunca certifica.
* La persona **confirma y firma** en su dispositivo, con su llave.
* La cadena **guarda la prueba**, y cualquiera la puede leer sin confiar en Yucu.

## 3. Decisiones

**D1. El manifiesto del esquema es el contrato del motor.** Un JSON público por esquema; su hash va en la definición del esquema en Attest Protocol (ADR-005, D4), así que nadie lo cambia sin que se note. Dice:

```json
{
  "schema": "origen-de-lote",
  "version": 1,
  "fields": {
    "categoria": { "type": "enum", "values": ["cafe", "mezcal", "textil"], "privacy": "public" },
    "municipio": { "type": "enum", "source": "catalogo-municipios", "privacy": "public" },
    "volumen":   { "type": "range", "unit": "kg", "privacy": "public" },
    "foto":      { "type": "file", "privacy": "hash-only" },
    "nombre":    { "privacy": "forbidden" }
  },
  "voice": {
    "ask":     { "es": "¿Qué producto es y cuánto tienes?" },
    "confirm": { "es": "Entendí: {categoria}, {volumen}, de {municipio}. ¿Es correcto?" }
  },
  "signer": "producer",
  "cosigner": null,
  "rules": "solo grupos dados de alta"
}
```

* `privacy` es obligatorio en cada campo: `public` (va al verificador), `hash-only` (solo su hash con sal en la cadena) o `forbidden` (el motor lo descarta aunque la persona lo diga).
* El mismo archivo lo leen el extractor (D2), la pantalla (que pregunta y confirma), la consola de emisores (#143), las reglas (ADR-005, D5) y el verificador (D4).
* La forma final y sus vectores de prueba van en la especificación de #140.

**D2. De la voz al borrador.** El flujo de ADR-006, D3, pero guiado por el manifiesto en lugar de estar escrito para lotes:

1. La persona habla o escribe.
2. Se transcribe (puerto de IA de #154).
3. El extractor llena **solo** los campos del manifiesto, con salida estructurada y validada contra él. Lo que no quedó claro se deja vacío; no se adivina. Los campos `forbidden` se descartan.
4. La app **lee en voz alta** el texto `confirm` del manifiesto, con botones grandes de Sí y No, y deja corregir cada campo con voz o con el dedo.
5. La persona firma: preparar → firmar → enviar, con `AttestationPort` (ADR-005, D9).

Las reglas de ADR-006 siguen igual: el audio no se guarda (D5), las respuestas son honestas (D4) y nunca hay datos reales en el nivel gratuito de AI Studio (D1).

**D3. La IA nunca firma ni certifica.**

* El motor no guarda llaves ni recibe llaves (regla 1 de AGENTS.md).
* No hay "emisión automática": cada atestación pasa por la confirmación de D2.
* Lo que dice la IA y nadie firmó se muestra como sugerencia, nunca como hecho. El esquema "Dictamen de IA" (ADR-005, D4) se muestra siempre así, nunca como certificación (regla 3).
* Por eso se cierra #76 (oráculos autónomos de atestación): choca con este principio.

**D4. Verificador conversacional, con fuente.** Cualquiera pregunta en lenguaje natural ("¿de dónde viene este café?", "¿la artesana dio su consentimiento?") y el verificador:

1. lee las atestaciones del lote o la cuenta directamente de la red (`listForLot`, `verify`);
2. contesta **solo** con lo que dicen esas atestaciones y el manifiesto de su esquema, y cita cada una (emisor, fecha, estado);
3. si algo no está atestado, contesta "eso no está probado", aunque la IA "sepa" otra cosa;
4. distingue vigente, revocada, vencida y archivada.

La IA arma la frase; los hechos vienen de la cadena. Una prueba obligatoria: preguntar algo que no está atestado y comprobar que la respuesta lo dice.

**D5. Servidor MCP: que cualquier agente de IA use el motor.** El motor se expone como herramientas del Model Context Protocol, para que un asistente (de un comprador, una tienda o una marca) pueda:

| Herramienta | Qué hace | Firma |
|---|---|---|
| `verificar` | Estado de una atestación, siguiendo su `ref_uid` | Ninguna |
| `listar` | Atestaciones de un lote, un emisor o una cuenta | Ninguna |
| `explicar_esquema` | Lee el manifiesto: qué prueba y qué no | Ninguna |
| `preparar_atestacion` | Devuelve una transacción **sin firmar** y el texto de confirmación | La firma la hace la persona en su dispositivo |

El servidor MCP nunca firma ni recibe llaves. Es de solo lectura, salvo `preparar_atestacion`, que solo prepara.

**D6. Cobro por verificación (opcional, después).** Las verificaciones de agentes de compradores y marcas se pueden cobrar por consulta con x402 en USDC, hacia la cuenta de la entidad con RFC de ADR-004, D11. Encaja con los servicios para compradores y marcas que ADR-004 ya prevé. No se activa hasta que el contador responda (`docs/sostenibilidad/PREGUNTAS_CONTADOR_Y_ABOGADO.md`) y nunca se cobra a la artesana. La verificación básica en el verificador público sigue siendo gratis.

**D7. "Para cualquier negocio" se demuestra, no se afirma.** El motor solo se describe como general cuando **un segundo negocio**, distinto de la artesanía, funcione **solo con su manifiesto**, sin cambiar código. Mientras tanto se dice "probado con lotes de artesanía". Un candidato es un caso de panadería ya documentado por estudiantes (#127).

**D8. Idiomas.** Español primero. El mixteco queda "en evaluación" hasta la prueba de campo de #158 (ADR-006, D6). El manifiesto guarda los textos por idioma para agregar otros sin cambiar el motor.

**D9. Dónde vive el código.** En este repositorio, sin reorganizar carpetas (`docs/arquitectura/README.md`, sección 8):

* el motor y sus puertos, en `src/core/` (la UI solo habla con los puertos, regla 4);
* los adaptadores de IA y el servidor MCP, junto a `server.ts`;
* si el motor se publica para otros proyectos, pasa a `packages/` con npm workspaces.

## 4. Riesgos

1. **Mixteco:** no está probado que alguna IA lo transcriba bien. La prueba de campo de #158 decide.
2. **Costo de la IA:** cada transcripción y cada respuesta cuesta. Se mide con precios oficiales antes de prometer un precio por verificación.
3. **Errores de extracción:** la confirmación en voz alta (D2) es la defensa. Se mide cuántas veces la persona corrige un campo.
4. **Privacidad:** el manifiesto obliga a clasificar cada campo, y el abogado lo revisa (LFPDPPP; ADR-006, preguntas 1 y 2).
5. **Dependencia de Attest Protocol v3:** sin fecha. El motor funciona contra la versión simulada de `AttestationPort` (#141) y contra v2 en testnet.
6. **Agentes de IA de terceros:** pueden pedir muchas verificaciones. El servidor MCP necesita límites de uso.

## 5. Consecuencias

* Issues que cambian (reciben un recuadro): #140 (incluye el manifiesto), #142 (verificador con respuestas citadas), #154 y #155 (el extractor se guía por el manifiesto), #76 (se cierra, D3).
* Issues nuevas para alumnos, en este orden:
  1. índice de atestaciones como *resolver* (ADR-005, D2);
  2. extractor genérico guiado por el manifiesto;
  3. verificador conversacional con citas (D4);
  4. servidor MCP de solo lectura más `preparar_atestacion` (D5);
  5. segundo negocio solo con su manifiesto (D7).
* El cobro con x402 (D6) no tiene issue hasta que responda el contador.

## 6. Preguntas abiertas

1. ¿Qué segundo negocio se usa para demostrar D7, y quién lo acompaña en campo?
2. ¿El verificador conversacional lo paga Yucu o quien pregunta? ¿Hay un límite gratuito?
3. ¿Qué proveedor de IA cumple ADR-006, D1 a un costo que el proyecto pueda pagar?
4. ¿El servidor MCP se publica como paquete aparte para que otros proyectos lo corran con sus propios esquemas?

## 7. Fuentes revisadas (29 de octubre de 2026)

* Stellar Docs, [Agentic Payments](https://developers.stellar.org/docs/build/agentic-payments) y [x402 en Stellar](https://developers.stellar.org/docs/build/agentic-payments/x402).
* SDF, [x402 on Stellar](https://stellar.org/blog/foundation-news/x402-on-stellar) y la [reunión de desarrolladores del 16 de abril de 2026](https://developers.stellar.org/meetings/2026/04/16).
* Código de [`daccred/attestprotocol`](https://github.com/daccred/attestprotocol) (commit `c0c4529`): `apps/`, `packages/` y `contracts/stellar/`.
* IETF, borrador individual [Agent Passport System](https://ftp.kaist.ac.kr/ietf/draft-pidlisnyi-aps-03.html) (julio de 2026), como ejemplo del estado de los estándares para agentes.
