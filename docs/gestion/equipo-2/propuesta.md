# Propuesta final

**Proyecto:** Yucu Protocol  
**Equipo:** Equipo 2 — Equipo de Luis (**EQUIPO LUIS**)  
**Sprint:** Sprint 4  
**Repositorio:** Open-Hub-Tec/yucu-protocol  
**Issues relacionadas:** #198, #209, #210 y #211  
**Estado:** borrador con información pendiente de validar

> Este documento no afirma acuerdos, resultados ni cifras sin evidencia. Los campos `[PENDIENTE DE CONFIRMAR]` deben completarse con fuentes verificables antes de presentar la propuesta como final.

## Resumen ejecutivo

Yucu Protocol es un prototipo de aplicación orientado a la trazabilidad y visibilidad de productos de productores y artesanas de la Mixteca. El alcance concreto de la colaboración del Equipo 2 y el problema de la organización destinataria deben confirmarse con la evidencia de campo y los acuerdos previos.

La propuesta plantea organizar y documentar el alcance de atestaciones relacionado con la Issue #140, titulada **[W30] Attestation specification with test vectors**. La Issue define una especificación y artefactos de referencia; describe lo que debe hacerse, no trabajo que aquí se afirme terminado. El Manual del contribuidor asocia #140 con el trabajo individual de Drips de un integrante del Equipo 2 y la califica con 150 puntos; eso no es un presupuesto ni financiamiento garantizado del equipo. La relación entre ese trabajo individual y la actividad académica grupal #198 debe confirmarse con el docente.

- Organización beneficiaria: `[PENDIENTE DE CONFIRMAR: nombre legal y autorización para mencionarla]`.
- Entregable propuesto: completar y verificar los requisitos vigentes de #140, sujeto a confirmar con el docente que corresponden al alcance académico de #198.
- Costo total y fecha de cierre: `[PENDIENTE DE CONFIRMAR; deben coincidir con las secciones 5 y 6]`.

## Problema y contexto

**Contexto disponible:** el Manual del contribuidor describe Yucu como prototipo abierto bajo licencia MIT que usa Stellar en testnet para que productores y artesanas de la Mixteca registren lotes, prueben su origen y puedan vender sin intermediarios. Esto no acredita una necesidad concreta de una organización ni demuestra resultados del Equipo 2.

**Problema de la organización:** `[PENDIENTE DE CONFIRMAR con evidencia de Sprint 1 y con la organización real vinculada al equipo]`. No se encontraron en los cinco documentos locales historias de usuario, entrevistas, observaciones ni resultados de usabilidad del Equipo 2.

| Evidencia | Hallazgo que respalda | Fuente/fecha | Tratamiento de privacidad |
|---|---|---|---|
| `[PENDIENTE DE CONFIRMAR: cita anonimizada, cifra u observación verificable]` | `[PENDIENTE DE CONFIRMAR]` | `[PENDIENTE DE CONFIRMAR: registro original y fecha]` | Anonimizar; no publicar nombre, voz, foto, teléfono, domicilio ni identificador personal |

No hay en el árbol de trabajo auditado documentación versionada de los sprints 1–3 del Equipo 2 que permita completar esta sección. Las referencias a historias de usuario (Sprint 1), Plan de Calidad/costo de calidad (Sprint 2) y SMART/estimaciones/riesgos/Go-No-Go (Sprint 3) deben cotejarse con sus fuentes originales antes de incorporarlas.

## Objetivo SMART y alcance

**Objetivo SMART propuesto para aprobación:** A más tardar en `[PENDIENTE DE CONFIRMAR: fecha acordada por el curso y el equipo]`, el Equipo 2 preparará y someterá a revisión los entregables aplicables de la versión vigente de la Issue #140 —especificación de atestaciones, definiciones de esquemas, implementación de referencia y vectores/pruebas que dicha Issue requiera—, verificando cada requisito de aceptación y registrando evidencia revisable. La descripción consultada de #140 pide al menos seis vectores; confirmar ese mínimo contra la Issue vigente antes de fijarlo como meta de entrega académica. La relación de este objetivo con #198 requiere confirmación del docente.

| Componente | Definición por confirmar |
|---|---|
| Específico | Entregables de documentación y referencia técnica que correspondan al alcance vigente de #140; confirmar correspondencia con #198. |
| Medible | Criterios de aceptación aplicables de #140 y mínimo de vectores que establezca la Issue vigente. |
| Alcanzable | Condicionado a confirmar disponibilidad de integrantes, tiempo, dependencias y estado previo de artefactos: `[PENDIENTE DE CONFIRMAR]`. |
| Relevante | La especificación busca que otra implementación pueda reproducir formatos y cálculos; su relevancia para la organización requiere evidencia de Sprint 1: `[PENDIENTE DE CONFIRMAR]`. |
| Temporal | `[PENDIENTE DE CONFIRMAR: fecha académica aprobada; debe coincidir con el cronograma]`. |

**Incluye — según #140, sujeto a validar la Issue vigente:** especificar formato de value, manifiestos de esquemas con privacidad por campo e índices; documentar los cálculos y reglas que sigan vigentes, incluida la comparación requerida; preparar las definiciones de esquemas, implementación de referencia, vectores y pruebas que continúen siendo criterios de aceptación. La actualización de arquitectura de #140 indica que Attest Protocol calcula el identificador de atestación.

**No incluye — según la descripción de #140:** escribir o desplegar contratos centrales y resolvers. Exclusiones adicionales: `[PENDIENTE DE CONFIRMAR con la Issue vigente y el docente]`.

## Solución y uso de Stellar

**Solución propuesta:** documentar una especificación inequívoca del módulo de atestaciones y preparar los artefactos de referencia que la versión vigente de #140 mantenga como requisitos. Su finalidad técnica es permitir que otras implementaciones reproduzcan los formatos y reglas especificados; no se afirma que el Equipo 2 ya haya completado ese trabajo.

La actualización de arquitectura publicada en #140 indica que Attest Protocol es la base aceptada; distingue el formato de value, los manifiestos de esquemas con privacidad por campo y los índices, y señala que Attest Protocol calcula el identificador de la atestación. Consultar la Issue vigente para resolver cualquier diferencia con texto anterior.

| Estado | Descripción y evidencia |
|---|---|
| Implementado | El README indica que las atestaciones en Attest Protocol y el motor de voz están documentados y que nada de ese módulo está construido todavía. Ese estado describe el repositorio, no entregas del Equipo 2; verificar contra la rama/fecha de evaluación. |
| Demostración | El Manual del contribuidor describe Yucu como prototipo en Stellar testnet; no identifica qué parte de #140 se demuestra. `[PENDIENTE DE CONFIRMAR]` |
| Simulado | No se encontró evidencia local de una simulación específica de #140. No atribuir comportamiento simulado sin revisar el código y el README. |
| Pendiente | Estado de cada entregable y criterio de aceptación: `[PENDIENTE DE CONFIRMAR mediante la Issue vigente y el repositorio]` |

La Issue #140 precisa que los vectores comprueban subject_ref, el hash con sal, el texto value y el hash del manifiesto; Attest Protocol calcula el identificador de la atestación. La actualización incluye manifiestos con privacidad por campo y las claves BySubject, ByAttester, ByRecipient, Status y SchemaStats. En la extensión de listas/eventos pide documentar codificación, lecturas y tópicos; consultar los criterios vigentes para el alcance exacto. Stellar testnet es el entorno declarado para Yucu, pero no demuestra que los entregables de #140 estén construidos. El README marca las atestaciones como documentadas y aún no construidas. No afirmar producción, auditoría ni certificación.

## Plan de trabajo y cronograma

| Entregable | Qué se entrega | Cómo se verifica | Fecha | Responsable |
|---|---|---|---|---|
| 1. Confirmar alcance y antecedentes | Matriz de criterios vigentes de #140, relación con #198 e insumos de Sprints 1–3 localizados. | Revisar la Issue y sus fuentes; validar relación con docente; inventariar enlaces. | `[PENDIENTE DE CONFIRMAR]` | Equipo 2; persona `[PENDIENTE DE CONFIRMAR: @usuario]`. |
| 2. Elaborar/revisar la especificación | Documento con formatos, reglas de privacidad, índices y ejemplos que exija #140. | Lista de criterios vigente, revisión por pares y ejemplos reproducibles. | `[PENDIENTE DE CONFIRMAR]` | Equipo 2; persona `[PENDIENTE DE CONFIRMAR: @usuario]`. |
| 3. Completar artefactos de referencia | Esquemas, código de referencia, vectores y pruebas solo si siguen exigidos por #140. | Revisar esquemas y ejecutar pruebas contra vectores/criterios; registrar evidencia. | `[PENDIENTE DE CONFIRMAR]` | Equipo 2; persona `[PENDIENTE DE CONFIRMAR: @usuario]`. |
| 4. Revisión y cierre de evidencia | Correcciones, enlaces y estado de cada criterio; revisión cruzada. | Lista de aceptación #140 y revisión sustantiva; el estado del PR se agrega cuando exista. | `[PENDIENTE DE CONFIRMAR]` | Equipo 2; persona revisora `[PENDIENTE DE CONFIRMAR: @usuario]`. |

Este es un cronograma propuesto, no aprobado. Las fechas deben confirmarse con el calendario del curso y coincidir con presupuesto y carta. El Manual del contribuidor sitúa la Ola 11 de Drips entre el 18 y el 25 de noviembre de 2026; esa fecha no confirma el cronograma académico. La fecha límite publicada para #209 fue el 16 de noviembre de 2026; `[PENDIENTE DE CONFIRMAR con el docente el tratamiento de la entrega fuera de plazo]`. Responsables personales: `[PENDIENTE DE CONFIRMAR: @usuario y reparto]`.

## Presupuesto y personal

| Entregable | Responsable (`@usuario`) | Horas estimadas | Tarifa | Costo |
|---|---|---:|---:|---:|
| Confirmar alcance e insumos | `[PENDIENTE DE CONFIRMAR: @usuario]` | `[PENDIENTE DE CONFIRMAR]` | `[PENDIENTE DE CONFIRMAR: tarifa/fuente]` | Horas × tarifa: `[PENDIENTE DE CONFIRMAR]` |
| Especificación y revisión | `[PENDIENTE DE CONFIRMAR: @usuario]` | `[PENDIENTE DE CONFIRMAR]` | `[PENDIENTE DE CONFIRMAR: tarifa/fuente]` | Horas × tarifa: `[PENDIENTE DE CONFIRMAR]` |
| Esquemas, referencia, vectores y pruebas que exija #140 | `[PENDIENTE DE CONFIRMAR: @usuario]` | `[PENDIENTE DE CONFIRMAR]` | `[PENDIENTE DE CONFIRMAR: tarifa/fuente]` | Horas × tarifa: `[PENDIENTE DE CONFIRMAR]` |
| Costo de calidad de Sprint 2 | `[PENDIENTE: recuperar método y dato del Plan de Calidad]` | `[PENDIENTE DE CONFIRMAR]` | `[PENDIENTE DE CONFIRMAR]` | `[PENDIENTE: no duplicar horas/costos ya contabilizados]` |
| **Total** |  | **[PENDIENTE: suma de horas individuales]** |  | **[PENDIENTE: suma documentada]** |

Documentar la fuente de tarifas y estimaciones; mostrar el cálculo por entregable; asegurar que las horas por integrante sumen el total; incorporar el costo de calidad con el método de Sprint 2; hacer coincidir costos y fechas con resumen y cronograma. Financiamiento real disponible: `[PENDIENTE DE CONFIRMAR con fuente]`.

El Manual del contribuidor asigna 150 puntos Drips a #140, pero indica que no hay pago fijo por issue y que el pago depende de los puntos distribuidos en la ola. Esos puntos no son horas, tarifa, presupuesto del equipo ni financiamiento garantizado. No se incluye la bolsa general de Drips como ingreso comprometido.

## Riesgos y viabilidad

**Recomendación provisional: Go condicional.** #140 define una tarea técnica acotada que puede planearse y verificarse por criterios. Sin embargo, no se encontraron aquí artefactos de Sprints 1–3, evidencia que conecte el módulo con la necesidad de la organización, estimaciones del equipo ni una fuente de financiamiento. No hay base suficiente para recomendar Go definitivo ni afirmar viabilidad financiera.

Las calificaciones de probabilidad e impacto siguientes son **valoraciones cualitativas propuestas para discusión**, no datos medidos ni evaluación aprobada. Deben revisarse con el equipo y el docente.

| Riesgo (si… entonces…) | Probabilidad | Impacto | Respuesta | Responsable |
|---|---|---|---|---|
| Si no se cotejan actualización de arquitectura y criterios vigentes de #140, entonces los artefactos podrían no cumplir la especificación actual. | Media — propuesta por validar | Alto — propuesta por validar | Registrar criterios vigentes y validar alcance con docente/revisor antes de cerrar el diseño. | Equipo 2; persona `[PENDIENTE DE CONFIRMAR: @usuario]`. |
| Si no se recuperan insumos de Sprint 1 ni la organización valida la necesidad, entonces no se podrá justificar la pertinencia organizacional. | Media — propuesta por validar | Alto — propuesta por validar | Recuperar evidencia anonimizada y confirmar la interpretación con la organización antes de presentar beneficios como hechos. | Equipo 2; persona `[PENDIENTE DE CONFIRMAR: @usuario]`. |
| Si no se recuperan Plan de Calidad y costo de Sprint 2, entonces el presupuesto no reflejará el costo de calidad requerido. | Media — propuesta por validar | Medio — propuesta por validar | Solicitar el artefacto fuente y documentar el método; no inventar importes. | Equipo 2; persona `[PENDIENTE DE CONFIRMAR: @usuario]`. |
| Si se trata la asignación de puntos Drips como ingreso fijo, entonces la viabilidad financiera quedará sobreestimada. | Media — propuesta por validar | Alto — propuesta por validar | Excluir puntos de la suma presupuestaria y usar solo financiamiento confirmado con fuente. | Equipo 2; persona `[PENDIENTE DE CONFIRMAR: @usuario]`. |

Las calificaciones de riesgo son propuestas cualitativas; el equipo debe validarlas. Los responsables personales continúan pendientes. Para recomendar Go se requiere confirmar alcance, evidencia de necesidad, objetivo, calendario y responsables; completar presupuesto con horas, tarifas y costo de calidad trazables; e identificar recursos o financiamiento realistas. Si esas condiciones no son viables, reconsiderar la recomendación. La evaluación final corresponde al equipo y al docente.

## Evidencia y siguientes pasos

**Fuentes verificables disponibles:**

- [Issue #140 — especificación de atestaciones](https://github.com/Open-Hub-Tec/yucu-protocol/issues/140): alcance técnico, actualización de arquitectura y criterios de aceptación.
- [README del repositorio](../../../README.md), tabla “Implementation status”: describe el producto como prototipo testnet, marca la demo con datos simulados y declara las atestaciones documentadas pero aún no construidas.
- Manual del contribuidor, versión 19 de noviembre de 2026: describe Yucu como prototipo MIT en testnet, identifica #140 como issue de 150 puntos y advierte que el pago Drips no es una cantidad fija. El manual no es evidencia de presupuesto ni de trabajo terminado.

**Evidencia académica aún no localizada en los documentos de gestión disponibles:** fuentes de Sprints 1–3, registros de campo del Equipo 2, estimaciones, costos, confirmación de la organización e implementación del módulo. La fecha publicada para #209 fue 16 de noviembre de 2026; el docente debe confirmar cómo presentar la entrega después de esa fecha.

| Siguiente paso | Evidencia de cierre | Fecha | Responsable |
|---|---|---|---|
| Recuperar y validar entregables/acuerdos de Sprints 1–3 y la instrucción del Issue #198. | Enlaces o documentos fuente revisados | `[PENDIENTE DE CONFIRMAR]` | Equipo 2; `@usuario` `[PENDIENTE DE CONFIRMAR]` |
| Confirmar organización, alcance, objetivo SMART, responsables, horas, tarifas y costos. | Aprobación/documentación del equipo y organización | `[PENDIENTE DE CONFIRMAR]` | Equipo 2 / docente / organización según el dato; `@usuario` `[PENDIENTE DE CONFIRMAR]` |
| Completar indicadores e informe con datos del tablero y verificar si se envió a la organización. | Registro del tablero y constancia de envío | `[PENDIENTE DE CONFIRMAR]` | Equipo 2; `@usuario` `[PENDIENTE DE CONFIRMAR]` |
| Revisar privacidad, consistencia y criterios de las Issues antes de presentar la versión final. | Revisión documentada | `[PENDIENTE DE CONFIRMAR]` | Equipo 2 y revisor; `@usuario` `[PENDIENTE DE CONFIRMAR]` |

**Ética y datos personales.** Aplicar `docs/research/PRIVACIDAD.md`: no publicar datos identificables de la comunidad; usar citas y evidencia anonimizadas. No prometer ventas, ingresos o certificaciones ni describir el prototipo como “en producción” o “auditado”.
