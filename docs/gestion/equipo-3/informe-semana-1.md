# Informe semana 1 · Equipo 3

**Periodo:** del 2026-11-16 al 2026-11-23 · **Corte de datos:** 2026-11-23
**Responde:** @IsaiasBrayanLopez · Formato del [plan de informe](plan-de-informe.md)
**Envío a la organización:** pendiente. Se entrega impreso y en nota de voz en la lectura de la carta del 2026-11-26.

## Semáforo

| Parte | Color | Por qué |
|---|---|---|
| Módulo #120 (código) | 🟢 Verde | E1, E2, E4 y E5 terminados antes de su fecha; E3 a medias (falta quitar el GPS), con fecha del 2026-11-26 |
| Entregables de gestión (#212, #213, #214) | 🔴 Rojo | Más de 3 días de atraso contra las fechas del 16 y 17 de noviembre |
| **General** | 🔴 **Rojo** | Se escala al Product Owner en #199 con nueva fecha (abajo) |

## Avance contra lo planeado

| Entregable | Planeado | Estado al corte | Evidencia |
|---|---|---|---|
| #212 Propuesta Final | 2026-11-16 | PR abierto; validador ✅; aprobado por @Jazlynn22 | [PR #340](https://github.com/Open-Hub-Tec/yucu-protocol/pull/340) |
| #213 Plan de informe | 2026-11-17 | Este PR | [#213](https://github.com/Open-Hub-Tec/yucu-protocol/issues/213) |
| #214 Carta (borrador) | 2026-11-17 | Borrador en PR aparte | [#214](https://github.com/Open-Hub-Tec/yucu-protocol/issues/214) |
| E1, E2, E4 y E5 del módulo #120 | 2026-11-24 a 2026-11-28 | ✅ Terminados: fusionado el 2026-11-23 | [PR #341](https://github.com/Open-Hub-Tec/yucu-protocol/pull/341) |
| E3 Foto sin GPS y huella completa | 2026-11-26 | 🟡 A medias: la huella ya usa la foto completa; falta quitar el GPS y los metadatos antes de calcularla, con su prueba | PR #341 (parte de la huella) |
| E6 Revisión y calidad | 2026-11-30 | Pendiente | — |
| E7 Demostración en la Feria | 2026-12-01 | Pendiente | — |

**Planeados con fecha hasta el corte:** 3 (#212, #213, #214). **Terminados de esos:** 0. **Terminados por adelantado:** 4 (E1, E2, E4 y E5).
**Burn-up:** 4 de 10 entregables del alcance total (40 %).

## Indicadores

| Indicador | Estimado | Real | Fuente |
|---|---|---|---|
| Horas de E1, E2, E4 y E5 | 26 h | Por registrar: cada integrante anota sus horas en su issue antes del 2026-11-25 | Propuesta, sección 6; issues del equipo |
| Costo de E1, E2, E4 y E5 | $3,900 MXN (26 h × $150) | Se calcula con las horas reales | Propuesta, sección 6 |
| Cambio en el código del módulo | — | 10 archivos, +345 / −162 líneas | PR #341 |

Datos tomados de las issues y PR con la etiqueta `equipo-3` y del PR #341 el 2026-11-23. El tablero de GitHub Projects no se pudo leer desde la terminal (falta el permiso `read:project`); el siguiente informe usa también su burn-up.

## Siguientes pasos

| Paso | Fecha | Responsable |
|---|---|---|
| Fusionar la Propuesta (PR #340 ya aprobado por @Jazlynn22) | 2026-11-24 | @IsaiasBrayanLopez |
| Terminar E3: quitar GPS y metadatos de la foto antes de la huella, con prueba | 2026-11-26 | @Jazlynn22 |
| Revisión cruzada del borrador de la carta por otro equipo | 2026-11-25 | @AlexViva-0 |
| Lectura de la carta a Yosondua y entrega de este informe impreso | 2026-11-26 | @IsaiasBrayanLopez |
| Demostración del lote de prueba a la organización | 2026-11-28 | @AlexViva-0 |
| Feria de Integración | 2026-12-01 | Todo el equipo |

## Bloqueos

- Los tres entregables de gestión se atrasaron mientras el equipo terminaba el código de #120.
- PR #340 revisado y aprobado formalmente por @Jazlynn22; pendiente su fusión.
- Falta confirmar con Yosondua la fecha de lectura de la carta.

## Decisiones que pedimos

- **Al Product Owner:** aceptar #212, #213 y el borrador de #214 con nueva fecha del 2026-11-24.
- **A la organización:** confirmar si el 2026-11-26 puede recibirnos para leer la carta.

## Versión para la organización (texto de la nota de voz, un minuto)

> Buenos días. Somos el equipo del Tecnológico de Tlaxiaco que trabaja con ustedes en Yucu. Esta semana terminamos la parte de la aplicación que protege la "huella" de cada lote: si alguien cambia la foto, la huella cambia y se nota. Ahora estamos trabajando para que la foto no guarde la ubicación de su casa. Les pedimos dos cosas: recibirnos el 26 de noviembre para leerles una carta de acuerdo, que pueden llevar a su asamblea antes de decidir, y media hora el 28 para enseñarles cómo funciona. No tiene ningún costo y no promete ventas. El 1 de diciembre lo presentamos en la Feria del Tec y están invitados. Gracias.
