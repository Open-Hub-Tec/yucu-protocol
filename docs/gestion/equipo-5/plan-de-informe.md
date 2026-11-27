# Plan de informe · Equipo 5

**Módulo:** #168 · La IA sugiere, no certifica
**Organización:** Comité Comunitario de Cultura y Lengua de Santa María Cuquila
**Equipo:** @elisa1223 @Yare-mon @DiegoLV117 @DaisyOrtiz2 · eduScrum Master del Sprint 4: @DaisyOrtiz2
**Periodo que cubre:** del 23 de noviembre al 11 de diciembre de 2026 (cronograma de la [propuesta](propuesta.md))

> Privacidad: en este plan y en los informes no van nombres, voces, fotos ni teléfonos de nadie de la comunidad, solo cargos (por ejemplo, "la persona enlace del Comité"). Las notas de voz se envían a la organización; al repositorio solo sube su texto. Seguimos [PRIVACIDAD.md](../../research/PRIVACIDAD.md).

---

## Destinatarios

| Destinatario | Qué necesita saber para decidir | Decisiones que toma |
|---|---|---|
| **Organización** (Comité Comunitario de Cultura y Lengua; contacto: la persona enlace que el Comité designe) | Qué cambió en la app, en palabras sencillas; si cambia alguna fecha acordada; qué necesitamos de ellos (tiempo para la lectura de la carta y para ver la demo) | Aceptar fechas, dar su opinión sobre los textos de la app, aprobar o pedir cambios a la carta en asamblea |
| **Product Owner** (docente, @josealfredo79) | Entregables terminados contra planeados, horas reales contra estimadas, costo, semáforo y bloqueos | Aceptar entregables, priorizar o recortar alcance, revisar y aprobar los PR |
| **Equipo** (@elisa1223 @Yare-mon @DiegoLV117 @DaisyOrtiz2) | Qué le toca a cada quien esta semana, qué está bloqueado y cuánto queda de la reserva de 5 h | Reasignar tareas y usar la reserva |
| **Financiador** (Ola de Drips, solo si la #168 se asigna al equipo en la Ola) | Estado de la issue y del PR | Pago según las reglas de la Ola; no es una fuente con la que planeemos (ver dictamen de la propuesta) |

---

## Matriz de comunicación

| Qué se informa | A quién | Cuándo | Medio | Quién responde | Evidencia que se guarda |
|---|---|---|---|---|---|
| Informe semanal en lenguaje sencillo (una página) | Organización | Cada sábado, a más tardar a las 18:00 | Nota de voz de 1 minuto por WhatsApp a la persona enlace, más la hoja impresa en la siguiente visita | @DaisyOrtiz2 (eduScrum Master) | Texto de la nota en `informe-semana-N.md`; captura de "mensaje entregado" **fuera del repo** |
| Informe semanal con datos del tablero | Product Owner | Cada sábado | Comentario en #201 con enlace al informe | @DaisyOrtiz2 | El comentario en GitHub y el archivo `informe-semana-N.md` |
| Avance diario y bloqueos | Equipo | Al inicio de cada sesión (5 minutos) | Reunión breve y tarjetas del tablero de GitHub Projects | Quien tenga el bloqueo; lo coordina @DaisyOrtiz2 | Movimiento de tarjetas e issues en el tablero |
| Cambio de una fecha comprometida con la organización (semáforo rojo) | Organización y Product Owner | En cuanto se sepa, al menos 3 días antes de la fecha | Llamada o nota de voz a la persona enlace; comentario en #201 | @DaisyOrtiz2 | Minuta en `minutas/` con el acuerdo nuevo |
| Acuerdos de una reunión con la organización | Organización, Product Owner y equipo | El mismo día de la reunión | Minuta leída en voz alta al final de la sesión; copia impresa a la organización | Quien tome la minuta (rota cada reunión) | `minutas/AAAA-MM-DD.md` (sin nombres de la comunidad) |
| Estado del PR de #168 | Product Owner y financiador | Cuando cambie (abierto, en revisión, listo), el mismo día | El propio PR en GitHub | @DiegoLV117 | Historial del PR y comentarios de GitHub Actions |

---

## Formato del informe

Cada informe cabe en **una página** o en **una nota de voz de un minuto**, y siempre tiene las mismas partes:

1. **Periodo:** del lunes al domingo de la semana.
2. **Semáforo:** 🟢, 🟡 o 🔴, con la regla de la sección de semáforo.
3. **Avance contra lo planeado:** qué decía el cronograma de la propuesta para esa semana y qué se hizo en realidad.
4. **Entregables terminados:** con enlace al issue o PR (solo en la versión para el Product Owner).
5. **Siguientes pasos:** qué toca la semana que viene y quién lo hace.
6. **Bloqueos:** qué nos detiene y qué estamos haciendo para resolverlo.
7. **Decisiones que pedimos:** qué tiene que decidir la organización o el Product Owner, y para cuándo.

**Dos versiones del mismo informe:**

- **Para la organización:** lenguaje sencillo y sin palabras técnicas. Por ejemplo, en lugar de "cambiamos el estado `CERTIFIED`", decimos: "La app ya no dice que la computadora certifica; ahora dice que solo sugiere y que una persona decide". Se manda como nota de voz y se entrega impreso en la visita. Si el Comité lo pide, la nota se graba también en tu'un savi con apoyo de quien el Comité designe.
- **Para el Product Owner:** la misma estructura, más las cifras del tablero y los enlaces.

---

## Indicadores de avance

Todos los datos salen del tablero de **GitHub Projects** del equipo, que tiene los campos *Estimación*, *Horas reales*, *Estado* e *Iteración*.

| Indicador | Cómo se calcula | De dónde sale el dato | Meta |
|---|---|---|---|
| Entregables terminados contra planeados | Tarjetas en *Hecho* ÷ tarjetas planeadas en la semana | Vista del tablero agrupada por Iteración | 100 % por semana |
| Horas reales contra estimadas | Suma del campo *Horas reales* ÷ suma del campo *Estimación* | Suma de campos de la vista de tablero | Entre 90 % y 110 % |
| Uso de la reserva | Horas reales por encima de lo estimado, acumuladas | Mismo cálculo, acumulado desde el 23 de noviembre | ≤ 5 h (la reserva de la propuesta) |
| Costo acumulado | Horas reales × $150 + gastos pagados | Tablero y hoja de cálculo de gastos | ≤ $5,700 MXN al 11 de diciembre |
| Burn-up | Horas de entregables terminados, acumuladas por semana, contra la línea del total de 36 h | Gráfica de **Insights** de GitHub Projects (o la hoja de cálculo si Insights no está disponible) | Llegar a 36 h el 11 de diciembre |
| Velocidad | Horas de entregables terminados por semana | Insights / hoja de cálculo | ≈ 15 h por semana (capacidad de la propuesta) |
| Calidad (j) | Horas de prevención ÷ horas de corrección | Campos *Prevención* y *Corrección* del tablero | j ≥ 1.00 |

---

## Semáforo y escalamiento

| Color | Definición medible | Acción | A quién se avisa y cuándo |
|---|---|---|---|
| 🟢 **Verde** | Entregables de la semana ≥ 90 % terminados **y** horas reales ≤ 110 % de lo estimado | Seguir el plan | Informe normal del sábado |
| 🟡 **Ámbar** | Entre 70 % y 89 % de los entregables, **o** se usaron más de 2 h de la reserva | Usar la reserva; reasignar tareas en la reunión breve; avisar en el informe qué se va a recuperar y cuándo | Product Owner en el informe del sábado; a la organización solo si afecta algo que les toca |
| 🔴 **Rojo** | Menos del 70 % de los entregables, **o** se acabó la reserva de 5 h, **o** una fecha comprometida con la organización está en riesgo | Recortar alcance según la regla de la propuesta (D2 y D4 pasan a la siguiente issue) y acordar una fecha nueva | **A la organización, al menos 3 días antes** de la fecha comprometida, por nota de voz o llamada a la persona enlace; al Product Owner el mismo día, con un comentario en #201 |

**Fechas comprometidas con la organización:** lectura de la carta antes del 1 de diciembre y demo en la Feria de Integración del 1 de diciembre. Si alguna está en riesgo, el aviso sale a más tardar el 28 de noviembre.

---

## Herramientas

| Uso | Herramienta | Por qué (costo, conectividad y quién la usa) |
|---|---|---|
| Plan, tareas y horas | **GitHub Projects** (tablero) | Gratis; el equipo y el Product Owner ya lo usan; suma las horas sola. Necesita internet, pero solo lo usa el equipo. |
| Entregables y fechas | **Issues y milestones** de GitHub | Gratis; cada entregable tiene su issue y el milestone del Sprint 4 marca el cierre. Lo revisa el Product Owner. |
| Gráficas de avance | **Insights** de GitHub Projects | Gratis; genera el burn-up a partir del mismo tablero, sin capturar datos dos veces. |
| Respaldo de cifras y gastos | **Hoja de cálculo** (Google Sheets o Excel) | Gratis; funciona sin conexión en la computadora y sirve de respaldo si Insights falla. La usa @DaisyOrtiz2. |
| Informe a la organización | **Nota de voz** por **WhatsApp** | Es lo que la organización ya usa; una nota de 1 minuto pesa poco, se descarga con señal débil y se escucha **sin conexión** después. No exige saber leer en pantalla. |
| Informe y acuerdos en la visita | **Hoja impresa** | Llega aunque no haya señal ni teléfono a la mano; queda en el Comité y se puede leer en asamblea. Costo: unos $5 por hoja. |

**Si no hay señal en Cuquila:** la nota de voz queda en cola en WhatsApp y se entrega en cuanto haya conexión; mientras tanto, la hoja impresa se lleva en la siguiente visita. Ningún informe depende de que la organización tenga internet.
