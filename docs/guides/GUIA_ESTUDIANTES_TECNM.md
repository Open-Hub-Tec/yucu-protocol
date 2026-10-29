# 📘 Manual de Vuelo: Conceptos y Comandos Clave para Estudiantes TecNM

Este manual rápido explica en lenguaje claro y directo los términos y herramientas que usamos a diario en **Yucu Protocol**.

---

## 🌟 1. Glosario Rápido: ¿De qué diablos hablamos en este proyecto?

### ¿Qué es Stellar?
Una red blockchain (como una gran libreta contable mundial compartida) diseñada para mover dinero en segundos por centavos de dólar. En vez de pagar comisiones bancarias del 7%, una transferencia cuesta fracciones de centavo.

### ¿Qué es Soroban?
El motor de **Smart Contracts** (contratos inteligentes) de Stellar. Está programado en **Rust**. Es código que se ejecuta en la blockchain y que nadie puede alterar ni apagar. Por ejemplo: *"Si el comprador deposita el dinero, no se lo entregues al vendedor hasta que el líder comunal y el oráculo confirmen que entregó la cosecha con calidad acordada"*.

### ¿Qué es una Atestación (*Attestation*)?
Es un **"sello o acta notarial digital"** firmado con criptografía: una persona o un grupo afirma algo ("este lote es de la Mixteca") y lo firma con su llave. En vez de un papel que se puede mojar o falsificar, queda en la blockchain y cualquiera lo puede verificar. En Yucu se guardan en **Attest Protocol** ([ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md)). La IA puede ayudar a llenarla a partir de la voz, pero **siempre la firma una persona**, nunca la IA ([ADR-007](../adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md)).

### ¿Qué es Attest Protocol?
El registro de atestaciones que ya existe en Stellar, auditado y en mainnet ([ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md), sección 1). Yucu **no** tiene uno propio: guarda sus atestaciones ahí y agrega encima un **índice** (listas de lo que se dice de un lote, de un emisor o de una cuenta) y sus **reglas** (quién puede emitir, el consentimiento de la artesana). Ver [ADR-005](../adr/ADR-005-INFRAESTRUCTURA-DE-ATESTACIONES.md).

### ¿Qué hace la IA en Yucu?
**La IA habla, la persona firma, la cadena prueba** ([ADR-007](../adr/ADR-007-MOTOR-DE-ATESTACIONES-POR-VOZ.md)). La persona habla o escribe en el chat, como en WhatsApp; la IA transcribe, entiende qué pide y llena un borrador; la app se lo lee en voz alta y ella confirma con su PIN. La IA **nunca** firma, nunca emite por su cuenta y nunca certifica. Si no entendió, lo dice. El mixteco (*Tu'un Savi*) todavía está en evaluación (#158). Los "oráculos" de `src/core/ai/` son demostraciones.

### ¿Qué es Trustless Work?
El escrow que usamos para la **compra protegida** (solo testnet): el comprador del extranjero paga en USDC desde su propia billetera, el dinero queda en un contrato y se libera a la cuenta de la artesana cuando el comprador confirma que recibió. Por defecto hay **un solo hito** (100 % al recibir); una plantilla "con adelanto" existe solo si las artesanas la necesitan. Yucu nunca guarda el dinero. Ver [ADR-004](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), D8.

### ¿Qué es MicoPay?
Una red de tiendas que entregan **efectivo**. La artesana va a la tienda, confirma con su PIN y recibe un QR que vale 15 minutos; si nadie lo cobra, el dinero regresa a su cuenta (#114).

### ¿Qué es Etherfuse?
Un proveedor que convierte a pesos y los manda por **SPEI** a una cuenta de banco con CLABE a nombre de la artesana. Pide CURP, RFC, INE y una selfie. Con la promotora, **la app revisa antes los datos en el teléfono** (#145) y el servidor los manda a Etherfuse **sin guardarlos**; a ella solo le queda tomarse la selfie en la página de Etherfuse (#146). Ver [ADR-004](../adr/ADR-004-PAGOS-EN-PESOS-SIN-BILLETERA.md), D9.

---

## 🏛️ Cómo se mueve el dinero
1. **Compradores en México:** pagan directo a la artesana en pesos. Solo el pasaporte del lote va a Stellar.
2. **Compradores del extranjero:** escrow de Trustless Work → la cuenta propia de la artesana.
3. **De su cuenta a pesos:** en efectivo (MicoPay) o al banco (Etherfuse), detrás de `PayoutPort`. Ella firma cada retiro; nadie retiene su dinero.

---

## 🛠️ 2. Comandos de Git "Salva-Vidas"

### ¿Cómo ver en qué rama estoy y qué archivos modifiqué?
```bash
git status
```

### ¿Cómo deshacer cambios en un archivo si me equivoqué y quiero volver a empezar?
```bash
git checkout nombre_del_archivo.tsx
```

### ¿Cómo sincronizar mi rama local con los últimos cambios de main?
```bash
git checkout main
git pull origin main
git checkout mi-rama
git merge main
```

### ¿Cómo ver las pruebas locales?
```bash
npm run test
```

### ¿Cómo verificar que no tengo errores de TypeScript?
```bash
npm run lint
```

---

## 💡 3. Consejos de Oro de los Profesores e Investigadores

1. **Haz cambios pequeños:** Es 10 veces mejor mandar un Pull Request que modifique 30 líneas de código y resuelva un problema concreto, que intentar mandar 2,000 líneas juntas.
2. **Siempre corre `npm run test` antes de hacer `git push`:** Si las pruebas pasan en tu máquina, pasarán en el servidor de GitHub Actions.
3. **No tengas miedo de preguntar:** En la cultura del código abierto no hay preguntas tontas. Todos aprendemos rompiendo código en local.
