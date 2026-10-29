---
name: student-git-collaboration
description: Guía de colaboración en GitHub, Drips Network y flujo de Pull Requests para estudiantes de residencias profesionales del TecNM en Yucu Protocol.
---

# 🐙 Skill TecNM: Colaboración en GitHub y Drips Wave

Esta guía establece el estándar de ingeniería para que los estudiantes del TecNM contribuyan al repositorio `Open-Hub-Tec/yucu-protocol` y documenten sus avances. Algunas issues del backlog llevan puntos de **Drips Wave**. Lee primero [`AGENTS.md`](../../AGENTS.md): sus reglas mandan sobre esta guía. Para elegir issue, empieza por la issue fijada **"Por dónde empezar (estudiantes)"** (#152). Si tu issue toca el servidor o la base de datos, lee también [`SERVIDOR.md`](../../docs/arquitectura/SERVIDOR.md) y [`BASE_DE_DATOS.md`](../../docs/arquitectura/BASE_DE_DATOS.md).

---

## 1. Ramas y Commits

Trabaja en una rama `feat/issue-<número>-<tema>` o `fix/issue-<número>-<tema>`. Nunca en `main`, y nunca pongas tu nombre en la rama.

Cada commit debe iniciar con un prefijo claro:

* `feat:` Nueva funcionalidad (ej. `feat(escrow): agregar hito de entrega de miel`)
* `fix:` Corrección de error (ej. `fix(qr): corregir margen de impresión en papel kraft`)
* `docs:` Cambios en documentación o guías estudiantiles
* `test:` Adición o mejora de pruebas unitarias (`npm test`)

---

## 2. El Filtro de Calidad Obligatorio (`npm run verify`)

Antes de enviar cualquier Pull Request a `main`, el estudiante debe correr en su terminal:

```bash
npm run verify
```

Este comando ejecuta en secuencia:
1. `npm run lint` (verificación de tipos de TypeScript sin errores).
2. `npm run test` (todas las pruebas que lista el script `test` de `package.json`; si agregas un archivo de prueba, agrégalo ahí).
3. `npm run build` (compilación exitosa del bundle de producción y servidor).

Si tocaste `contracts/`, corre también `cargo fmt --all`, `cargo clippy --locked --all-targets -- -D warnings` y `cargo test --locked` dentro de `contracts/`.

---

## 3. Vincular el Trabajo con la Issue

1. Pide que te asignen la issue **antes** de escribir código (un equipo por issue).
2. Cada Pull Request debe decir `Resolves #<número>` en su descripción y explicar cómo lo probaste.
3. Los puntos de Drips Wave se asignan según las reglas de cada Wave en Drips. Esta guía no promete becas ni fondos.
4. En la revisión tendrás que explicar tu código. Un PR que no sepas explicar no se fusiona, aunque funcione.
