# UML diagrams and analysis documents

This folder holds Yucu's UML diagrams and the requirements, user stories, glossary and traceability documents. They help new contributors understand the design before touching the code. Each file comes from a GitHub issue labeled `[uml]` or `[docs]`.

*Versión en español abajo.*

## Tools

Draw with **[Modelio](https://www.modelio.org/)** (free and open source) or with a **licensed** copy of Enterprise Architect. Do not use cracked software.

Do **not** upload the tool's project files (`.qea`, `.eapx`, Modelio project folders). Upload only what is listed below.

## What to upload for a diagram issue

| File | What it is |
|---|---|
| `docs/uml/<name>.md` | Title, 2–4 lines, the image, the **Elements** table and the **Sources** list |
| `docs/uml/img/<name>.png` | The diagram exported as PNG, at least 800 px wide and at most 3 MB |
| `docs/uml/modelos/<name>.xmi` | *Optional.* The model exported as XMI, if your tool can export it |

`<name>` is the exact name the issue asks for (for example `seq-registrar-lote-por-voz`).

### Exporting the PNG

* **Modelio:** open the diagram and press **Save diagram in a file** in the diagram toolbar (next to the printer). Choose PNG. The camera button only copies the diagram to the clipboard.
* **Enterprise Architect:** use its *save diagram as image* option and choose PNG.
* If the image is narrower than 800 px, zoom in or increase the resolution before exporting.

### Template for `docs/uml/<name>.md`

```markdown
# Sequence diagram: register a lot by voice

Two to four lines: what the diagram shows and which part of Yucu it belongs to.

![Sequence diagram: register a lot by voice](img/seq-registrar-lote-por-voz.png)

## Elements

| Element | Kind | Source |
|---|---|---|
| Person | actor | ADR-007 |
| `WalletPort` | participant | `src/core/chain/ports.ts` |
| `prepareRegisterLot` | message | `src/core/chain/ports.ts` |
| `submit` | message | `src/core/chain/ports.ts` |

## Notes

Anything the sources do not define, written as a note instead of invented.

## Sources

- [ADR-007](../adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md)
- [`src/core/chain/ports.ts`](../../src/core/chain/ports.ts)

Tool: Modelio 5.4
```

**The Elements table is the most important part.** List every participant, class, interface, method, field, state or use case that appears in the diagram, exactly as written in it. Put code names between backticks; they must exist in the code or the ADR with the same spelling. The automatic check and the reviewers compare this table with the sources, because they cannot read names inside an image.

## Documents (`[docs]` issues in this folder)

Requirements, user stories, glossary and traceability are plain Markdown in `docs/uml/<name>.md`. Follow the format the issue asks for. Requirements use IDs `RF-01`, `RNF-01`… and every row cites its source.

## Automatic checks

Every pull request that touches `docs/uml/` runs **Validar diagramas UML**. It checks:

* the PR says `Resolves #N`, and only the files the issue asks for are added;
* the PNG is a real PNG, at least 800 px wide and at most 3 MB, and the `.md` shows it;
* the Elements table exists and includes what the issue asks for; names not found in the sources are flagged;
* there are no claims like "audited" or "in production", no hashes or keys, and no personal data.

It leaves a comment on the PR. Fix what is marked ❌ in the same branch; the check runs again on every push. Copilot may add comments about the content. A maintainer always reviews the diagram itself: be ready to explain it.

---

## En español

* **Herramientas:** Modelio (gratis) o Enterprise Architect con licencia. No subas el proyecto de la herramienta.
* **Para un diagrama sube:** `docs/uml/<nombre>.md`, `docs/uml/img/<nombre>.png` (PNG de al menos 800 px de ancho y máximo 3 MB) y, si quieres, `docs/uml/modelos/<nombre>.xmi`.
* **En Modelio:** botón **Save diagram in a file** de la barra del diagrama, tipo PNG. El botón de la cámara solo copia al portapapeles.
* **La tabla Elements es lo más importante:** escribe cada participante, clase, método, estado o caso de uso tal como aparece en el diagrama. Los nombres de código van entre comillas invertidas y deben existir igual en el código o en el ADR.
* **Revisión automática:** el PR recibe un comentario de *Validar diagramas UML*. Corrige lo marcado con ❌ en la misma rama.
* **Revisión de contenido:** la hace un mantenedor. Tendrás que explicar tu diagrama.
