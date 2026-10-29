# Base de datos

Este documento describe la base de datos fuera de la cadena: qué tablas hay, qué guarda cada una, quién la escribe y qué **nunca** se guarda. Desarrolla la decisión D7 de [ADR-006](../adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md) y la sección 5 de la [guía del servidor](./SERVIDOR.md). Donde una issue diga algo distinto, manda la issue; si te parece que la issue está mal, coméntalo en ella antes de programar.

## 1. Principios

1. **La cadena manda.** Si la base de datos y Stellar dicen cosas distintas sobre un lote, un pago o una atestación, vale lo de Stellar. La base de datos guarda copias para leer rápido y lo que no cabe en la cadena (fotos, descripciones, precios).
2. **Lo mínimo** (ADR-006, D10). Si un dato no hace falta para vender, verificar o hacer funcionar el servidor, no se guarda.
3. **Las personas son direcciones `G…`.** Ninguna tabla tiene nombre, teléfono, CURP, RFC, CLABE, domicilio, correo ni foto de una persona.
4. **Solo el servidor entra.** La base de datos no se expone al navegador. Si el proveedor trae una API pública (por ejemplo, Supabase con su llave `anon`), queda **apagada**: ninguna llave del proveedor va en el código del teléfono.
5. **Nada se inventa.** Una columna como `tx_hash` solo guarda lo que devolvió la red; si todavía no hay, queda vacía.

## 2. Qué nunca se guarda

| Dato | Por qué | Dónde vive, si vive en algún lado |
|---|---|---|
| Llaves privadas, PIN, contenido de la tarjeta QR | ADR-003 | Solo en el teléfono o en la tarjeta |
| Audio | ADR-006, D5 | Se transcribe y se descarta |
| Nombre, teléfono, CURP, RFC, INE, selfie, CLABE, correo | ADR-004, D9; ADR-006, D10 | El KYC vive en Etherfuse (#146) |
| Códigos de cobro en efectivo (QR de MicoPay, código de Pago46) | Funcionan como dinero (#117, Corrección 2) | Solo en la pantalla de la artesana mientras cobra |
| Fotos de personas | `PRIVACIDAD.md` | — |
| Metadatos de las fotos (GPS, modelo del celular, fecha) | El GPS puede revelar la casa de la artesana | Se quitan en el teléfono (sección 5) |
| Atestaciones | Viven en Attest Protocol y en el índice de Yucu (ADR-005) | Se leen de la red por `AttestationPort` |
| Sesiones (JWT) | Son cortas y se comprueban con su firma | No hace falta guardarlas |

## 3. Tablas

Los tipos son de PostgreSQL. `G…` es una dirección de Stellar de 56 caracteres (`text` con `CHECK` de formato). Los nombres son sugerencias; el equipo de cada issue los puede ajustar en su PR si explica por qué.

### 3.1 Datos de la app

**`grupos`**: cooperativas o grupos de artesanas. Los da de alta el mantenedor con un script de semilla durante el piloto; una pantalla de administración queda para después.

| Columna | Tipo | Nota |
|---|---|---|
| `id` | `uuid` PK | |
| `folio_prefijo` | `text` UNIQUE | Por ejemplo `MIEL`. Prefijo de los folios del grupo (#92) |
| `nombre` | `text` | Nombre del grupo u organización, **nunca** de una persona |
| `municipio_codigo` | `text` | Código de municipio del INEGI |
| `cuenta_comunitaria` | `text` (`G…`), opcional | Recibe el Tequio en reventas (ADR-004, D10) |
| `creado_en` | `timestamptz` | |

**`cuentas`**: cuentas dadas de alta. Las escribe #94; las leen #92 (el certificador solo cofirma a estas) y #157.

| Columna | Tipo | Nota |
|---|---|---|
| `direccion` | `text` (`G…`) PK | |
| `rol` | `text` | `artesana`, `promotora` o `comprador` |
| `grupo_id` | `uuid` FK → `grupos`, opcional | Obligatorio para `artesana` y `promotora` |
| `alta_por` | `text` (`G…`), opcional | La promotora o el grupo que firmó el alta |
| `alta_en` | `timestamptz` | |
| `activa` | `boolean` | `false` deja de patrocinar y de cofirmar, sin borrar el historial |

**`perfiles`**: cómo se muestra la artesana en la tienda (#156).

| Columna | Tipo | Nota |
|---|---|---|
| `direccion` | `text` PK, FK → `cuentas` | |
| `visibilidad` | `text` | Por ahora solo `cooperativa`: se muestra con el nombre de su grupo (ver la sección 7) |
| `visible` | `boolean` | "Dejar de mostrarme": `false` la quita de la tienda |
| `consentimiento_en` | `timestamptz` | Cuándo aceptó aparecer (#107) |
| `revocado_en` | `timestamptz`, opcional | |

**`folios`**: el siguiente número de folio de cada grupo (#92).

| Columna | Tipo | Nota |
|---|---|---|
| `grupo_id` | `uuid` PK, FK → `grupos` | |
| `siguiente` | `integer` | Se toma con una sola sentencia (sección 4) |

**`lotes`**: lo que se registró y lo que no cabe en la cadena (#156, #93).

| Columna | Tipo | Nota |
|---|---|---|
| `codigo` | `text` PK | El mismo folio que en `lot_passport` |
| `productora` | `text` (`G…`), FK → `cuentas` | |
| `grupo_id` | `uuid` FK → `grupos` | |
| `descripcion` | `text` | Del producto, no de la persona |
| `foto_ruta` | `text` | Ruta en el almacén de fotos (sección 5) |
| `foto_sha256` | `text` | Igual al `photoHashHex` registrado en la cadena |
| `estado_cadena` | `text` | `pendiente`, `registrado` o `fallido` |
| `tx_hash` | `text`, opcional | Solo el que devolvió la red |
| `creado_en` | `timestamptz` | |

Los datos que ya están en la cadena (municipio, categoría, variedad, rango de volumen) se leen de `lot_passport` por `LotRegistryPort`. Si se copian aquí para buscar más rápido, la copia se marca como tal y se corrige con lo que diga la red.

**`productos`**: lo que se vende en la tienda (#156).

| Columna | Tipo | Nota |
|---|---|---|
| `id` | `uuid` PK | |
| `lote_codigo` | `text` FK → `lotes` | |
| `precio_centavos` | `integer` | En centavos para no perder decimales. La comisión **no** va aquí: sale de `src/config/protocolFees.ts` |
| `moneda` | `text` | `MXN` o `USDC` |
| `disponibles` | `integer` | |
| `actualizado_en` | `timestamptz` | |

**`pedidos`**: compras con escrow (#96, #115).

| Columna | Tipo | Nota |
|---|---|---|
| `id` | `uuid` PK | |
| `producto_id` | `uuid` FK → `productos` | |
| `comprador` | `text` (`G…`) | |
| `escrow_id` | `text` | El ID de Trustless Work. El dinero no pasa por aquí |
| `estado` | `text` | Copia del estado del escrow; manda el de Trustless Work |
| `creado_en` | `timestamptz` | |

No hay dirección de envío. Ver la sección 7.

**`retiros`**: solo para que la artesana vea en qué va su cobro (estados de #112; tabla de #146).

| Columna | Tipo | Nota |
|---|---|---|
| `id` | `uuid` PK | |
| `cuenta` | `text` (`G…`), FK → `cuentas` | |
| `proveedor` | `text` | `micopay`, `etherfuse` o `pago46` |
| `id_externo` | `text` | El ID que da el proveedor |
| `estado` | `text` | `pending`, `ready`, `collected`, `expired` o `refunded` (#112) |
| `creado_en` | `timestamptz` | |

No se guarda ningún código de cobro.

**`clientes_proveedor`**: el número de cliente en Etherfuse y el estado de su alta (#146 permite guardar solo esto).

| Columna | Tipo | Nota |
|---|---|---|
| `cuenta` | `text` (`G…`), FK → `cuentas` | PK junto con `proveedor` |
| `proveedor` | `text` | `etherfuse` |
| `cliente_id` | `text` | |
| `estado` | `text` | El estado del KYC que reporta el proveedor, sin sus datos |

### 3.2 Estado del servidor

Estas tablas existen porque en Vercel la memoria no se comparte (guía del servidor, sección 5). Cada una va detrás de una interfaz en `src/server/store/`, con una versión en memoria para las pruebas.

**`retos_sesion`**: retos SEP-10 de un solo uso (#157).

| Columna | Tipo | Nota |
|---|---|---|
| `id` | `text` PK | El identificador del reto |
| `direccion` | `text` (`G…`) | |
| `vence_en` | `timestamptz` | Pocos minutos |
| `usado_en` | `timestamptz`, opcional | Se llena al usarlo, con una sola sentencia (sección 4) |

**`contadores`**: límites por cuenta, por día y globales (#92, #94, #170).

| Columna | Tipo | Nota |
|---|---|---|
| `clave` | `text` PK | Por ejemplo `patrocinio:G…:2026-10-29` |
| `cuenta` | `integer` | |
| `vence_en` | `timestamptz` | Para borrar las viejas |

## 4. Operaciones que deben ser de una sola sentencia

Si dos peticiones llegan al mismo tiempo a dos copias del servidor, leer y luego escribir en dos pasos da resultados dobles. Estas operaciones se hacen con una sola sentencia que lee y escribe a la vez:

```sql
-- Usar un reto una sola vez (#157): si no devuelve fila, el reto no sirve.
UPDATE retos_sesion SET usado_en = now()
 WHERE id = $1 AND usado_en IS NULL AND vence_en > now()
 RETURNING direccion;

-- Tomar el siguiente folio (#92).
UPDATE folios SET siguiente = siguiente + 1
 WHERE grupo_id = $1
 RETURNING siguiente - 1 AS folio;

-- Contar y revisar un límite (#92, #94).
INSERT INTO contadores (clave, cuenta, vence_en) VALUES ($1, 1, $2)
ON CONFLICT (clave) DO UPDATE SET cuenta = contadores.cuenta + 1
RETURNING cuenta;
```

Cada una tiene su prueba: dos llamadas al mismo tiempo, y solo una gana (o los dos folios salen distintos).

## 5. Fotos

* Van en un almacén de archivos (el que elija #156: Supabase Storage, Vercel Blob o cualquiera compatible con S3), **no** dentro de PostgreSQL. La tabla `lotes` guarda la ruta.
* **El teléfono quita los metadatos antes de calcular el hash.** Redibuja la foto (por ejemplo, en un `canvas`) y la vuelve a guardar como JPEG; eso borra el GPS, el modelo del celular y la fecha. Después calcula el SHA-256 sobre los bytes completos (#120). Si el servidor quitara los metadatos después, el hash ya no coincidiría con el de la cadena.
* Al recibir una foto, el servidor calcula su SHA-256 y lo compara con `foto_sha256`. Si no coincide, la rechaza (#156). También rechaza una foto que todavía traiga datos de GPS.
* Solo fotos del producto. Tamaño menor al límite de 4.5 MB de Vercel (#170).

## 6. Migraciones, ambientes y borrado

**Migraciones.** Archivos SQL numerados en `src/server/db/migrations/` (`001_grupos.sql`, `002_cuentas.sql`…). Nunca se edita una migración ya fusionada: se agrega otra. #156 escoge la herramienta para aplicarlas y la explica en el README del servidor. Una prueba lee las migraciones y falla si aparece una columna prohibida (sección 2): `nombre` solo se acepta en `grupos`.

**Quién crea cada tabla.** #156 crea la conexión, la herramienta de migraciones y las tablas `grupos`, `perfiles`, `lotes` y `productos`. Cada issue crea las suyas: `cuentas` y `contadores` (#94), `folios` (#92), `retos_sesion` (#157), `pedidos` (#96), `retiros` y `clientes_proveedor` (#146, o el primer equipo que conecte un proveedor real de retiros). Si #156 no se ha fusionado cuando abras tu PR, llega con la versión en memoria y dices qué tabla hará falta (guía del servidor, sección 5).

**Ambientes.**

| Ambiente | Base de datos |
|---|---|
| Tu computadora | PostgreSQL local (por ejemplo, con Docker) o la versión en memoria |
| Pruebas del CI | Versión en memoria. El CI no se conecta a ninguna base |
| Vistas previas de Vercel | Una base de pruebas aparte, con datos inventados, o la versión en memoria con su aviso |
| Production | Su propia base. Mientras todo sea testnet, también solo datos de prueba o de piloto con consentimiento |

En Vercel se usa la cadena de conexión con *pooling* (guía del servidor, sección 6). Nunca se copian datos de Production a otro ambiente.

**Borrado.** La artesana puede pedir que se borre su perfil (ADR-006, D10). Al borrarlo se eliminan su fila en `perfiles`, sus `productos`, las fotos de sus lotes y las columnas de `lotes` que no están en la cadena. Su fila de `cuentas` queda con `activa = false` para que nadie más la dé de alta como suya. Lo que está en la cadena no se puede borrar, y por eso ahí no hay datos personales. Los `pedidos` y `retiros` ya cerrados se conservan mientras el contador y el abogado definen el plazo (sección 7).

**Limpieza.** Un trabajo periódico borra `retos_sesion` y `contadores` vencidos hace más de un día.

**Respaldos.** Los del proveedor, diarios. Antes del piloto, el mantenedor prueba una vez restaurar un respaldo.

## 7. Decisiones pendientes

| Pregunta | Mientras se decide |
|---|---|
| **Dirección de envío del comprador.** Ningún ADR dice quién la guarda | No se guarda. El envío lo coordina el grupo con el comprador fuera de la app. Decide el mantenedor; si se guarda, va en un ADR con aviso de privacidad y plazo de borrado |
| **Mostrar el nombre de la artesana** (`nombre_completo` o `nombre_comunidad` en `ArtisanVisibilityLevel`) | Solo `cooperativa`: se muestra el nombre de su grupo. No se crea columna de nombre hasta que el abogado revise el aviso de privacidad (ADR-006, sección 4) |
| **Cuánto tiempo se guardan pedidos y retiros** | Mientras el piloto dure. Pregunta para el contador y el abogado ([`PREGUNTAS_CONTADOR_Y_ABOGADO.md`](../sostenibilidad/PREGUNTAS_CONTADOR_Y_ABOGADO.md)) |
| **Región donde vive la base de datos** | La que elija #156; pregunta para el abogado (ADR-006, sección 4) |
