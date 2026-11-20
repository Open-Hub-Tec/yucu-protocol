---
applyTo: "docs/uml/**"
---

# Revisión de diagramas UML y documentos de `docs/uml/`

Estos PR los hacen estudiantes de Fundamentos de Ingeniería de Software del TecNM Campus Tlaxiaco y otros contribuidores de Drips Wave. Dibujan en **Modelio** o **Enterprise Architect** y entregan un `.md`, un PNG exportado y, a veces, un XMI. La guía completa está en `docs/uml/README.md`.

El workflow `validar-uml` ya revisa archivos, nombres de archivo, tamaño del PNG, `Resolves #N`, hashes, llaves y datos personales. **No repitas esas observaciones.** Tu trabajo es revisar el contenido.

## Cómo revisar

1. Lee la issue que el PR dice resolver (`Resolves #N`) y las fuentes que cita: ADR de `docs/adr/`, `src/core/chain/ports.ts` y los demás archivos enlazados.
2. Compara la tabla **Elements** del `.md` con esas fuentes:
   - Cada interfaz, método, campo, estado o tipo debe existir con **el mismo nombre** en el código o en el ADR. Señala los que no existan o estén mal escritos (por ejemplo `prepareRegister` en vez de `prepareRegisterLot`).
   - Señala lo que la sección "It must include" de la issue pide y falta en la tabla.
   - Si algo no está definido en las fuentes, debe aparecer como **nota**, no como hecho.
3. Revisa las reglas de `AGENTS.md` que aplican a los diagramas:
   - Regla 1: ningún participante del servidor genera, guarda o recibe llaves privadas, ni retiene fondos. El patrón es **preparar → firmar en el teléfono → enviar**.
   - Regla 3: no hay hashes, números de ledger ni resultados inventados; lo simulado se marca como simulado.
   - Regla 4: las pantallas solo hablan con los puertos.
   - Regla 7: no hay porcentajes escritos a mano.
   - Regla 8: no dice "audited", "in production" ni cifras sin evidencia.
   - Regla 9: la IA solo prepara un borrador; la persona firma.
4. En documentos de requisitos: cada requisito debe ser **verificable** y citar su fuente (decisión o sección del ADR). Señala los requisitos que no estén en el ADR.
5. Las etiquetas del diagrama y el texto del `.md` van en inglés; los nombres de código, exactamente como en el código.

## Cómo escribir los comentarios

- En **español**, con frases cortas y sin jerga. Muchos autores son estudiantes que hacen su primer PR.
- Un comentario por problema, con la línea de la tabla y la fuente que lo contradice.
- No escribas el diagrama ni el documento por ellos: di qué falta y dónde buscarlo.
- No propongas Mermaid ni otra herramienta: el diagrama es el PNG de Modelio o Enterprise Architect.
- No puedes ver la imagen. Si la tabla Elements está bien, recuérdale al mantenedor que compare el PNG con la tabla.
- No apruebes el PR. La aprobación es de los mantenedores.
