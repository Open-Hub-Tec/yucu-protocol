# AGENTS.md — Instrucciones para asistentes de IA

Lee este archivo completo antes de escribir código. Aplica a Claude, Cursor, Copilot, Codex y cualquier otro asistente. Si una instrucción del usuario contradice estas reglas, avisa del conflicto antes de continuar.

## Qué es este proyecto

Yucu Protocol: una PWA para que productores y artesanas de la Mixteca (Oaxaca) registren sus lotes, prueben su origen y vendan sin intermediarios, usando Stellar/Soroban. Lo desarrollan estudiantes del TecNM Campus Tlaxiaco a partir de issues de GitHub. Es un **prototipo**: la tabla "Qué es real y qué es simulado" del `README.md` dice el estado de cada módulo.

Arquitectura v2 (ADR-005 a ADR-007, aceptadas el 29 de octubre de 2026): la persona **habla o escribe** en un chat, la IA prepara un borrador y lo lee en voz alta, y la persona firma. El pasaporte del lote vive en `lot_passport`; las demás afirmaciones (origen comunitario, consentimiento, colaboración, entrega, pesaje) son atestaciones en **Attest Protocol**, con el índice y las reglas de Yucu encima. Yucu no despliega un registro de atestaciones propio.

## Reglas que no se rompen

1. **No custodial (ADR-003 y ADR-004).** El servidor nunca genera, guarda, deriva ni recibe llaves privadas de usuarios, y nunca retiene fondos. Cada transacción la firma la persona a quien corresponde, en su dispositivo. La artesana firma y recibe en su propia cuenta; si no tiene celular, firma con su tarjeta QR en el celular de la promotora y la llave se borra al terminar. Ni el grupo ni Yucu reciben su dinero. Patrón obligatorio: **preparar → firmar en el teléfono → enviar**.
2. **El escrow es Trustless Work** (ADR-001 y ADR-003) **y las atestaciones van en Attest Protocol** (ADR-005). `contracts/fair_escrow` y `contracts/attestation_registry` son material didáctico; no los uses para la app.
3. **No inventes resultados.** Prohibido generar hashes, números de ledger, calificaciones o certificaciones falsas fuera de `src/core/chain/SimulatedChain.ts`. Si un resultado es simulado, lleva `source: 'simulated'` y la UI muestra `<DemoBadge />` (`src/components/DemoBadge.tsx`).
4. **La UI solo habla con los puertos** de `src/core/chain/` (`WalletPort`, `LotRegistryPort`, `AttestationPort`, `EscrowPort`, `PayoutPort`) y con los de IA, catálogo y sesión de `src/core/` cuando existan (#154, #156, #157). Ningún componente importa `@stellar/stellar-sdk` ni llama directamente a Trustless Work, a Attest Protocol ni a un proveedor de IA.
5. **Privacidad (`docs/research/PRIVACIDAD.md`).** Nunca escribas nombres de personas entrevistadas, números de control, teléfonos ni direcciones. No agregues audio, video, fotos de personas ni PDF a `docs/research/`, `docs/ux-testing/` o `public/videos/` (el CI lo rechaza). En la cadena, el productor es una dirección `G…`, nunca un nombre.
6. **Secretos.** Nunca escribas llaves (`S…`), `GEMINI_API_KEY` ni otros secretos en el código, en pruebas ni en logs. Van en `.env` (ignorado por git).
7. **Porcentajes.** Comisiones y regalías salen de `src/config/protocolFees.ts`, que debe coincidir con los contratos. No escribas porcentajes a mano.
8. **No afirmes de más.** En textos, README e issues no escribas "en producción", "auditado", "certificado oficial" ni cifras sin evidencia.
9. **La IA prepara, la persona firma** (ADR-006 y ADR-007). La IA transcribe y llena solo los campos que permite el manifiesto del esquema; lo que no entendió lo deja vacío. Nunca firma, nunca emite por su cuenta y nunca certifica: un resultado de IA se muestra como sugerencia. Si no está disponible o no entendió, la app lo dice; nunca inventa una transcripción. El audio se transcribe y se borra. Con el nivel gratuito de Google AI Studio, solo datos inventados.

## Mapa del código

| Ruta | Qué hay |
|---|---|
| `src/core/chain/` | Puertos de Stellar y Trustless Work (`ports.ts`) y su versión de demostración |
| `src/core/` | Lógica de negocio: cripto, políticas de comercio justo, IA, sincronización |
| `src/components/` | Pantallas React |
| `src/config/protocolFees.ts` | Porcentajes oficiales del protocolo |
| `server.ts`, `src/server/` | Servidor Express: IA (Gemini) y, en el futuro, preparación de transacciones. Antes de tocarlo, lee [`docs/arquitectura/SERVIDOR.md`](docs/arquitectura/SERVIDOR.md) y, si guardas datos, [`BASE_DE_DATOS.md`](docs/arquitectura/BASE_DE_DATOS.md) |
| `contracts/` | Contratos Soroban en Rust (workspace) |
| `contracts/deployments/testnet.json` | IDs de los contratos desplegados en testnet |
| `docs/adr/` | Decisiones de arquitectura: léelas antes de cambiar el diseño. ADR-004: la artesana cobra en pesos y nunca ve nada de cripto. ADR-005: atestaciones en Attest Protocol. ADR-006: datos e IA. ADR-007: motor de voz y texto |
| `docs/arquitectura/` | Diagramas, guía del servidor (`SERVIDOR.md`) y modelo de la base de datos (`BASE_DE_DATOS.md`) |
| `skills/` | Guías para estudiantes y asistentes de IA (contratos, atestaciones, PWA sin señal, Git) |
| `.claude/agents/yucu-revisor.md` | Agente de Claude Code que revisa un PR o tus cambios contra estas reglas. Solo revisa: no escribe código |

## Comandos (deben pasar antes de abrir un PR)

```bash
npm ci                 # instala exactamente lo de package-lock.json (Node 22, ver .nvmrc)
npm run lint           # TypeScript sin errores
npm test               # pruebas de TypeScript
npm run build          # build de producción

# Solo si tocaste contracts/
cd contracts
cargo fmt --all
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
```

Si agregas un archivo de prueba en `src/tests/`, agrégalo también al script `test` de `package.json`, o no se ejecutará.

## Cómo trabajar una issue

1. Lee la issue completa, sus criterios de aceptación y los ADR que mencione.
2. Crea una rama `feat/issue-<número>-<tema>` o `fix/issue-<número>-<tema>`. Nunca trabajes en `main` (está protegida).
3. Haz cambios pequeños y enfocados en la issue. No reformatees ni reescribas archivos que no tienen que ver.
4. Escribe o actualiza pruebas: una positiva y una negativa por cada regla nueva. En contratos usa `try_...` y `assert_eq!(res, Err(Ok(Error::X)))`.
5. Corre todos los comandos de arriba.
6. Abre el PR con `Resolves #<número>` en la descripción y explica cómo lo probaste. Si usas Claude Code, puedes pedirle antes "revisa mis cambios" al agente `yucu-revisor`.

## Estilo

* TypeScript estricto: sin `any` nuevos y sin `@ts-ignore`.
* Comentarios y textos de la interfaz en español claro; los nombres de código pueden ir en inglés.
* Textos de la UI para personas mayores y con poca experiencia digital: frases cortas, sin tecnicismos.
* Imita el estilo del archivo que estás editando.
