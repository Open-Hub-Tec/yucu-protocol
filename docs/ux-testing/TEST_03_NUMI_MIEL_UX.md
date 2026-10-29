# 📱 Ficha de Pruebas de Usabilidad y Fricción en Campo: [TEST #03 - San Juan Ñumí]
**Proyecto:** Yucu Protocol (Módulo de Miel y Trazabilidad Apícola)  
**Institución:** Instituto Tecnológico de Tlaxiaco (TecNM)  
**Equipo de Investigación:** Diego Sosa & Luis Alexis Morales (Equipo UMIZOOMI / eduScrum - Residencia Profesional)  
**Organización Evaluada:** Unión de Productores de Miel "Flor de la Mixteca"  
**Comunidad:** San Juan Ñumí, Oaxaca  
**Fecha:** Septiembre 2026 (Issue #2 / Hito 1.2 UX · PR #39)  

---

### 1. Perfiles de Participantes Evaluados

| Participante | Comunidad | Edad | Rol / Ocupación | Dispositivo | Experiencia Tecnológica Previa |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Participante 1 (Presidente)** | San Juan Ñumí | 54 | Apicultor / Presidente de la Unión | Smartphone básico Android | Básica (WhatsApp, llamadas y notas de voz) |
| **Participante 2 (Ventas)** | San Juan Ñumí | 48 | Apicultor / Encargado de Ventas | Smartphone gama baja | Básica (WhatsApp, notas de voz y cámara) |
| **Participante 3 (Socio Mayor)** | San Juan Ñumí | 61 | Apicultor tradicional | Teléfono básico de teclas | Nula / Casi nula |
| **Participante 4 (Socio Joven)** | San Juan Ñumí | 39 | Apicultor / Miembro activo | Smartphone gama media | Intermedia (Redes sociales y mensajería) |

---

### 2. Tabla de Resultados por Tarea (Cronometrada)

#### Tarea 1: Grabación de Nota de Voz (Declaración de Cosecha en 30s)
*Objetivo: Evaluar si ubican el botón de micrófono y si presentan vacilación al oprimirlo.*

| Participante | Tiempo (seg) | ¿Requirió Ayuda? | Fricción y Reacciones Observadas |
| :--- | :---: | :---: | :--- |
| **Participante 1 (Presidente)** | **18 s** | No | Ubicó el icono por similitud a WhatsApp, pero dejó presionado el botón en lugar de un solo toque. |
| **Participante 2 (Ventas)** | **12 s** | No | Localización rápida. Dudó un par de segundos sobre cuándo empezar a hablar. |
| **Participante 3 (Socio 61 años)** | **45 s** | Sí | Vacilación por miedo a *"romper"* la pantalla. Preguntó antes si debía apretar fuerte. |
| **Participante 4 (Socio Joven)** | **8 s** | No | Presionó de inmediato sin complicaciones. |

---

#### Tarea 2: Inspección del Certificado / Pasaporte Digital
*Objetivo: Evaluar interpretación del sello universitario TecNM, comprensión del aval y legibilidad bajo sol.*

| Participante | Tiempo (seg) | ¿Requirió Ayuda? | Fricción y Reacciones Observadas |
| :--- | :---: | :---: | :--- |
| **Participante 1** | **35 s** | No | Confundió el sello universitario con un sello fiscal de Hacienda o recaudación municipal. |
| **Participante 2** | **25 s** | No | Comprendió que avala la pureza de la miel, pero tuvo que resguardarse en la sombra para leer la letra chica. |
| **Participante 3** | **60 s** | Sí | Le costó leer por el brillo del sol y el tamaño de letra reducido. |
| **Participante 4** | **20 s** | No | Identificó el sello como respaldo del tecnológico que le da valor comercial al producto. |

---

#### Tarea 3: Etiqueta Física Colgante QR (Hang-Tag)
*Objetivo: Evaluar si la colocarían en sus cubetas/frascos y si le encuentran valor.*

| Participante | Tiempo (seg) | ¿Requirió Ayuda? | Fricción y Reacciones Observadas |
| :--- | :---: | :---: | :--- |
| **Participante 1** | **15 s** | No | Le pareció útil para amarrarla con mecatito a los tambos de miel para que no se revuelvan las cosechas. |
| **Participante 2** | **10 s** | No | Comentó que la etiqueta da presentación formal a los clientes para demostrar el origen de la miel. |
| **Participante 3** | **30 s** | Sí | No entendía la función del QR hasta que se le explicó que se escanea con una cámara. |
| **Participante 4** | **12 s** | No | Sugirió usar etiquetas adhesivas resistentes a la humedad además de la etiqueta de cartón. |

---

### 3. Síntesis de los 3 Puntos Críticos de Fricción

1. **Miedo a romper el teléfono o borrar datos:**  
   Vacilación inicial por falta de experiencia con aplicaciones fuera de WhatsApp. Miedo a cometer errores irreversibles.
2. **Dificultad de lectura bajo sol directo y tipografía pequeña:**  
   Bajo condiciones de campo abierto, las letras menores a 16px resultan ilegibles para adultos mayores que no portan lentes de lectura.
3. **Confusión con terminología institucional:**  
   Palabras técnicas como *"Blockchain"*, *"Lote"* o sellos con aspecto gubernamental despertaron sospechas de trámites fiscales o impuestos.

---

### 4. Soluciones Implementadas en Yucu Protocol
* **Grabación de un solo toque (*Single Tap*):** Se eliminó la necesidad de mantener presionado el micrófono; un toque inicia la grabación y una onda sonora indica que está grabando.
* **Modo Campo de Alto Contraste:** Tipografías grandes (18px títulos, 16px cuerpo) en negro sólido sobre fondo claro.
* **Leyenda Explícita en el Sello:** *"Aval Técnico Universitario TecNM · Garantía de Miel 100% Pura"*, evitando escudos que parezcan fiscales.
