# Plan de informe · Equipo 3

**Sub-issue:** [#213](https://github.com/Open-Hub-Tec/yucu-protocol/issues/213) · Issue padre: [#199](https://github.com/Open-Hub-Tec/yucu-protocol/issues/199) · Módulo: [#120](https://github.com/Open-Hub-Tec/yucu-protocol/issues/120) · Organización: Yosondua
**Equipo:** @IsaiasBrayanLopez (eduScrum Master), @AlexViva-0, @Jazlynn22

Este plan dice a quién le informamos, qué, cuándo y cómo, para que cada quien pueda tomar decisiones a tiempo. Las fechas y el costo salen de la [Propuesta Final](propuesta.md) (44 h, $6,600 MXN, Feria de Integración el 2026-12-01).

## Destinatarios

| Destinatario | Qué necesita saber para decidir | Decisión que puede tomar |
|---|---|---|
| **Organización Yosondua** (la persona que designe y su asamblea) | Qué hicimos, qué sigue, qué le pedimos (tiempo, espacio, opinión) y que nada le cuesta | Dar o no su tiempo para la lectura y la demostración; firmar o no la carta; pedir cambios |
| **Product Owner** (docente) | Avance contra el cronograma, horas y costo, semáforo, bloqueos y PR listos para revisar | Reprogramar, cambiar alcance, asignar issues, calificar |
| **Equipo 3** | Quién hace qué esta semana, qué está atrasado y qué acuerdos salieron de las minutas | Reasignar tareas en el daily, pedir ayuda |
| **Financiador** | No aplica: el proyecto no tiene financiamiento externo (Propuesta, sección 7) | — |

## Matriz de comunicación

| Qué se informa | A quién | Cuándo | Medio | Quién responde | Evidencia que se guarda |
|---|---|---|---|---|---|
| Informe semanal de una página | Product Owner | Cada lunes | Archivo `informe-semana-N.md` por PR | @IsaiasBrayanLopez | El PR y su revisión |
| Versión sencilla del informe | Organización Yosondua | Cada semana con visita, y antes de cada fecha comprometida | Hoja impresa y nota de voz de un minuto | @Jazlynn22 | Texto de la nota de voz en el repo (nunca el audio) |
| Avance diario y bloqueos | Equipo 3 | Cada día de clase | Daily presencial y comentario en la issue | @IsaiasBrayanLopez | Comentarios en las issues |
| Lectura de la carta y acuerdos | Organización y equipo | 2026-11-26 y cada sesión | Reunión presencial | @AlexViva-0 | Minuta en `minutas/` y una issue por acuerdo |
| Alerta ámbar o roja | Product Owner, y organización si afecta una fecha suya | El mismo día que cambia el semáforo | Comentario en #199; recado impreso o llamada de la persona designada por la organización | @IsaiasBrayanLopez | Comentario en #199 |

## Formato del informe

Una sola página, siempre en este orden:

1. **Periodo** del informe (de qué fecha a qué fecha) y fecha del corte.
2. **Semáforo** general y por entregable.
3. **Avance contra lo planeado:** entregables planeados para el periodo contra terminados.
4. **Entregables terminados**, con enlace al PR o issue.
5. **Indicadores:** horas reales contra estimadas y costo.
6. **Siguientes pasos** con fecha y responsable.
7. **Bloqueos:** qué nos detiene y quién lo puede destrabar.
8. **Decisiones que pedimos** a la organización o al Product Owner.

La versión para la organización es la misma información en palabras sencillas: qué hicimos, qué sigue, qué le pedimos y la fecha. Cabe en media hoja o en una nota de voz de un minuto.

## Indicadores

| Indicador | Cómo se calcula | De dónde sale el dato |
|---|---|---|
| Entregables terminados contra planeados | Entregables cerrados al corte ÷ entregables con fecha hasta el corte | Issues y PR del equipo (etiqueta `equipo-3`) y estado *Done* del tablero de GitHub Projects |
| Horas reales contra estimadas | Suma de horas reales anotadas en cada issue ÷ horas estimadas en la Propuesta (sección 6) | Campo de horas del tablero de Projects; cada integrante anota sus horas reales en su issue |
| Costo real | Horas reales × $150 MXN | Mismo dato de horas; tarifa de la Propuesta |
| Burn-up | Entregables terminados acumulados contra el alcance total (10 entregables: E1 a E7 de la Propuesta más #212, #213 y #214) | Vista de gráfica (*Insights*) de GitHub Projects; si no hay acceso, la hoja de cálculo del equipo con el mismo dato |

## Semáforo

| Color | Definición medible | Acción |
|---|---|---|
| 🟢 **Verde** | Todos los entregables a tiempo y horas reales ≤ 110 % de las estimadas | Seguir el plan; se informa en el informe semanal |
| 🟡 **Ámbar** | Un entregable con 1 a 3 días de atraso, **o** horas reales entre 110 % y 130 % | El eduScrum Master reasigna en el daily y lo avisa al Product Owner ese mismo día en #199 |
| 🔴 **Rojo** | Un entregable con más de 3 días de atraso, **o** horas > 130 %, **o** en riesgo una fecha comprometida con la organización | Escalar al Product Owner ese día y proponer nueva fecha o recorte de alcance; avisar a la organización |

**Aviso a la organización:** si una fecha comprometida con Yosondua está en riesgo, se le avisa **por lo menos 2 días antes** de esa fecha, en persona o con recado impreso, aunque no haya señal.

## Herramientas

| Herramienta | Para qué | Por qué (costo, conectividad, quién la usa) |
|---|---|---|
| **GitHub Projects** (tablero) | Estado de cada entregable, horas y burn-up | Gratis; lo usan el equipo y el Product Owner; necesita internet, pero solo lo usa el equipo desde el Tec |
| **Issues y milestones** de GitHub | Una issue por tarea o acuerdo, con responsable y fecha; el milestone "Sprint 4 · Gestión de Proyectos (TecNM)" marca el corte | Gratis; queda historial revisable por el Product Owner |
| **Insights** de GitHub | Gráfica de avance del tablero | Gratis y automática, sin trabajo extra |
| **Hoja de cálculo** | Respaldo de horas y burn-up si el tablero falla | Gratis; funciona sin conexión y se sube después |
| **Nota de voz** de un minuto | Informe para la organización | No requiere leer; se manda por WhatsApp cuando hay señal o se reproduce en persona |
| **Hoja impresa** | Informe y carta para la organización | Llega aunque no haya señal; se queda con la organización para su asamblea; cuesta unos pesos de impresión que paga el equipo |

**Adaptado a la comunidad (a cargo de @Jazlynn22):**
- **Formato impreso:** El informe para Yosondua se redacta en lenguaje sencillo, directo y sin tecnicismos, en media página con letra grande y clara. Se entrega de forma física y en persona para que quede en resguardo de la organización y se pueda consultar en asamblea comunitaria, sin depender de cobertura o internet.
- **Nota de voz de un minuto:** @Jazlynn22 prepara el texto con una extensión de 100 a 120 palabras (aproximadamente 50 a 60 segundos a ritmo pausado y claro). Se comparte por mensajería instantánea cuando haya cobertura o se reproduce en persona durante las visitas. Por apego estricto a [`PRIVACIDAD.md`](../../research/PRIVACIDAD.md), únicamente se publica el texto del guion en el repositorio, jamás archivos de audio.
- **Respeto a horarios y lengua:** Se entrega en el horario que la organización señale y, si es necesario, se lee o traduce a su lengua con el apoyo de la persona que la comunidad designe.
