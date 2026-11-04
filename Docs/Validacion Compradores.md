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

- **Investigador(es):** [Alan Sahid, Mari Cruz, Carla, Aldair]
- **Fecha de aplicación:** [25/10/2026]
- **Lugar:** [Plaza de Tlaxiaco]

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

## 👤 4. Perfiles de Compradores (Muestra de 6 Participantes)

| ID | Perfil / Ocupación | Edad | Residencia | Segmento de comprador | Frecuencia de compra | Dispositivo usado |
|---|---|---|---|---|---|---|
| C1 | Ama de casa y jefa de familia | 52 | Región Mixteca | Consumidora local tradicional (textiles de uso diario) | Semanal | Xiaomi Redmi 9A |
| C2 | Dueña de comedor tradicional | 46 | Región Mixteca | Negocio local (compra por volumen manteles y servilletas bordadas) | Quincenal | Samsung Galaxy A14 |
| C3 | Turista cultural y docente universitaria | 31 | Oaxaca de Juárez | Coleccionista de textiles de telar de cintura | Ocasional (2 a 3 veces al año) | iPhone 13 |
| C4 | Joven profesionista (Ing. en Sistemas) | 25 | Región Mixteca | Consumidor joven local de prendas artesanales | Mensual | Motorola Moto G52 |
| C5 | Propietaria de tienda de regalos regional | 38 | Oaxaca de Juárez | Comprador comercial (compra para reventa) | Mensual | Samsung Galaxy S21 |
| C6 | Diseñadora y promotora de comercio justo | 42 | Puebla, Pue. | Distribuidora de comercio justo | Ocasional (ferias) | Google Pixel 6a |

## 📊 5. Tablas Concentradas de Resultados

### Tabla 5.1: Respuestas cualitativas

| Participante | Motivación y compra | Conciencia del trabajo y regateo (HU-2.2) | Valoración del reporte de verificación (HU-1.2) | Valoración del perfil verificado (HU-3.1) | Disposición a sobreprecio ético | Preferencia de contacto y pedido (HU-3.2) |
|---|---|---|---|---|---|---|
| C1 | "Compro textiles de uso diario porque duran más y son de la gente de aquí." | "Antes pedía rebaja por costumbre; si veo cuántas horas lleva, ya no me atrevo." | "Salieron muchas letras y números raros, ¿esto qué significa?" | "Me gusta ver de qué comunidad es el taller." | +10% a +20% | WhatsApp con una persona conocida del taller |
| C2 | "Busco manteles y servilletas bordadas para mi comedor, en cantidad." | "Si es buen trabajo no regateo, sé lo que cuesta hacerlo." | "No entiendo todo eso, mejor dígame de quién es el diseño y desde cuándo." | "Ver sus ventas me da confianza de que sí cumplen." | +10% en pedidos por volumen | Llamada para acordar el pedido |
| C3 | "Busco textiles de telar de cintura; es arte que no se debe perder." | "Jamás regateo. Quiero saber quién lo hizo y cuánto tardó." | "Muy útil saber qué registro es anterior; sirve como prueba." | "Ayuda ver desde cuándo existe el perfil." | +30% o más si todo llega a la artesana | "Quiero apartarlo, pero no sé cómo le pago el anticipo ni dónde le hablo." |
| C4 | "Prefiero comprarles directo a artesanas de mi región." | "El precio de plaza a veces no cubre ni el hilo; conviene que se vea el tiempo." | "El sello es buena idea; que no muestre datos personales me da tranquilidad." | "Las ventas confirmadas dan seguridad." | +15% a +25% | WhatsApp, es lo más práctico |
| C5 | "Compro piezas para vender en mi tienda de regalos." | "Entiendo el costo de elaborar; el regateo afecta a las artesanas." | "Me sirve para dar confianza a mis clientes sobre el origen." | "Me ayuda a elegir con quién trabajar." | +15% a +20% | "No me queda claro cómo se paga el anticipo ni cómo contactar." |
| C6 | "Busco alianzas de largo plazo con colectivos de artesanas." | "Reconozco el valor del diseño y de las horas; el regateo debería evitarse." | "Que muestre qué registro es anterior es lo importante ante un plagio." | "Las ventas confirmadas dan transparencia." | +25% a +35% | WhatsApp o correo, con el pedido por escrito |

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
| T1 | 24 s · sí · no | 20 s · sí · no | 12 s · sí · no | 10 s · sí · no | 11 s · sí · no | 13 s · sí · no | 15.0 s | 100 % |
| T2 | 30 s · sí · no | 38 s · sí · no | 18 s · sí · no | 29 s · sí · no | 16 s · sí · no | 17 s · sí · no | 24.7 s | 100 % |
| T3 | 52 s · no · sí | 47 s · no · sí | 26 s · sí · no | 18 s · sí · no | 22 s · sí · no | 24 s · sí · no | 31.5 s | 66.7 % |
| T4 | 41 s · sí · no | 35 s · sí · no | 22 s · sí · no | 15 s · sí · no | 19 s · sí · no | 18 s · sí · no | 25.0 s | 100 % |
| T5 | 20 s · sí · no | 18 s · sí · no | 48 s · no · sí | 10 s · sí · no | 44 s · no · sí | 14 s · sí · no | 25.7 s | 66.7 % |
| **Tiempo total** | 167 s | 158 s | 126 s | 82 s | 112 s | 86 s | 121.8 s | — |

### Tabla 5.3: Evaluación estandarizada SUS

Cada participante responde de **1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo)**.

**Cálculo:** en los reactivos impares (1, 3, 5, 7, 9) el puntaje es la respuesta − 1; en los pares (2, 4, 6, 8, 10) es 5 − la respuesta. Se suman los 10 puntajes (0 a 40) y se multiplica por 2.5 para obtener un valor de 0 a 100. El puntaje del equipo es el promedio de los 6 participantes.

| Reactivo SUS | C1 | C2 | C3 | C4 | C5 | C6 | Promedio |
|---|---|---|---|---|---|---|---|
| 1. Me gustaría usar Open Hub Tec con frecuencia | 4 | 4 | 5 | 5 | 5 | 5 | 4.67 |
| 2. Encontré la plataforma innecesariamente compleja | 3 | 3 | 2 | 1 | 2 | 1 | 2.00 |
| 3. Me pareció fácil de usar | 4 | 4 | 5 | 5 | 4 | 5 | 4.50 |
| 4. Necesitaría ayuda de una persona técnica para usarla | 4 | 3 | 2 | 1 | 2 | 2 | 2.33 |
| 5. Las funciones estaban bien integradas | 4 | 4 | 5 | 4 | 5 | 4 | 4.33 |
| 6. Hubo demasiada inconsistencia | 3 | 3 | 2 | 1 | 2 | 2 | 2.17 |
| 7. La mayoría aprendería a usarla muy rápido | 4 | 4 | 5 | 5 | 4 | 5 | 4.50 |
| 8. La encontré incómoda o frustrante de usar | 2 | 3 | 1 | 2 | 2 | 1 | 1.83 |
| 9. Me sentí muy seguro(a) al usarla | 4 | 4 | 5 | 5 | 4 | 5 | 4.50 |
| 10. Necesité aprender muchas cosas antes de usarla | 3 | 2 | 2 | 1 | 2 | 1 | 1.83 |
| **Suma normalizada (0 a 40)** | 25 | 26 | 36 | 38 | 32 | 37 | 32.3 |
| **Puntaje SUS (0 a 100)** | 62.5 | 65.0 | 90.0 | 95.0 | 80.0 | 92.5 | **80.8 / 100** |
| **Nivel de confianza en la autenticidad (1 a 10)** | 7 | 7 | 9 | 10 | 9 | 10 | 8.7 |

Un puntaje de 80.8 queda por encima de 68 (promedio de referencia) y alrededor de 80 (muy bueno). Los participantes con menor puntaje (C1 y C2) coinciden con los que tuvieron dificultad en T3, lo que apunta a la Fricción 1 como la más importante.

## 🚨 6. Diagnóstico de Puntos de Fricción (UX Friction Log)

### Fricción 1: Código largo de verificación (hash) intimida

- **Componente o pantalla:** Reporte de verificación de autoría
- **Historia relacionada:** HU-1.2
- **Severidad:** Crítica
- **Participantes afectados:** C1 y C2
- **Cita textual:** "Salieron muchas letras y números raros, ¿esto qué significa? ¿Me va a cobrar algo?"
- **Mejora sugerida:** Ocultar el hash en una sección desplegable y mostrar primero un mensaje sencillo, por ejemplo "Diseño registrado por [comunidad] el [fecha]", con la opción "Ver detalle técnico" para quien quiera verificarlo.

### Fricción 2: No se sabe cómo contactar a la artesana ni cómo pagar el anticipo

- **Componente o pantalla:** Pantalla de contacto y pedido
- **Historia relacionada:** HU-3.2
- **Severidad:** Moderada
- **Participantes afectados:** C3 y C5
- **Cita textual:** "Quiero apartarlo, pero no sé cómo le pago el anticipo ni dónde le hablo."
- **Mejora sugerida:** Agregar opciones claras de contacto (WhatsApp, llamada o en persona) y mostrar las formas de pago del anticipo acordadas con la artesana, junto con el monto y el saldo pendiente.

### Fricción 3: Pantalla difícil de leer bajo el sol

- **Componente o pantalla:** Toda la interfaz (perfil, historial y reportes)
- **Historia relacionada:** General (HU-2.2, HU-3.1)
- **Severidad:** Moderada
- **Participantes afectados:** C2 y C4
- **Cita textual:** "Con el sol casi no se ve, tuve que taparle con la mano para leer el precio."
- **Mejora sugerida:** Usar un tema claro con alto contraste, letra más grande en el precio y el tiempo de elaboración, y evitar fondos oscuros en las pantallas principales.

## 🛠️ 7. Backlog Accionable y Propuesta de Pull Requests Técnicos

Cada propuesta resuelve una de las fricciones del punto 6 y se convierte en una tarjeta del tablero del Sprint 3, con sus horas cargadas a las horas de corrección del Costo de la Calidad.

### PR-A (Frontend / UX – `fix/humanize-verification-report`)

- **Fricción que resuelve:** Fricción 1 (código largo de verificación que intimida)
- **Historia relacionada:** HU-1.2
- **Qué cambia:** Humanizar el reporte de verificación de autoría. Se oculta el hash en una sección desplegable "Ver detalle técnico" y se muestra primero un mensaje en lenguaje sencillo: "Diseño registrado por [comunidad] el [fecha]". El reporte sigue siendo verificable por cualquier persona sin cuenta.
- **Criterio de aceptación:** El comprador entiende de quién es el diseño y desde cuándo está registrado sin necesidad de leer el hash (se comprueba repitiendo la tarea T3 con al menos 2 participantes).
- **Responsable sugerido:** Carla Bautista (móvil / frontend), con revisión de Mari Cruz Gomez (blockchain)
- **Horas estimadas:** 3 h

### PR-B (Flujo de contacto – `feat/contact-and-deposit-options`)

- **Fricción que resuelve:** Fricción 2 (no se sabe cómo contactar a la artesana ni pagar el anticipo)
- **Historia relacionada:** HU-3.2
- **Qué cambia:** Agregar en la pantalla de pedido opciones claras de contacto (WhatsApp, llamada o en persona) y mostrar las formas de pago del anticipo acordadas con la artesana, junto con el monto del anticipo y el saldo pendiente. El registro original del anticipo no se puede modificar.
- **Criterio de aceptación:** El comprador encuentra cómo contactar a la artesana y cómo pagar el anticipo en menos de 30 segundos y sin ayuda (se comprueba repitiendo la tarea T5 con al menos 2 participantes).
- **Responsable sugerido:** Alan Sahid (móvil / frontend), con apoyo de Carla Bautista León (backend y datos)
- **Horas estimadas:** 3 h

### PR-C (Accesibilidad – `fix/high-contrast-theme`)

- **Fricción que resuelve:** Fricción 3 (pantalla difícil de leer bajo el sol)
- **Historia relacionada:** General (HU-2.2 y HU-3.1)
- **Qué cambia:** Aplicar un tema claro con alto contraste, aumentar el tamaño de letra del precio y del tiempo de elaboración, y evitar fondos oscuros en las pantallas principales (perfil, historial y reportes).
- **Criterio de aceptación:** El precio y el tiempo de elaboración se leen a la luz del sol sin cubrir la pantalla (se comprueba en exteriores con al menos 2 teléfonos distintos).
- **Responsable sugerido:** Aldair Gonzalez (pruebas), con implementación de Alan Sahid Cortes
- **Horas estimadas:** 2 h

### Resumen del backlog

| PR | Fricción | Historia | Severidad | Responsable sugerido | Horas |
|---|---|---|---|---|---|
| PR-A | 1 – Hash que intimida | HU-1.2 | Crítica | Alan Sahid Cortes | 3 h |
| PR-B | 2 – Contacto y anticipo | HU-3.2 | Moderada | Alan Sahid Cortes | 3 h |
| PR-C | 3 – Lectura bajo el sol | HU-2.2 / HU-3.1 | Moderada | Aldair Gonzalez | 2 h |
| **Total** | | | | | **8 h** |

Las 8 horas coinciden con las horas de corrección del Costo de la Calidad (Sprint 2), así que las mejoras caben dentro de lo ya estimado. La prioridad es PR-A, por ser la fricción de severidad crítica.
