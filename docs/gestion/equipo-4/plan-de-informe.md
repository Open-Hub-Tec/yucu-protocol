# Plan de informe y comunicación

**Proyecto:** Yucu Protocol
**Equipo:** Equipo 4
**Sprint:** 4
**Repositorio:** Open-Hub-Tec/yucu-protocol
**Vinculación:** módulo #182; actividades relacionadas #215 y #217

## destinatarios

| Destinatario | Qué necesita saber para decidir | Medio e idioma | Frecuencia |
|---|---|---|---|
| Organización | Avance comprensible, entregables terminados, bloqueos y decisiones solicitadas | Español sencillo; hoja impresa o voz acordada, máximo una página o un minuto | Semanal y antes de cualquier cambio comprometido |
| Product Owner (@josealfredo79 o rol confirmado) | Alcance, prioridad, riesgos, esfuerzo real y decisiones que requieren autorización | GitHub, issue o reunión | Semanal y ante bloqueos críticos |
| Equipo 4 | Tareas propias, responsables, fechas, acuerdos, riesgos y horas restantes | GitHub Projects, Issues y reuniones | Actualización diaria; revisión semanal |
| Miembros de la comunidad | Solo información que les concierne sobre cambios y pruebas, sin nombres ni datos personales | Comunicación acordada por la organización en español y sin exigir señal | Cuando la organización lo autorice |
| Funder, si existe | Resultado verificable, desviación de costo, uso de recursos y decisiones de financiación | Informe breve escrito o reunión | Mensual o al solicitarse |

El Product Owner, el rol o usuario que responda deben confirmarse antes de enviar cada informe. No se incluyen nombres personales de participantes externos.

## matriz de comunicación

| Qué se reporta | A quién | Cuándo | Medio | Quién responde | Evidencia retenida |
|---|---|---|---|---|---|
| Avance semanal y semáforo | Organización y Product Owner | Cada semana, dentro de la semana correspondiente | Documento de una página; hoja impresa si no hay señal | EduScrum Master del equipo: @Paola939 | Copia PDF o Markdown, fecha de envío y confirmación sin datos personales |
| Bloqueo rojo o posible retraso crítico | Organización y Product Owner | Dentro de un día hábil cuando se detecta y al menos 2 días hábiles antes de una fecha comprometida | GitHub issue, llamada acordada o hoja impresa | Responsable asignado por @Paola939 | Issue, decisión registrada y acuse de recibo |
| Estado de tareas e indicadores | Equipo 4 y Product Owner | Revisión diaria; corte semanal | GitHub Projects e Issues | Responsable de cada Issue identificado con `@usuario` | Captura o exportación del tablero, historial de Issues |
| Acuerdos y responsables | Equipo y organización, según el acuerdo | Al cerrar cada reunión | Minuta y tarea en el tablero | Redacta el responsable señalado en la minuta; aprueba @Paola939 | Minuta aprobada y enlace a Issue |
| Cambio de alcance o decisiones | Product Owner y organización | Antes de ejecutar el cambio | Reunión y Issue | Product Owner | Minuta, Issue y comentario de aprobación |

## formato del informe

El informe a la organización tendrá como máximo una página o una nota de voz de hasta un minuto.

1. **Periodo:** fechas reales de inicio y corte.
2. **Avance contra el plan:** porcentaje calculado con entregables cerrados sobre entregables planificados.
3. **Entregables completados:** nombre, enlace y evidencia verificable.
4. **Siguientes pasos:** acción, responsable con `@usuario`, fecha comprometida y criterio de cierre.
5. **Bloqueos:** descripción, impacto, responsable de gestionar la respuesta y fecha límite.
6. **Decisiones solicitadas:** decisión exacta, opciones breves, recomendación y fecha límite de respuesta.

Se escribe en español claro. La organización recibe el texto exacto leído en voz o una copia impresa, según lo acordado.

## indicadores

| Indicador | Definición y cálculo | Fuente | Corte |
|---|---|---|---|
| Entregables completados vs. planificados | Entregables con estado Done divididos entre entregables previstos del mismo periodo × 100 | GitHub Projects: campo Status de los Issues vinculados al Sprint 4 | Semanal |
| Horas reales vs. estimadas | Suma de horas reales dividida entre suma de horas estimadas × 100 | Registro semanal aprobado por el equipo; cada Issue debe tener estimación y horas reales | Semanal |
| Costo acumulado | Horas reales × tasa aprobada en la propuesta + costos aprobados de calidad | Registro de horas y presupuesto de `propuesta.md` | Semanal |
| Burn-up o burndown | Avance acumulado de entregables cerrados por fecha; alternativa de burndown con trabajo restante por fecha | GitHub Projects, exportación de CSV o hoja de cálculo que conserva fecha y estado | Semanal |
| Cumplimiento de hitos | Hitos vencidos cerrados divididos entre hitos vencidos al corte × 100 | GitHub Issues y Milestones | Semanal |

No se inventan cifras. Si Projects no permite exportar un dato, se deja `No disponible` y se indica qué acción hará el equipo para obtenerlo.

## semáforo

| Estado | Definición medible | Acción | Notificación |
|---|---|---|---|
| Verde | Al menos 90% de entregables del periodo completados y ningún hito crítico vencido | Mantener el plan; informar avance normal | Informe semanal acordado |
| Ámbar | Entre 70% y 89% completado, o existe una previsión documentada de retraso de 1 a 2 días hábiles sin bloqueo mayor | Responsable prepara plan de recuperación y solicita ajuste o decisión | Avisar a la organización y al Product Owner dentro de 1 día hábil, antes de que falten 2 días hábiles para la fecha comprometida |
| Rojo | Menos de 70% completado, un hito crítico vencido o un bloqueo que impide un entregable comprometido | Escalar al Product Owner y a la organización; presentar impacto, opciones y decisión necesaria | Avisar dentro del mismo día hábil y a más tardar 2 días hábiles antes de una fecha comprometida |

La definición se aplica con datos del corte semanal. Los umbrales son operativos y deben confirmarse con la organización y el Product Owner antes de usarse como compromiso.

## herramientas

| Herramienta | Uso específico | Por qué conviene | Conectividad y costo | Quién usa |
|---|---|---|---|---|
| GitHub Projects | Registrar Status, entregables y avance para el burn-up | Fuente central, historial y colaboración | Requiere señal para actualizar; cuenta pública sin costo adicional informado; exportar respaldo | Equipo 4 y Product Owner |
| Issues y Milestones | Definir tareas, responsables, fechas, bloqueos y decisiones | Deja trazabilidad y permite vincular evidencia | Requiere señal para consultar o modificar; sin costo adicional informado | Equipo 4; organización solo consulta |
| GitHub Insights | Obtener actividad y contexto auxiliar del repositorio | Ayuda a explicar actividad, pero no sustituye los datos de Projects | Requiere señal; disponible en GitHub sin costo adicional informado | Responsable de seguimiento |
| Hoja de cálculo | Calcular horas, costo y burndown cuando Projects no cubra un dato | Funciona localmente y permite respaldo | Puede prepararse sin señal; se requiere computadora o teléfono | Responsable de presupuesto y seguimiento |
| Nota de voz | Entregar el resumen completo en español a la organización | Es útil si una reunión escrita resulta difícil | Puede grabarse y enviarse por el canal acordado; no se sube al repositorio | EduScrum Master o responsable autorizado |
| Hoja impresa | Entregar una página o el resumen en voz durante jornadas sin señal | Permite alcance físico sin conectividad | Sin señal; costo de impresión incluido solo si la organización lo aprueba | Responsable de entrega acordado |

Cada acuerdo debe convertirse en una Issue del tablero de Equipo 4. En la entrega no se incluyen nombres, voces, fotografías ni teléfonos de personas de la comunidad.
