---
name: student-offline-pwa
description: Guía de arquitectura frontend rural Offline-First y diseño accesible "Modo Abuelo" (112px, voz o texto con lectura en voz alta, zero-seed) para estudiantes del TecNM en trabajo de campo en la Mixteca.
---

# 📱 Skill TecNM: Arquitectura Rural Offline-First ("Modo Abuelo")

Las aplicaciones urbanas fallan en la montaña porque asumen conectividad 4G permanente y usuarios familiarizados con contraseñas complejas. Esta guía define los principios de ingeniería rural que aplicamos en el Open Hub TecNM. Lee primero [`AGENTS.md`](../../AGENTS.md) y [ADR-006](../../docs/adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md).

---

## 1. El Patrón "Outbox" en IndexedDB

Cuando el campesino está en su parcela en Yucuhiti o Tijaltepec, **no hay señal**. La aplicación nunca debe bloquearse ni mostrar pantallas de error:

1. **Almacenamiento Local Inmediato:** El registro de cosecha y la foto se guardan en el IndexedDB del navegador. **El audio solo se guarda hasta transcribirlo** al volver la señal; después se borra del teléfono y del servidor ([ADR-006](../../docs/adr/ADR-006-DATOS-FUERA-DE-LA-CADENA-E-IA.md), D5). La foto se guarda **ya sin metadatos** (sin GPS), porque su hash es el que se registra ([`BASE_DE_DATOS.md`](../../docs/arquitectura/BASE_DE_DATOS.md), sección 5).
2. **Cola de Salida (Outbox):** Se le asigna un estado `PENDIENTE_DE_SINCRONIZAR`.
3. **Sincronización al volver la señal:** Un listener `window.addEventListener('online', ...)` detecta cuándo el productor llega a la cabecera municipal (Tlaxiaco). Los datos sí pueden subirse solos, pero **el registro en la cadena no**: cada transacción la firma la persona en su teléfono con su PIN (patrón preparar → firmar → enviar, ADR-003). La app le avisa "Tienes 2 lotes por confirmar" y ella firma. Ver #99 [W9].

---

## 2. Principios de Diseño ("Modo Abuelo")

* **Botones Gigantes de 112px:** Diseñados para dedos callosos por el trabajo de campo y personas de la tercera edad con vista cansada.
* **Voz o texto, sin obligar a teclear:** La persona habla o escribe en el chat, o elige iconos grandes (grano, mazorca, miel, telar). Escribir siempre es una opción, nunca una obligación.
* **Leer en voz alta antes de firmar:** La app repite lo que entendió ("Entendí: café, de 10 a 25 kg, de Santiago Yosondúa. ¿Es correcto?") con botones grandes **Sí** y **No**, y deja corregir cada dato con voz o con el dedo. La IA nunca firma por ella ([ADR-007](../../docs/adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md); #155).
* **Decir la verdad cuando algo falla:** Si la IA no está o no entendió, la app lo dice ("No te escuché bien. ¿Lo intentamos otra vez o lo escribes?"). Nunca muestra un resultado inventado (ADR-006, D4).
* **Cero Frases Semilla (Zero-Seed Phrase):** La persona nunca anota 24 palabras. Su llave se genera **al azar en su propio celular**, cifrada con un PIN, o va cifrada en su tarjeta QR si no tiene celular ([ADR-004](../../docs/adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), D4; issues #91 y #117).
  * **Nunca derives la llave del número de teléfono, de la CURP ni de otro dato conocido:** cualquiera que sepa el número podría calcular la llave y vaciar la cuenta. El servidor nunca genera ni guarda llaves de usuarios (ADR-003).
