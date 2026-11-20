# Solicitud Drips Wave: diagrama de clases del puerto de cobros (Yucu)

Guía y borrador de solicitud para la issue «Draw a class diagram of the payout port and its data» del repositorio Open-Hub-Tec/yucu-protocol (Good first issue · design · sin código · complejidad trivial · 100 pts).

## 1. Cómo se aplica

Según el `CONTRIBUTING.md` del repositorio:

1. Entra a drips.network/wave con tu cuenta de GitHub.
2. Cuando haya una Wave activa, busca la issue de Yucu en la app de Drips y **aplica ahí**. Un comentario en GitHub solo no cuenta como solicitud.
3. Espera a que el maintainer te asigne la issue. **No empieces antes.**
4. Abre tu PR con `Resolves #<número de la issue>`. Cada Wave dura una semana.

## 2. Requisitos para cobrar la recompensa

- Tener 18 años o más.
- Pasar la verificación de identidad (KYC) de Drips.
- En equipo, una sola persona aplica y Drips le paga a esa persona; cómo se reparte es decisión del equipo.
- No hay recompensa, monto ni fecha garantizados.
- Para estudiantes de TecNM Campus Tlaxiaco, participar es voluntario y la calificación del curso no depende de aplicar, pasar el KYC ni recibir una recompensa.
- Drips no acepta trabajo de baja calidad, sin probar o generado con IA que no entiendas: en la revisión tendrás que explicar cada parte del diagrama.

## 3. Mensaje de solicitud (en inglés, para pegar en Drips)

Cambia lo que está entre corchetes por datos reales y no afirmes nada que no sea cierto.

> Hi! I'd like to take this issue: "Draw a class diagram of the payout port and its data".
>
> I have read AGENTS.md, CONTRIBUTING.md and src/core/chain/ports.ts. My plan:
> 1. Draw only what ports.ts defines (PayoutPort, PayoutQuote, CashoutRequest, CashoutReceipt, PayoutState, PayoutStatus), plus the supporting types they reference, and write anything undefined as a note instead of inventing it.
> 2. Build the diagram in [Modelio / Enterprise Architect] and export it as a PNG at least 800 px wide.
> 3. Add docs/uml/clases-cobros.md (title, short explanation, image, Elements table, sources) and docs/uml/img/clases-cobros.png, following docs/uml/README.md.
> 4. Open the PR with "Resolves #<issue number>" and make sure the "Validar diagramas UML" check is green.
>
> I can finish within the Wave week. I will only start after I am assigned, and I can explain every part of the diagram in the review.
>
> [Optional: one line about you, e.g. "I'm a student at TecNM Campus Tlaxiaco, Fundamentos de Ingeniería de Software."]

## 4. Lista de verificación antes de enviar

- [ ] Leí `AGENTS.md`, `CONTRIBUTING.md` y `src/core/chain/ports.ts`.
- [ ] Tengo instalado Modelio (gratis) o una licencia de Enterprise Architect.
- [ ] Nadie más tiene asignada la issue (es una persona por issue).
- [ ] Tengo 18 años o más y estoy dispuesto/a a pasar el KYC si quiero cobrar.
- [ ] Mi mensaje solo dice cosas verdaderas.

## 5. Después de que te asignen

Archivos que debes agregar (y nada más):

- `docs/uml/clases-cobros.md`
- `docs/uml/img/clases-cobros.png` (mínimo 800 px de ancho, exportado desde Modelio con «Save diagram in a file»)
- Opcional: `docs/uml/modelos/clases-cobros.xmi`

No subas archivos de proyecto de Modelio ni de Enterprise Architect.

Comandos:

```bash
git checkout -b docs/uml-clases-cobros
mkdir -p docs/uml/img
git add docs/uml/clases-cobros.md docs/uml/img/clases-cobros.png
git commit -m "docs(uml): add class diagram of the payout port"
git push origin docs/uml-clases-cobros
```

Cuerpo del PR (primera línea obligatoria):

```
Resolves #<issue number>

Adds a class diagram of PayoutPort and its data, drawn only from
src/core/chain/ports.ts. Includes PayoutPort, PayoutQuote, CashoutRequest,
CashoutReceipt, PayoutState and PayoutStatus with their real fields and methods.
No drawing-tool project files are included.
```

## 6. Fuente

- `CONTRIBUTING.md`, sección «Applying through Drips Wave», del repositorio Open-Hub-Tec/yucu-protocol.
- Texto de la issue.
