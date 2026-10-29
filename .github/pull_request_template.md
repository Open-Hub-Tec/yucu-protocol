### 🌾 Descripción del Cambio
<!-- Explica brevemente qué cambiaste y por qué -->

### 📌 Issue Vinculada (obligatoria)
<!-- Reemplaza con el número de tu issue asignada -->
Resolves #

---

### 🏛️ Área del Protocolo Modificada
- [ ] **Pantallas / UI rural:** `src/components/`
- [ ] **Puertos y lógica:** `src/core/` (cadena, atestaciones, IA, pagos)
- [ ] **Servidor y base de datos:** `server.ts`, `src/server/` (sigue [`SERVIDOR.md`](../docs/arquitectura/SERVIDOR.md) y [`BASE_DE_DATOS.md`](../docs/arquitectura/BASE_DE_DATOS.md))
- [ ] **Contratos Soroban (Rust):** `contracts/`
- [ ] **Documentación / Pruebas:** `docs/` o `src/tests/`

---

### 🧪 Cómo lo probé
<!-- Pasos para reproducir lo que probaste. Si cambiaste pantallas, una captura en celular -->

### ✅ Lista de verificación
- [ ] `npm run lint`, `npm test` y `npm run build` pasan (y `cargo fmt`, `clippy`, `cargo test` si toqué `contracts/`).
- [ ] Agregué una prueba positiva y una negativa por cada regla nueva, y los archivos nuevos de `src/tests/` están en el script `test` de `package.json`.
- [ ] Nada simulado sin `source: 'simulated'` y `<DemoBadge />`; la IA solo sugiere, nunca firma ni certifica.
- [ ] Sin nombres de personas entrevistadas, teléfonos, llaves ni secretos en código, pruebas o logs.
- [ ] Si cambié pantallas, las probé en un celular y en Modo Abuelo.
- [ ] Puedo explicar cada parte de mi código en la revisión.
- [ ] (Opcional) Corrí el agente `yucu-revisor` en Claude Code ("revisa mis cambios") y atendí lo que encontró.

---

### 🎓 Datos del Contribuidor
- **Nombre:** 
- **Carrera / Semestre:** Ingeniería en Sistemas Computacionales / TecNM Tlaxiaco
- **Comunidad de Origen (Opcional):**
