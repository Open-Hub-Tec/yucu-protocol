# Revisión de textos del pasaporte digital

Pantalla revisada: el pasaporte digital del lote, en `src/components/DigitalPassportScreen.tsx` (rama `main`).
Cómo se revisó: solo con el código. La demo no se pudo abrir, así que esta revisión no mira la pantalla real.
Ancho de referencia: 360 px. Fecha: 25 de noviembre de 2026.

## Tabla de textos

| Línea | Texto actual | Problema | Propuesta |
|---|---|---|---|
| 89 | Nadie puede copiar tu receta ni tu origen. Tu lote cuenta con respaldo comunitario. | promesa sin pruebas | Tu receta y tu origen quedan a tu nombre. Tu grupo te respalda. |
| 198 | ¡Tu cosecha ya está registrada y protegida! | promesa sin pruebas | ¡Tu cosecha ya está registrada! |
| 199 | Nadie puede copiar tu nombre ni regatear tu origen. Tu lote cuenta con respaldo comunitario. | promesa sin pruebas | Tu nombre y tu origen quedan a tu nombre. Tu grupo te respalda. |
| 204 | Ver e Imprimir mi Etiqueta QR Física | palabra técnica | Ver e imprimir mi etiqueta |
| 206 | Hola, le comparto la ficha de demostración de mi cosecha «…» con Sello de Calidad respaldado por el TecNM Tlaxiaco. | promesa sin pruebas | Hola, le comparto la ficha de mi cosecha. |
| 380 | Derecho al Retiro Activo | palabra técnica | Puedes dejar de mostrarte cuando quieras |
| 385 | El sello criptográfico en Stellar (#…) continúa 100% verificado | palabra técnica | Tu sello sigue activo. |
| 404 | Ver Marco Legal | palabra técnica | Ver las reglas |
| 416 | Consentimiento libre otorgado | palabra técnica | Tú diste tu permiso |
| 430 | Dejar de mostrarme | acción poco clara | No mostrar mi ficha |
| 504 | 2. Precio Sugerido Justo | acción poco clara | 2. Precio por kilo |
| 525 | Monto total estimado que debes cobrar directamente | largo | Esto es lo que te deben pagar |
| 590 | Manda la foto y precio sin intermediarios a tus compradores | largo | Manda foto y precio directo a quien compra |
| 611 | Copiar enlace directo de este producto | acción poco clara | Copiar el enlace de tu pieza |
| 628 | Ver Dictamen de Demostración de Calidad (PDF) | palabra técnica | Ver la ficha de calidad (muestra) |
| 631 | Ficha de demostración de origen y sanidad para restaurantes o clientes | largo | Muestra de dónde viene y cómo está |
| 654 | Ver datos técnicos de laboratorio y trazabilidad (Opcional) | palabra técnica | Ver más datos de tu pieza (si quieres) |
| 669 | Aprobado 100% | promesa sin pruebas | Aprobado |
| 703 | 100% Auténtico | promesa sin pruebas | Solo el nombre de la variedad |
| 712 | Garantía de Ganancia por Reventa (…%) | palabra técnica | Si se revende, te toca una parte |
| 715 | Si una tienda, restaurante o distribuidor revende este lote con mayor margen en la ciudad, un …% de cada reventa secundaria te corresponde a ti como productor y …% al Fondo Comunal de la Mixteca. | largo | Si alguien revende tu pieza, una parte es para ti y otra para tu comunidad. |
| 903 | Precio de comercio justo | promesa sin pruebas | Precio que tú pones |
| 923 | Pactar por WhatsApp con … (30 seg) | promesa sin pruebas | Hablar por WhatsApp con … |
| 933 | Comprar este Lote Verificado (Bolsa) | promesa sin pruebas | Comprar este lote |
| 953 | Entrega y Pago 100% Directos: | promesa sin pruebas | Entrega y pago directos: |
| 956 | Yucu no cobra fletes ni comisiones de intermediario. Acuerdas la entrega en persona en la Mixteca o el envío comercial directamente con el productor. | largo | Yucu no cobra por la entrega. Tú acuerdas la entrega con quien compra. |
| 995 | Modelo de Consentimiento y Soberanía Yucu | palabra técnica | Tú decides qué se muestra |
| 998 | Cumplimiento con la Ley de Salvaguarda 2022 y LFPDPPP | palabra técnica | Según la ley que protege tu cultura |
| 1066 | Por qué Stellar solo guarda el Hash SHA-256 | palabra técnica | Por qué solo se guarda un código de tu ficha |
| 1069 | La blockchain no se puede borrar, mientras que la ley mexicana (LFPDPPP) otorga el derecho a retirar o modificar datos personales. | en inglés | Lo guardado no se puede borrar. La ley te deja quitar tus datos. |
| 1085 | Deslinde Logístico Total: Yucu no gestiona fletes, paqueterías ni transporte físico. La entrega o retiro de la pieza es un acuerdo 100% directo y libre entre el comprador y el artesano en taller o parcela. | palabra técnica | Yucu no lleva tu pieza. Tú acuerdas la entrega con quien compra. |

Notas sobre los textos citados: en la línea 206, «…» es el título del lote. En la línea 385, (#…) es el número de registro que muestra la pantalla (viene de los datos del lote). En la línea 712 y en la línea 715, …% es el porcentaje que toma la pantalla de la configuración. En la línea 923, … es el primer nombre de la persona. En la línea 703, «100% Auténtico» es el valor que se muestra cuando el lote no trae variedad.

## Textos que prometen de más

- Línea 89: «Nadie puede copiar tu receta ni tu origen.»
- Línea 198: «¡Tu cosecha ya está registrada y protegida!»
- Línea 199: «Nadie puede copiar tu nombre ni regatear tu origen.»
- Línea 206: «con Sello de Calidad respaldado por el TecNM Tlaxiaco»
- Línea 385: «continúa 100% verificado»
- Línea 669: «Aprobado 100%»
- Línea 703: «100% Auténtico»
- Línea 712: «Garantía de Ganancia por Reventa»
- Línea 903: «Precio de comercio justo»
- Línea 923: «(30 seg)»
- Línea 933: «Lote Verificado»
- Línea 953: «100% Directos»
