# 📱 Hito 1.2: Pruebas de Usabilidad UX con Prototipo Accesible para Adultos Mayores
**Repositorio:** `Open-Hub-Tec/yucu`  
**Institución:** Instituto Tecnológico de Tlaxiaco (TecNM) – Carrera de Ingeniería en Sistemas Computacionales  
**Asignatura:** Fundamentos de Ingeniería de Software (SCC-1007) – Asesor: Ing. José Alfredo Román Cruz  
**Hito Drips / Roadmap:** Issue #2 – UX Milestone 1.2 (Validado & Resuelto vía PR #30)  
**Documento Oficial:** `HITO_1.2_PRUEBAS_USABILIDAD.pdf` *(archivo privado del equipo, ver [PRIVACIDAD.md](../research/PRIVACIDAD.md))*

---

## 👥 Equipo de Evaluación de Usabilidad
* **Investigadores:** Castro Rodríguez Charlie Jared, Reyez Hernández Dulce Maetzy, Brayan Armando Pérez González, José Manuel Hernández Paz (5º Semestre Grupo B).
* **Participante Evaluada:** Tejedora triqui (56 años, artesana tejedora en telar de cintura de San José Xochixtlán, hablante nativa de Triqui, experiencia tecnológica básica con smartphone).
* **Dispositivo de Prueba:** Teléfono móvil estándar Android simulando condiciones de campo rural.

---

## 🧪 Metodología y Ejecución de Tareas

| Tarea Evaluada | Tiempo Registrado | ¿Requirió Ayuda? | Observaciones y Fricción Detectada |
| :--- | :---: | :---: | :--- |
| **Tarea 1: Buscar y reconocer su huipil** | **22 segundos** | **No** | Pequeña vacilación inicial al revisar las opciones del menú antes de pulsar la sección del producto. |
| **Tarea 2: Revisar información e historia del huipil** | **41 segundos** | **No** | Comprendió los datos principales, pero tuvo dificultad para leer tipografías secundarias de menor tamaño. Buscó prioritariamente quién elaboró la prenda y su comunidad. |
| **Tarea 3: Identificación mediante Código QR** | **9 segundos** | **No** | **Fricción mínima / Instantáneo.** Comprendió de inmediato que el QR vincula el huipil físico con su ficha digital y sugirió colocarlo como etiqueta colgante (*hang-tag*). |

---

## 🔍 Diagnóstico de los 3 Puntos de Fricción Críticos

### 1. Dificultad para identificar opciones en el menú
* **Problema:** En la primera tarea se observó una duda de varios segundos buscando dónde comenzar. Los íconos abstractos o menús multinivel generan incertidumbre en usuarios rurales mayores.
* **Mejora Aplicada en Yucu:** 
  * Botones grandes (>48px táctil y hasta 112px en Modo Abuelo) con texto descriptivo explícito (*"Ver mi huipil"*, *"Mi historia"*, *"Información"*).
  * Principio *Zero-Typing*: Navegación guiada por voz en Mixteco (Tu'un Savi) y español. *(Propuesta; no implementada al 29 de octubre de 2026.)*

### 2. Tamaño de letra y contraste visual
* **Problema:** Los textos complementarios (fechas, especificaciones técnicas) provocaron fatiga visual y lectura forzada en pantalla de 5-6 pulgadas.
* **Mejora Aplicada en Yucu:**
  * Modo de Alto Contraste (fondos claros contrastados con texto oscuro `slate-900` / `stone-800`).
  * Aumento del tamaño de fuente en toda la ficha técnica y espaciado generoso para evitar toques accidentales.

### 3. Jerarquía Visual: Lo Comunitario Primero
* **Problema:** La artesana se enfoca en verificar su nombre, su comunidad y su técnica antes de ver datos contables o hashes criptográficos.
* **Mejora Aplicada en Yucu:**
  * La cabecera del Pasaporte Digital coloca en primer término:
    1. Fotografía de la artesana y comunidad (**San José Xochixtlán, Oaxaca**).
    2. Técnica ancestral (**Telar de Cintura tradicional**).
    3. Significado cultural de la iconografía (venados, flores, montañas).
  * Los detalles técnicos y de smart contract (Stellar hash, EUDR, SCAA) se organizan en tarjetas desplegables ordenadas.

---

## 📈 Matriz de Auditoría de Fricción Digital Multicomunitaria

Las pruebas de usabilidad y fricción se extendieron a **4 comunidades indígenas** de la Mixteca Alta, validando la consistencia de los hallazgos:

| Test # | Comunidad | Sector / Producto | Sujeto Evaluado | Tiempo QR | Fricción Principal | Ficha Completa |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| **01** | **San Pablo Tijaltepec** | Bordado Tradicional | Bordadora | **6 seg** | Miedo a desconfigurar el teléfono; QR adoptado para proteger blusas de venados contra ropa china. | [`TIJALTEPEC_FRICTION_AUDIT.md`](./TIJALTEPEC_FRICTION_AUDIT.md) |
| **02** | **San José Xochixtlán** | Huipil Triqui en Telar | Tejedora triqui (56 años) | **9 seg** | Vacilación inicial; confirmación de autoría y foto antes de datos técnicos. | *Este documento base* |
| **03** | **San Juan Mixtepec** | Artesanías de Palma | Tejedora de palma (68 años) | **5 seg** | Preguntó si se borraba algo del teléfono; asoció el QR a defenderse del coyote. | [`TEST_02_MIXTEPEC_PALMA_UX.md`](./TEST_02_MIXTEPEC_PALMA_UX.md) |
| **04** | **San Juan Ñumí** | Miel Virgen de Campanilla | 4 Apicultores (39-61 años) | **10-15 seg** | Confundieron el sello universitario con Hacienda; pidieron etiquetas para cubetas/tambos. | [`TEST_03_NUMI_MIEL_UX.md`](./TEST_03_NUMI_MIEL_UX.md) |

---

## 🏆 Conclusión

> **Revisión del 29 de octubre de 2026.** Esta conclusión se corrigió para que diga solo lo que muestran las pruebas (regla 8 de [`AGENTS.md`](../../AGENTS.md)). La versión anterior decía "100 % sin intervención externa" y "fricción plenamente superada".

**Lo que sí muestran las pruebas** (unas 7 personas en 4 comunidades; muestra pequeña y cualitativa, sin SUS):
1. **El QR y la etiqueta colgante se entienden rápido:** entre 5 y 15 segundos, y las participantes los relacionaron con defenderse del intermediario y de la ropa de fábrica.
2. **Grabar una nota de voz es viable:** quienes ya usan notas de voz en WhatsApp lo hicieron en segundos; una participante narró en Tu'un Savi.
3. **Primero quieren ver quién lo hizo y de dónde es**, antes que cualquier dato técnico.

**Lo que también apareció y sigue abierto:**
* Vacilación al empezar, miedo a "borrar" o "romper" el teléfono, y una participante de 61 años necesitó ayuda (TEST_03).
* El sello se confundió con un trámite de Hacienda o un cobro (TEST_02 y TEST_03).
* La letra chica y en gris claro no se lee con el sol.

**Lo que estas pruebas no cubrieron**, porque esas pantallas todavía no funcionan de verdad: registrar un lote hablando, firmar con PIN, cobrar en pesos y medir el SUS con artesanas. La navegación por voz en mixteco descrita arriba es una propuesta, no una función de la app; el mixteco se evalúa en [#158](https://github.com/Open-Hub-Tec/yucu-protocol/issues/158).
