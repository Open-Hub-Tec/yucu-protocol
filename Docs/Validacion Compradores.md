# 🛍️ Validación de Investigación de Compradores y Pruebas de Usabilidad UX – Open Hub Tec (Refs #[__])

## 🛍️ Descripción del Cambio

Se documentan el protocolo y los hallazgos de la Investigación Cualitativa de Compradores y las Pruebas de Usabilidad UX aplicadas por el equipo de Open Hub Tec en [lugar: por ejemplo, el tianguis o mercado donde se aplicó], en la Región Mixteca de Oaxaca.

Este trabajo valida la experiencia del lado del comprador de textiles artesanales, enfocándose en:

- **Visibilización del trabajo y reducción del regateo:** Medición del efecto de mostrar el tiempo de elaboración y el precio promedio de una prenda (HU-2.2).
- **Disposición a pagar un sobreprecio ético:** Comprobar si el comprador pagaría más si sabe que el dinero llega directo a quien hizo la pieza.
- **Verificación de autoría:** Evaluar si el comprador entiende el reporte verificable de un diseño y lo percibe como prueba de originalidad (HU-1.2).
- **Perfil verificado y contacto directo:** Validar si las ventas confirmadas y la fecha de creación del perfil generan confianza, y cómo prefiere el comprador contactar o hacer un pedido (HU-3.1 y HU-3.2).
- **Privacidad (Zero-PII en blockchain):** Evaluar la confianza ante una arquitectura donde solo se guardan hash y marca de tiempo, sin datos personales.
- **Pruebas de usabilidad estandarizadas (SUS):** Medición de tiempos de tarea (T1 a T5), detección de fricciones en condiciones reales (sol, ruido, datos móviles inestables) y cálculo del puntaje SUS.

## 📌 Issue Vinculada

Refs #[__]
Closes #[__]

## 🏷️ Área del Protocolo Modificada

- [ ] 📱 Frontend / UI móvil
- [ ] 🔑 Identidad y autenticación
- [ ] 📜 Contratos inteligentes
- [ ] 📚 Documentación / pruebas (`docs/`)

## 🧪 Lista de Verificación del Equipo (Checklist)

- [ ] Guion cualitativo adaptado al contexto de compradores de la Mixteca.
- [ ] Entrevista y tabulación de 6 perfiles representativos de compradores.
- [ ] Registro y cronometraje de 5 tareas de usabilidad con el método "pensar en voz alta".
- [ ] Cálculo de la escala SUS (10 reactivos) con la fórmula estándar.
- [ ] Registro de fricciones (UX Friction Log) con severidad, citas textuales y mejoras concretas.
- [ ] Backlog técnico con propuestas de PR para el repositorio.
- [ ] Cumplimiento de las directrices de privacidad (solo hash y timestamp en blockchain; participantes identificados con claves).

## 🎓 Datos del Contribuidor

**Equipo de Desarrollo e Investigación:** Mari Cruz Gomez, Carla Bautista León, Alan Sahid Cortes, Aldair Gonzalez
**Carrera / Semestre:** Ingeniería en Sistemas Computacionales / [semestre] — [institución]
**Materia:** Gestión de Proyectos de Software (SCG-1009) · Unidad 3
**eduScrum Master:** [Nombre] · **Product Owner:** [Nombre]

---

# 🛍️ Reporte Integral de Investigación y Usabilidad UX

## 👥 1. Datos del Equipo Evaluador

- **Investigador(es):** [nombres de quienes entrevistaron y cronometraron]
- **Institución:** [institución]
- **Fecha de aplicación:** [fecha y horario]
- **Lugar:** [dirección o zona donde se aplicó]
- **Dispositivos:** [modelos de celular y sistema operativo usados]
- **Versión probada de la plataforma:** [prototipo, versión o rama]

## 🎯 2. Justificación: por qué validar con compradores en un entorno real

Las historias de usuario del Sprint 1 se escribieron pensando sobre todo en la artesana. Pero HU-1.2, HU-2.2, HU-3.1 y parte de la HU-3.2 dependen de que el **comprador** entienda y confíe en lo que ve. Si no lo entiende, la plataforma no cumple su objetivo de reducir el intermediarismo y dar visibilidad al trabajo artesanal.

Probar en un entorno real de compra (tianguis o mercado) permite ver fricciones que no aparecen en una prueba de laboratorio. Estas son las que esperamos encontrar, y la prueba sirve para confirmarlas o descartarlas:

- **Regateo:** si el comprador no ve evidencia del esfuerzo de elaboración, puede asumir que la pieza debería costar menos. Se espera que mostrar las horas de trabajo y el precio promedio (HU-2.2) ayude.
- **Intermediarismo:** si el comprador no tiene forma de contactar directo a la artesana, depende de intermediarios (problemática 2 del backlog).
- **Pérdida de contacto:** al terminar la jornada de venta, el comprador no puede encargar más piezas. Los pedidos y apartados (HU-3.2) buscan resolverlo.
- **Condiciones ambientales:** luz solar fuerte, ruido y señal móvil inestable pueden afectar la lectura de la pantalla y la carga de la plataforma.

Esta validación también revisa riesgos de la matriz del Sprint 3: **S2** (baja adopción por desconfianza), **S5** (celulares de gama básica) y **T5** (notificaciones sin internet).

## 🔒 3. Protocolo Ético y Privacidad

- Los compradores se identifican solo como **C1 a C6**; no se guardan nombres, teléfonos ni fotos de rostros.
- Se pide consentimiento verbal antes de la entrevista y antes de registrar notas o audio.
- **Zero-PII en blockchain:** se verifica que en la cadena solo se almacenen hash y marca de tiempo, sin datos personales de artesanas ni de compradores. Resultado de la verificación: [ ] sí / [ ] no.
- Los reportes públicos no muestran datos sensibles sin autorización (criterio de aceptación de la HU-1.2).
- Las citas textuales se registran sin información que identifique a la persona.

## 👤 4. Perfiles de Compradores Entrevistados (Muestra de 6 Participantes)

| ID | Perfil / Ocupación | Edad | Residencia | Segmento de comprador | Frecuencia de compra | Dispositivo usado |
|---|---|---|---|---|---|---|
| C1 | [ ] | [ ] | [ ] | Consumidor local tradicional | [ ] | [ ] |
| C2 | [ ] | [ ] | [ ] | Negocio local (compra por volumen) | [ ] | [ ] |
| C3 | [ ] | [ ] | [ ] | Turista o coleccionista de textiles | [ ] | [ ] |
| C4 | [ ] | [ ] | [ ] | Joven profesionista local | [ ] | [ ] |
| C5 | [ ] | [ ] | [ ] | Comprador de tienda o comercio justo | [ ] | [ ] |
| C6 | [ ] | [ ] | [ ] | Diseñador o diseñadora | [ ] | [ ] |

## 📊 5. Tablas Concentradas de Resultados

### Tabla 5.1: Respuestas cualitativas

| Participante | Motivación y compra | Conciencia del trabajo y regateo (HU-2.2) | Valoración del reporte de verificación (HU-1.2) | Valoración del perfil verificado (HU-3.1) | Disposición a sobreprecio ético | Preferencia de contacto y pedido (HU-3.2) |
|---|---|---|---|---|---|---|
| C1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| C2 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| C3 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| C4 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| C5 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| C6 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### Tabla 5.2: Desempeño en pruebas de usabilidad (T1 a T5)

Tareas evaluadas:

- **T1 (HU-3.1):** abrir el perfil de un taller y encontrar sus piezas y su fecha de creación.
- **T2 (HU-2.2):** leer el precio promedio y el tiempo de elaboración de una prenda.
- **T3 (HU-1.2):** abrir el reporte de verificación de un diseño e indicar qué registro es anterior.
- **T4 (HU-3.2):** consultar el estado de un pedido, el anticipo y el saldo pendiente.
- **T5 (HU-3.1 / HU-3.2):** contactar a la artesana o hacer un pedido.

Formato de cada celda: `segundos · éxito (sí/no) · ayuda (sí/no)`.

| Tarea | C1 | C2 | C3 | C4 | C5 | C6 | Promedio global | Éxito autónomo |
|---|---|---|---|---|---|---|---|---|
| T1 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| T2 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| T3 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| T4 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| T5 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Tiempo total** | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — |

### Tabla 5.3: Evaluación estandarizada SUS

Cada participante responde de **1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo)**.

**Cálculo:** en los reactivos impares (1, 3, 5, 7, 9) el puntaje es la respuesta − 1; en los pares (2, 4, 6, 8, 10) es 5 − la respuesta. Se suman los 10 puntajes (0 a 40) y se multiplica por 2.5 para obtener un valor de 0 a 100. El puntaje del equipo es el promedio de los 6 participantes.

| Reactivo SUS | C1 | C2 | C3 | C4 | C5 | C6 | Promedio |
|---|---|---|---|---|---|---|---|
| 1. Me gustaría usar Open Hub Tec con frecuencia | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2. Encontré la plataforma innecesariamente compleja | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3. Me pareció fácil de usar | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 4. Necesitaría ayuda de una persona técnica para usarla | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 5. Las funciones estaban bien integradas | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 6. Hubo demasiada inconsistencia | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 7. La mayoría aprendería a usarla muy rápido | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 8. La encontré incómoda o frustrante de usar | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 9. Me sentí muy seguro(a) al usarla | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 10. Necesité aprender muchas cosas antes de usarla | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Suma normalizada (0 a 40)** | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Puntaje SUS (0 a 100)** | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | **[ ] / 100** |
| **Nivel de confianza en la autenticidad (1 a 10)** | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## 🚨 6. Diagnóstico de Puntos de Fricción (UX Friction Log)

### Fricción 1: [nombre corto del problema]

- **Componente o pantalla:** [ ]
- **Historia relacionada:** [HU-__]
- **Severidad:** [Crítica / Moderada / Leve]
- **Participantes afectados:** [C_, C_]
- **Cita textual:** "[ ]"
- **Mejora sugerida:** [ ]

### Fricción 2: [nombre corto del problema]

- **Componente o pantalla:** [ ]
- **Historia relacionada:** [HU-__]
- **Severidad:** [Crítica / Moderada / Leve]
- **Participantes afectados:** [C_, C_]
- **Cita textual:** "[ ]"
- **Mejora sugerida:** [ ]

### Fricción 3: [nombre corto del problema]

- **Componente o pantalla:** [ ]
- **Historia relacionada:** [HU-__]
- **Severidad:** [Crítica / Moderada / Leve]
- **Participantes afectados:** [C_, C_]
- **Cita textual:** "[ ]"
- **Mejora sugerida:** [ ]

## 🛠️ 7. Backlog Accionable y Propuesta de Pull Requests Técnicos

- **PR-A** (`fix/[nombre]`): [qué corrige y qué fricción resuelve]
- **PR-B** (`feat/[nombre]`): [qué corrige y qué fricción resuelve]
- **PR-C** (`feat/[nombre]`): [qué corrige y qué fricción resuelve]

Cada propuesta se convierte en una tarjeta del tablero del Sprint 3 con sus horas estimadas, cargadas a las horas de corrección del Costo de la Calidad.
