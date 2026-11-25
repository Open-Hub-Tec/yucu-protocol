# Revisión de textos: menú principal

Revisé la pantalla `MainMenuScreen` (`src/components/MainMenuScreen.tsx`, rama `main`). La revisión se hizo **solo desde el código**, sin abrir la demo, porque no pude acceder a `https://yucu-protocol.vercel.app`; el ancho de 360 px se tomó como referencia para juzgar la extensión de cada texto. Fecha: 24 de noviembre de 2026.

En la tabla, `L149` enlaza a la línea 149 real del archivo en `main`. Los problemas usan solo las cinco categorías pedidas: `larga`, `palabra técnica`, `inglés`, `afirmación sin pruebas` y `acción poco clara`.

| Line | Current text | Problem | Proposal |
|---|---|---|---|
| [L161](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L161) | `🛍️ Opción: Vitrina Comunitaria de Compras` | palabra técnica | `Ver la tienda` |
| [L183](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L183) | `Escuchado: "…". Di claramente: "1", "2", "3" o "4".` | larga | `Di un número.` |
| [L186](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L186) | `Audio grabado. Di en voz alta el número de opción: 1, 2, 3 o 4.` | larga | `Di un número.` |
| [L191](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L191) | `Error al procesar el audio del micrófono.` | palabra técnica | `No se escuchó bien.` |
| [L232](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L232) | `Permiso de micrófono no otorgado. Por favor permite el acceso o toca directamente el botón 1, 2, 3 o 4.` | larga | `No se pudo usar el micrófono. Toca el 1, 2, 3 o 4.` |
| [L257](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L257) | `Ver mapa de acopio y clima` | palabra técnica | `Ver mapa y clima` |
| [L262](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L262) | `Magdalena Peñasco, Oax.` | acción poco clara | `Magdalena Peñasco.` |
| [L264](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L264) | `🗺️ Ver Mapa & Clima de Acopio` | palabra técnica | `Ver mapa y clima` |
| [L280](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L280) | `Modo Parcela Activo: Puedes registrar tus fotos y audios sin señal celular; se guardan en tu teléfono y se sincronizan al llegar al pueblo.` | larga | `Sin señal. Puedes guardar tus fotos y audios.` |
| [L300](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L300) | `¿Qué tarea realizaremos hoy en sus parcelas? Presione o diga un número:` | larga | `¿Qué hará hoy? Presione o diga un número.` |
| [L304](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L304) | `Identidad Protegida · Modo Campesino` | afirmación sin pruebas | `Modo Campesino` |
| [L330](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L330) | `Café, miel, maíz, telar de cintura o palma` | larga | `Café, miel, maíz o telar.` |
| [L360](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L360) | `4 lotes activos en acopio` | palabra técnica | `Tiene 4 lotes.` |
| [L390](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L390) | `Recibos y saldo disponible` | acción poco clara | `Ver lo que le pagaron.` |
| [L417](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L417) | `4. Ayuda técnica` | palabra técnica | `4. Ayuda` |
| [L420](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L420) | `Chat directo con el equipo TecNM` | inglés | `Hablar con el equipo de la escuela.` |
| [L442](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L442) | `Navegación por Voz` | palabra técnica | `Hablar al menú` |
| [L443](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L443) | `Presione el botón y diga "1", "2", "3" o "4"` | larga | `Presione y diga un número.` |
| [L449](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L449) | `Hablar opción del menú` (aria-label) | acción poco clara | `Hablar` |
| [L449](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L449) | `Detener escucha de voz` (aria-label) | palabra técnica | `Detener` |
| [L499](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx#L499) | `Hable ahora: diga "Opción 1", "Registrar cosecha", "Mis lotes"...` | larga | `Hable ahora. Diga un número.` |

## Textos que prometen de más

- `Identidad Protegida` (L304): la pantalla afirma una protección que no se explica ni se comprueba aquí.
- `Chat directo con el equipo TecNM` (L420): el botón abre una pantalla de ayuda, no garantiza una conversación directa.

## Fuentes

- [`AGENTS.md`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/AGENTS.md), regla 8 y sección «Estilo».
- [`docs/arquitectura/FRONTEND.md`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/docs/arquitectura/FRONTEND.md), secciones 4, 6 y 9.
- [`skills/student-offline-pwa/SKILL.md`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/skills/student-offline-pwa/SKILL.md), sección 2.
- [`src/components/MainMenuScreen.tsx`](https://github.com/Open-Hub-Tec/yucu-protocol/blob/main/src/components/MainMenuScreen.tsx), en `main`.
