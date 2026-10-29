# Preguntas para el contador y el abogado

Antes de cobrar cualquier comisión en mainnet ([ADR-004](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), D11), Yucu necesita una opinión profesional. Este documento junta las preguntas para llevarlas a la consulta. Las respuestas se anotan aquí, con la fecha y el tipo de profesional que respondió (sin su nombre si no da permiso).

Nada de esto es una conclusión: son dudas. Las referencias a leyes son para que el profesional sepa por dónde empezar; él dice si aplican.

## Cómo se mueve el dinero hoy (para explicarlo en la consulta)

| Venta | Cómo paga el comprador | Quién recibe | ¿La entidad toca el precio? |
|---|---|---|---|
| México, directa (fase 1) | SPEI o efectivo | La artesana, directo | No. No hay comisión |
| Compra protegida (fase 2) | USDC a un contrato de garantía (escrow) de Trustless Work | El contrato paga a la artesana su precio completo y, en la misma operación, la comisión a la entidad | No. Solo recibe su comisión |
| Reventa | USDC a un contrato | 10 % a la artesana y 2 % a una cuenta de la comunidad | No |
| Servicios a marcas | Transferencia en pesos, con factura | La entidad | Es su propio ingreso |

Ni Yucu ni el grupo guardan llaves ni dinero de las artesanas. Muchas artesanas no tienen RFC ni cuenta bancaria.

## Para el contador

1. **Tipo de entidad.** ¿Qué conviene para cobrar la comisión y los servicios: asociación civil, cooperativa de servicios, sociedad civil o algo dentro del TecNM? ¿Cuánto cuesta constituirla en Oaxaca y mantenerla cada mes (contador, facturas, declaraciones)?
2. **Plataformas digitales.** Si la entidad cobra una comisión sobre ventas de personas físicas, ¿cuenta como plataforma de intermediación (LIVA art. 18-B y 18-J; LISR art. 113-A)? ¿Tendría que retener ISR e IVA y reportar a las artesanas, aunque la entidad nunca reciba el precio?
3. **Si la respuesta a la 2 es sí,** ¿qué pasa con las artesanas sin RFC? ¿Hay un monto o un régimen que las exente?
4. **IVA de la comisión.** ¿Se cobra 16 % cuando el comprador está en México? ¿Y cuando está en el extranjero?
5. **Ingresos en USDC.** ¿Cómo se factura y se declara una comisión que llega en USDC? ¿Con qué tipo de cambio?
6. **Servicios a marcas.** Cobrar por suscripción o por paquete de verificaciones y atestaciones, en pesos y con factura: ¿hay algo especial que cuidar?
7. **Donativos.** ¿Vale la pena tramitar la autorización como donataria para recibir apoyos? ¿Es compatible con cobrar comisiones y servicios?
8. **Comisión del retiro.** Si un proveedor (MoneyGram, Pago46, Etherfuse) le cobra a la artesana por retirar en pesos, y la app suma ese costo a lo que paga el comprador, ¿cómo se trata?
9. **RFC de las artesanas.** Para retirar por SPEI con Etherfuse, la artesana necesita RFC. Si lo saca en línea con su CURP, ¿qué obligaciones fiscales le genera (régimen, declaraciones)? ¿Hay un régimen sin obligaciones para ventas pequeñas?

## Para el abogado

1. **Custodia.** Con este diseño, ¿Yucu, la entidad o el grupo tienen custodia de dinero de terceros?
2. **Ley Fintech.** ¿Repartir la comisión en la misma operación que libera el pago puede considerarse captación de recursos u operar como institución de fondos de pago?
3. **Ley antilavado (LFPIORPI).** ¿Recibir comisiones en USDC y cambiarlas a pesos es una actividad vulnerable con activos virtuales? ¿Qué obligaciones tendría la entidad?
4. **Datos personales.** ¿Una dirección pública por artesana en una cadena de bloques, sin nombre y con datos mínimos (municipio, categoría, rangos), es aceptable?
5. **Tequio.** ¿Quién puede recibir el 2 % de las reventas en nombre de una comunidad que no está constituida?
6. **Consentimiento.** Para la atestación "colaboración con consentimiento" (ADR-005), ¿qué debe contener para servir como prueba ante la ley federal de protección del patrimonio cultural de los pueblos indígenas?
7. **Pagos en pesos con un proveedor regulado.** Si en el futuro las compras de México pasan por un proveedor de pagos con pagos divididos, ¿cambia alguna de las respuestas anteriores?
8. **Datos para el alta en Etherfuse.** Si la app revisa en el teléfono la CURP, el RFC, la CLABE y las fotos de la INE, y el servidor de Yucu solo los reenvía a Etherfuse sin guardarlos, ¿Yucu es responsable o encargada de esos datos bajo la LFPDPPP? ¿Qué debe decir el aviso de privacidad y cómo se documenta el consentimiento de alguien que no lee bien?

## Respuestas

*(Pendiente.)*
