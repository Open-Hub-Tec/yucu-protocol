# Verificación del build de Attest Protocol v2 (#187)

> **Fecha:** 23 de noviembre de 2026. **Issue:** [W55 / #187](https://github.com/Open-Hub-Tec/yucu-protocol/issues/187). **ADR:** [ADR-005, D10.6](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md).
>
> **Resultado: COINCIDE (`matches`).** El wasm desplegado en testnet se reconstruyó **byte por byte** desde `daccred/attestprotocol` en el commit `6a87b7be9d8d438c73c74109dc0601a446f8ea1f`, con Rust 1.97.1 y stellar CLI 27.1.0. El SHA-256 obtenido es `2b699bf3a0f8c2363bb0b296be8afcaffc424986dafe33a082a058c3fe0950a8`, igual al del contrato desplegado. Ese commit incluye las correcciones HAL-04 a HAL-09. Hizo falta **un solo intento**.

## 1. Alcance

Esto comprueba que el binario publicado sale del código público indicado y que ese código contiene las correcciones de los hallazgos Halborn documentados. **No** es una auditoría nueva, **no** cambia el estado de "unverified" de StellarExpert y **no** autoriza emitir en mainnet: la decisión de mainnet sigue siendo del mantenedor (ADR-005, D10.6).

No se usaron llaves, fondos ni cuentas financiadas: solo se descargó un wasm público y se compiló código público. No se desplegó nada ni se modificó el repositorio de Attest Protocol.

Se verificó el contrato de **testnet**. El wasm de mainnet no se volvió a descargar porque este entorno no tiene un RPC público de mainnet configurado (`stellar contract fetch --network mainnet` responde `Invalid URL Bring Your Own`); la conclusión de esta página aplica al binario de testnet, que es el mismo hash declarado en el issue para mainnet.

## 2. Datos observados

| Dato | Valor |
|---|---|
| Contrato testnet v2 | `CA2QET2KOUGAECEVYQEQT3SLDDZRUMAQHI7MMDTFVJY62WTHUTERAUCD` |
| Hash del wasm desplegado | `2b699bf3a0f8c2363bb0b296be8afcaffc424986dafe33a082a058c3fe0950a8` |
| Tamaño | 34 287 bytes |
| Commit fuente | `6a87b7be9d8d438c73c74109dc0601a446f8ea1f` (2026-08-29 23:24:51 UTC) |
| Despliegue registrado | 2026-08-29 23:24:12 UTC, ledger 4 404 453, tx `214ce4240e0f57d84a4fd827d3fb743d50f1584f6838ebadb27eb9a12d46de90` |
| Rust (según metadata) | `1.97.1` (`rustc 1.97.1 (8bab26f4f 2026-07-14)`, `cargo 1.97.1 (c980f4866 2026-06-30)`) |
| stellar CLI (según metadata) | `27.1.0 (8e402ea28202950b272fbabc34caad4d2f64fe87)` |
| soroban-sdk | `27.0.6` (fijado en `contracts/stellar/Cargo.toml` y `Cargo.lock`) |
| Target | `wasm32v1-none` |
| Comando de build | `stellar contract build --package protocol`, desde `contracts/stellar` |

La metadata **del wasm desplegado**, obtenida con `stellar contract info meta`, dice exactamente:

```json
[
  { "sc_meta_v0": { "key": "rsver",    "val": "1.97.1" } },
  { "sc_meta_v0": { "key": "rssdkver", "val": "27.0.6#60926a20d1f9f0a669d5fe551636f42a1302f0c0" } },
  { "sc_meta_v0": { "key": "cliver",   "val": "27.1.0#8e402ea28202950b272fbabc34caad4d2f64fe87" } }
]
```

Por eso se descartó la suposición inicial de Rust 1.98.0 y CLI 28.0.0: esas versiones son posteriores al despliegue. Rust 1.97.1 se publicó el 16 de julio de 2026 y stellar CLI 27.1.0 el 26 de agosto de 2026, así que ambas estaban vigentes el 29 de agosto.

## 3. Comandos para repetirlo

### 3.1 Descargar y medir el binario desplegado

```bash
source "$HOME/.cargo/env"

stellar contract fetch \
  --id CA2QET2KOUGAECEVYQEQT3SLDDZRUMAQHI7MMDTFVJY62WTHUTERAUCD \
  --network testnet \
  --out-file /tmp/attest-v2-testnet.wasm
# -> Wrote the contract WASM file to /tmp/attest-v2-testnet.wasm

sha256sum /tmp/attest-v2-testnet.wasm
# -> 2b699bf3a0f8c2363bb0b296be8afcaffc424986dafe33a082a058c3fe0950a8  /tmp/attest-v2-testnet.wasm

stellar contract info meta --wasm /tmp/attest-v2-testnet.wasm --output json-formatted
# -> rsver 1.97.1, rssdkver 27.0.6#60926a20..., cliver 27.1.0#8e402ea2...
```

### 3.2 Instalar las versiones exactas y reconstruir

```bash
source "$HOME/.cargo/env"
rustup toolchain install 1.97.1 --profile minimal
rustup target add wasm32v1-none --toolchain 1.97.1

curl -fsSL \
  https://github.com/stellar/stellar-cli/releases/download/v27.1.0/stellar-cli-27.1.0-x86_64-unknown-linux-gnu.tar.gz \
  -o /tmp/stellar-cli-27.1.0.tar.gz
mkdir -p /tmp/stellar-cli-27.1.0
tar -xzf /tmp/stellar-cli-27.1.0.tar.gz -C /tmp/stellar-cli-27.1.0
export PATH="/tmp/stellar-cli-27.1.0:$PATH"

stellar --version
# -> stellar 27.1.0 (8e402ea28202950b272fbabc34caad4d2f64fe87)

git clone https://github.com/daccred/attestprotocol.git /tmp/attestprotocol
cd /tmp/attestprotocol
git worktree add --detach /tmp/attest-6a87 6a87b7be9d8d438c73c74109dc0601a446f8ea1f
cd /tmp/attest-6a87/contracts/stellar

RUSTUP_TOOLCHAIN=1.97.1 stellar contract build --package protocol
```

Salida relevante del build:

```text
ℹ️  CARGO_BUILD_RUSTFLAGS=--remap-path-prefix=/home/Luis/.cargo/registry/src= SOROBAN_SDK_BUILD_SYSTEM_SUPPORTS_SPEC_SHAKING_V2=1 cargo rustc --manifest-path=protocol/Cargo.toml --crate-type=cdylib --target=wasm32v1-none --release
    Finished `release` profile [optimized] target(s) in 47.46s
ℹ️  Build Summary:
    Wasm File: target/wasm32v1-none/release/protocol.wasm (34287 bytes optimized (original size was 37394 bytes))
    Wasm Hash: 2b699bf3a0f8c2363bb0b296be8afcaffc424986dafe33a082a058c3fe0950a8
    Exported Functions: 14 found
      • attest • attest_by_delegation • get_attestation • get_attester_nonce
      • get_bls_key • get_dst_for_attestation • get_dst_for_revocation
      • get_revoker_nonce • get_schema • initialize • register
      • register_bls_key • revoke • revoke_by_delegation
✅ Build Complete
```

El CLI fija `CARGO_BUILD_RUSTFLAGS=--remap-path-prefix=…`, de modo que la ruta local del registro de Cargo no cambia el hash. El `Cargo.lock` del repositorio quedó sin modificaciones (`git status` limpio).

### 3.3 Comparar

```bash
sha256sum target/wasm32v1-none/release/protocol.wasm
# -> 2b699bf3a0f8c2363bb0b296be8afcaffc424986dafe33a082a058c3fe0950a8

cmp /tmp/attest-v2-testnet.wasm target/wasm32v1-none/release/protocol.wasm \
  && echo "byte-for-byte identical"
# -> byte-for-byte identical

stellar contract info meta --wasm target/wasm32v1-none/release/protocol.wasm --output json-formatted
# -> la misma metadata del binario desplegado (rsver, rssdkver, cliver)
```

**Nota sobre el compilador C.** Este entorno no tiene `cc`, `gcc` ni `clang` y no permite `sudo`, pero los *build scripts* de crates del host necesitan un enlazador C. Se proporcionó uno local sin instalar nada en el sistema, usando Zig 0.15.2 como `cc`:

```bash
mkdir -p /tmp/opencode/zig
curl -fL https://ziglang.org/download/0.15.2/zig-x86_64-linux-0.15.2.tar.xz \
  -o /tmp/opencode/zig/zig.tar.xz
tar -xJf /tmp/opencode/zig/zig.tar.xz -C /tmp/opencode/zig
mkdir -p /tmp/opencode/bin
printf '#!/bin/sh\nexec /tmp/opencode/zig/zig-x86_64-linux-0.15.2/zig cc "$@"\n' \
  > /tmp/opencode/bin/cc
chmod +x /tmp/opencode/bin/cc
export PATH="/tmp/opencode/bin:$PATH"
```

En una máquina con `cc` (por ejemplo, la imagen oficial `rust:1.97.1` con `build-essential`) ese paso no hace falta. El compilador C solo interviene en binarios del host; el wasm lo produce rustc para `wasm32v1-none` y el resultado fue idéntico al desplegado.

## 4. Correcciones de Halborn presentes en el commit

El commit `6a87b7be9` es descendiente de las correcciones; se comprobó con `git merge-base --is-ancestor` para cada una y las seis devolvieron afirmativo:

```bash
for c in acccc24 6fac2db cd167b5 ad6c1d3 5dd1e14 3f44851; do
  git merge-base --is-ancestor "$c" 6a87b7be9 && echo "$c incluido"
done
```

| Hallazgo | Seguimiento | Commit corrector | Verificado en `6a87b7be9` |
|---|---|---|---|
| HAL-04 — ABI del resolver distinto entre `protocol` y `resolvers` | [#104](https://github.com/daccred/attestprotocol/issues/104) | [`acccc246`](https://github.com/daccred/attestprotocol/commit/acccc24629710e3c8cea57bb1a4375356384d19c) | Sí |
| HAL-05 — `attest_by_delegation` no validaba `expiration_time` | [#106](https://github.com/daccred/attestprotocol/issues/106) | [`6fac2db7`](https://github.com/daccred/attestprotocol/commit/6fac2db7d4975be86ac4cb3174d5d4e436ef8a34) | Sí |
| HAL-06 — firmas delegadas no ligadas a contrato y red | [#106](https://github.com/daccred/attestprotocol/issues/106) | [`cd167b53`](https://github.com/daccred/attestprotocol/commit/cd167b532ff6f976009f676026c41de132c5bb29) | Sí |
| HAL-07 — decodificación de puntos BLS podía capturar (*trap*) | [#106](https://github.com/daccred/attestprotocol/issues/106) | [`ad6c1d36`](https://github.com/daccred/attestprotocol/commit/ad6c1d369eb0cfc529663943f472d014abef5a0c) | Sí |
| HAL-08 — error engañoso al revocar una atestación ya revocada | [#106](https://github.com/daccred/attestprotocol/issues/106) | [`5dd1e141`](https://github.com/daccred/attestprotocol/commit/5dd1e141c4334811bfb002c08a84980fdff209b2) | Sí |
| HAL-09 — evento `attest/create` sin `schema_uid` | [#108](https://github.com/daccred/attestprotocol/issues/108) | [`3f448519`](https://github.com/daccred/attestprotocol/commit/3f448519f0548424854df356024b1c97bb1c0051) | Sí |

Los seis commits llegaron en el [PR #109](https://github.com/daccred/attestprotocol/pull/109), fusionado el 29 de abril de 2026 como `8c183ec3`. Los PR [#105](https://github.com/daccred/attestprotocol/pull/105) y [#107](https://github.com/daccred/attestprotocol/pull/107) estaban cerrados sin fusión y fueron absorbidos por #109; el [PR #110](https://github.com/daccred/attestprotocol/pull/110) cubre hallazgos internos adicionales (`FIND-*`) y también es ancestro de `6a87b7be9`. En `contracts/stellar/audit/` de ese commit hay informes de Scout y Almanax; el informe de Halborn no está ahí, por lo que el seguimiento de HAL-04 a HAL-09 se hace con los issues y commits enlazados.

## 5. Conclusión

**`matches`**: commit `6a87b7be9d8d438c73c74109dc0601a446f8ea1f`, Rust `1.97.1`, stellar CLI `27.1.0`, soroban-sdk `27.0.6`, target `wasm32v1-none`, comando `stellar contract build --package protocol`. El SHA-256 y el contenido byte por byte coinciden con el wasm de testnet, y el commit incluye HAL-04 a HAL-09.

Esto cumple la opción 2 de [ADR-005 D10.6](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md) (build reproducido desde un commit con las correcciones y resultado publicado). No sustituye la opción 1 (release verificado en StellarExpert), que sigue siendo la más limpia y se pide en [daccred/attestprotocol#130](https://github.com/daccred/attestprotocol/issues/130). Resultado compartido allí en el [comentario 7110635557](https://github.com/daccred/attestprotocol/issues/130#issuecomment-7110635557).
