# Plan de informe · Equipo 2 — Sprint 4

**Módulo:** [#140 · Attestation specification with test vectors](https://github.com/Open-Hub-Tec/yucu-protocol/issues/140)  
**Sub-issue:** [#210](https://github.com/Open-Hub-Tec/yucu-protocol/issues/210)  
**Organización:** Unión de Productores de Miel de San Juan Ñumí, Oaxaca

> **Estado del borrador:** sustituir los corchetes por datos reales. Los integrantes aparecen solo con su `@usuario`; no se publican nombres de personas de la comunidad.

## Destinatarios

| Destinatario | Qué necesita saber para decidir |
| --- | --- |
| Organización (Unión de Productores de Miel de San Juan Ñumí, Oaxaca) | Si el módulo avanza, qué necesita revisar y en qué fecha; en lenguaje sencillo y sin datos personales. |
| Product Owner / docente | Cumplimiento de la propuesta, evidencia del tablero y solicitudes de decisión. |
| Equipo 2 (@LuisAlexisMorales — eduScrum Master, @DiegoSosa-05, @Felix-Angel, @al3-dan) | Qué entregable le toca, bloqueos y próximos compromisos. |
| Financiador (si aplica) | Horas, costo y entregables verificables, sin prometer ventas ni rendimientos. |

## Matriz de comunicación

| Qué se reporta | A quién | Cuándo | Medio | Quién responde | Evidencia que se conserva |
| --- | --- | --- | --- | --- | --- |
| Avance semanal y semáforo | Organización y Product Owner | Cada lunes | Nota de voz de un minuto o hoja impresa de una página; también se sube el texto al repo | @al3-dan | `informe-semana-N.md` y confirmación de recepción |
| Entregables completados y horas | Product Owner y financiador | Al cierre de cada entrega | GitHub Projects, Issues y Milestones | @Felix-Angel | Enlace al tablero, captura de estado y `Insights` |
| Decisiones solicitadas | Organización y Product Owner | Cuando aparezca un bloqueo, antes de la fecha comprometida | Reunión o asamblea y nota de voz | @DiegoSosa-05 | Minuta en `docs/gestion/equipo-2/minutas/` y tarea en el tablero |
| Carta de entendimiento | Organización | [FECHA_LECTURA] y [FECHA_ASAMBLEA] | Lectura en voz alta y copia impresa | @LuisAlexisMorales | Minuta de lectura; la firma original queda fuera del repo |

Todo lo que se reporta a la organización se escribe sin nombres, teléfonos ni cargos personales: solo el rol y la comunidad.

## Formato del informe

El informe cabe en una página (o en una nota de voz de un minuto) y lleva:

1. **Período:** fechas `[DESDE]` a `[HASTA]`.
2. **Avance contra lo planeado:** entregables planeados y completados con datos del tablero.
3. **Entregables terminados:** enlaces a commits, PR o documentos.
4. **Siguientes pasos:** qué se hará y para cuándo.
5. **Bloqueos:** qué impide avanzar y quién puede desbloquear.
6. **Decisión solicitada:** una sola pregunta concreta, con fecha límite de respuesta.

Modelo: [`informe-semana-1.md`](./informe-semana-1.md). El texto se redacta en lenguaje sencillo y, si la organización lo pide, se lee en su lengua antes de enviarse por WhatsApp o en papel.

## Indicadores de avance

| Indicador | Cómo se mide | Fuente del dato |
| --- | --- | --- |
| Entregables completados vs. planeados | Número de tarjetas en `Done` entre tarjetas con fecha de la semana | GitHub Projects del Sprint 4 |
| Horas reales vs. estimadas | Suma de horas registradas menos horas planeadas en la propuesta | Tablero y hoja de cálculo de seguimiento |
| Costo acumulado | Horas reales por tarifa de referencia, sin cobro a la organización | Hoja de cálculo y sección de presupuesto de la propuesta |
| Burndown / burn-up | Avance de tarjetas y alcance acumulado por semana | GitHub Projects (burn-up) o hoja de cálculo (burndown) |
| Pruebas del módulo | Porcentaje de vectores que coinciden con `ids.ts` | `npm test` y PR de #140 |

Cada cifra lleva su fuente. Si el tablero no está disponible, se usa la hoja de cálculo y se anota la fecha de corte; nunca se inventa un dato.

## Semáforo y escalamiento

| Color | Definición medible | Acción |
| --- | --- | --- |
| 🟢 Verde | 100% de los entregables de la semana en `Done`, horas reales ≤ estimadas y sin bloqueos. | Reporte normal el lunes. |
| 🟡 Ámbar | Entre 60% y 99% de entregables en `Done`, o horas reales hasta 20% sobre lo estimado. | Aviso a @LuisAlexisMorales y ajuste del plan en el tablero. |
| 🔴 Rojo | Menos de 60% de entregables en `Done`, horas reales > 20% sobre lo estimado o bloqueo sin solución. | Escalamiento al Product Owner y a la organización. |

**Plazo de aviso:** si una fecha comprometida está en riesgo, se notifica a la organización con al menos **3 días naturales** de anticipación. En caso de sin señal, el aviso se deja por escrito en papel y se conserva la nota de voz local para entregarla cuando haya conexión.

## Herramientas

| Herramienta | Uso | Por qué se eligió |
| --- | --- | --- |
| GitHub Projects | Tablero, burndown/burn-up y estado de entregables | Gratuito, visible para el equipo y con historial; requiere conexión. |
| Issues y Milestones | Seguimiento de #209, #210, #211 y del módulo #140 | Cada acuerdo queda como tarea con responsable y fecha. |
| GitHub Insights | Conteo de commits y participación por integrante | Evidencia automática de trabajo en equipo, sin correos personales. |
| Hoja de cálculo | Horas, tarifas y burndown alternativo | Funciona sin conexión y la puede imprimir la organización. |
| Nota de voz de un minuto | Reporte en lenguaje sencillo | Útil cuando la escritura es difícil; el audio se comparte fuera del repo y solo el texto entra aquí. |
| Hoja impresa y WhatsApp | Entrega final cuando hay sin conexión o poca conectividad | La organización decide qué medio prefiere; ambos son de bajo costo. |

La organización puede elegir papel o nota de voz; el repo público solo guarda el texto anonimizado.
