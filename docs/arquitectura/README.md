# Arquitectura final de Yucu (propuesta)

* **Estado:** propuesta, octubre de 2026. Se decide en el [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md), que todavía es un borrador. Mientras tanto mandan [`ARCHITECTURE.md`](../ARCHITECTURE.md) y los ADR: si algo de aquí los contradice, manda el ADR.
* **Qué agrega:** las piezas de infraestructura que no estaban contempladas: el **verificador público**, la **consola de emisores**, `AttestationPort` y una API de solo lectura en el servidor.
* **Supuesto abierto:** el diagrama dibuja el verificador y la consola como apps separadas de la PWA de la artesana. La otra opción es una sola PWA con roles.

Leyenda de los diagramas: borde continuo = existe (prototipo o demo) · borde punteado = por construir (issue abierta) · azul = nuevo, no estaba contemplado · amarillo = servicio externo.

## 1. Quién usa qué, y a dónde llega

![Seis capas: personas, apps, puertos, preparar y firmar, Stellar y pagos fuera de Stellar](./yucu-capas.svg)

Las apps solo hablan con los puertos (regla 4 de [`AGENTS.md`](../../AGENTS.md)). Los puertos piden al servidor una transacción sin firmar, la persona la firma en su teléfono y el puerto la envía. El servidor nunca recibe llaves ni dinero. El contrato `fair_escrow` no aparece porque es material didáctico ([ADR-003](../adr/ADR-003-NO-CUSTODIAL-Y-TRUSTLESS-WORK.md)).

## 2. Preparar, firmar en el teléfono, enviar

![Cinco pasos: la app pide, el servidor prepara sin firmar, el teléfono firma con el PIN, el puerto envía y Stellar devuelve un recibo](./yucu-firma.svg)

Sin celular propio, el paso 3 ocurre en el celular de la promotora con la tarjeta QR de la artesana, y la llave se borra al terminar ([ADR-004](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), D4).

## 3. Por dónde pasa el dinero

![Fase 1: pesos directo a la artesana. Fase 2: USDC a un escrow de Trustless Work, la artesana libera a su cuenta y retira a pesos](./yucu-dinero.svg)

Los porcentajes de comisión, regalía y Tequio salen de [`src/config/protocolFees.ts`](../../src/config/protocolFees.ts) (regla 7). Las disputas las resuelve un tercero de confianza (#103).

## 4. Cada pieza y sus issues

| Pieza | Estado | Issues |
|---|---|---|
| PWA de la artesana | Existe (prototipo) | W1 #91 · W2 #92 · W3 #93 · W7 #97 · W9 #99 · W20 #114 · W23 #117 · W25 #119 |
| Compra protegida | Por construir | W4 #94 · W6 #96 · W21 #115 · W22 #116 |
| Verificador público | **Nuevo** | Sin issue todavía. Reutiliza el widget de #79 |
| Consola de emisores | **Nuevo** | Sin issue todavía. Reutiliza la billetera de W21 |
| `AttestationPort` | **Nuevo** | Sin issue todavía |
| `PayoutPort` | Por construir | W18 #112 |
| Simulado y red | Por construir | W5 #95 · W16 #109 · W24 #118 |
| Servidor | Existe | W2 #92 · W13 #106 · W14 #107 · API de lectura (nuevo) |
| Contratos | Por cambiar | W10 #100 · W11 #101 · W17 #110 · `attestation_registry` simplificado: varios emisores, IDs calculados, sin textos ni contador en la cadena (nuevo) |

## 5. Qué cambia respecto a hoy

* Dos apps nuevas para clientes de infraestructura: el verificador público y la consola de emisores.
* Un puerto nuevo, `AttestationPort`, para que esas apps sigan la regla 4.
* `attestation_registry` se simplifica: acepta varios emisores por esquema, calcula los IDs, liga cada atestación a un lote y deja fuera de la cadena los textos, el contador y la firma que no se verificaba.
* El servidor suma una API de solo lectura. No firma ni guarda llaves.

## 6. Lo que falta antes de mainnet

* Entidad constituida con RFC que cobre la comisión.
* Auditoría independiente de los contratos, con reporte publicado.
* Confirmar la conversión a pesos (MXNe a SPEI) y el piloto de MicoPay.
* Piloto de campo con consentimiento y revisión de un abogado ([ADR-004](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), sección 5).
