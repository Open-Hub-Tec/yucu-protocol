# 🎓 Guía para estudiantes del TecNM: cómo resolver una issue en Yucu Protocol

Bienvenido/a a **Yucu Protocol** (`Open-Hub-Tec/yucu-protocol`). Aquí la persona **habla o escribe** en un chat, la IA prepara un borrador y lo lee en voz alta, y la persona firma. Las pruebas quedan en Stellar: el pasaporte del lote en `lot_passport` y las demás atestaciones en Attest Protocol. Todo es un prototipo en **testnet**.

Esta guía explica el proceso. Las reglas que no se rompen están en [`AGENTS.md`](../../AGENTS.md) y mandan sobre esta guía.

---

## 1. Elige tu issue

1. Abre la issue fijada **"Por dónde empezar (estudiantes)"** ([#152](https://github.com/Open-Hub-Tec/yucu-protocol/issues/152)). Dice qué issues se pueden empezar ya y cuáles esperan a otras.
2. Lee la issue completa, **incluidos los recuadros del principio**: donde un recuadro contradice el texto de abajo, manda el recuadro.
3. Pide que te la asignen **antes** de escribir código (un equipo por issue). En el comentario basta con tu usuario de GitHub y tu equipo. **No escribas tu número de control, tu teléfono ni datos de otras personas** (regla 5).

## 2. Lee lo que aplica a tu issue

| Si tu issue toca… | Lee |
|---|---|
| Cualquier cosa | [`AGENTS.md`](../../AGENTS.md) y los ADR que menciona la issue |
| Pantallas, chat, voz, letra grande | [`docs/arquitectura/FRONTEND.md`](../arquitectura/FRONTEND.md) y la skill [`student-offline-pwa`](../../skills/student-offline-pwa/SKILL.md) |
| Servidor | [`docs/arquitectura/SERVIDOR.md`](../arquitectura/SERVIDOR.md) |
| Base de datos | [`docs/arquitectura/BASE_DE_DATOS.md`](../arquitectura/BASE_DE_DATOS.md) |
| Atestaciones, IA, manifiestos | [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md), [ADR-007](../adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md) y la skill [`student-rwa-attestations`](../../skills/student-rwa-attestations/SKILL.md) |
| Contratos en Rust | La skill [`student-soroban-contracts`](../../skills/student-soroban-contracts/SKILL.md) |
| Git y PRs | La skill [`student-git-collaboration`](../../skills/student-git-collaboration/SKILL.md) |

Si usas Claude Code, las skills se cargan solas. Si usas otro asistente de IA, pídele que lea `AGENTS.md` y la guía que aplica antes de proponerte código.

## 3. Prepara tu rama

Usa **Node 22** (la versión exacta está en `.nvmrc`):

```bash
git checkout main
git pull origin main
nvm use
npm ci
git checkout -b feat/issue-<número>-<tema>
```

*Ejemplo:* `feat/issue-110-contratos-fase-1`. No pongas tu nombre en la rama.

## 4. Programa y prueba

* Cambios **pequeños y enfocados** en tu issue. No reformatees archivos que no tienen que ver.
* **Una prueba positiva y una negativa por cada regla nueva.** Si agregas un archivo en `src/tests/`, agrégalo al script `test` de `package.json`.
* Corre lo mismo que corre el CI:

```bash
npm run lint   # TypeScript sin errores
npm test       # pruebas
npm run build  # build de producción

# Solo si tocaste contracts/
cd contracts
cargo fmt --all
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
```

* Si usas Claude Code, pide al agente revisor: **"revisa mis cambios"**. Te dice qué regla rompes y dónde, sin escribir el código por ti.

## 5. Abre tu Pull Request

La plantilla de PR te pide lo necesario. Lo más importante:
1. `Resolves #<número>` en la descripción.
2. **Cómo lo probaste**, paso a paso. Si cambiaste pantallas, capturas en un celular de 360 px con letra Normal y Muy grande.
3. La lista de verificación marcada solo con lo que **sí** hiciste.

```bash
git add <archivos>
git commit -m "feat(chat): reconocer 'quiero cobrar' sin señal"
git push origin feat/issue-<número>-<tema>
```

## 6. Revisión y acreditación

Para que tu PR se fusione:
1. Cumple **todos** los criterios de aceptación de la issue y la "Definición de terminado".
2. `lint`, `test` y `build` pasan sin errores.
3. **Puedes explicar cada parte de tu código.** En la revisión te harán preguntas; un PR que no sepas explicar no se fusiona, aunque funcione. Esto también lo exige Drips Wave para el código hecho con ayuda de IA.
4. No rompe ninguna regla de `AGENTS.md`: nada custodial, nada inventado, nada de datos personales ni secretos, y los textos para personas mayores.

Los puntos de Drips Wave se asignan según las reglas de cada Wave. Esta guía no promete becas ni fondos.
