// ESLint de Yucu: solo las reglas fijas de AGENTS.md que se pueden revisar al escribir.
// El editor las marca al momento; el CI las revisa en `npm run lint`.
// Los casos que ya existían quedan en `eslint-suppressions.json` y se van quitando
// en sus issues (#109, #168…). Lo nuevo no puede agregar casos.
import tseslint from 'typescript-eslint';

const UI = ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}', 'src/App.tsx', 'src/main.tsx'];

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'contracts/**', 'public/**', '.investigacion_privada/**'] },
  {
    files: ['src/**/*.{ts,tsx}', 'server.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: { '@typescript-eslint': tseslint.plugin },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      // Estilo de AGENTS.md: sin `any` nuevos y sin `@ts-ignore`.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true, 'ts-nocheck': true, 'ts-expect-error': 'allow-with-description' }],
    },
  },
  {
    // Regla 4 de AGENTS.md: las pantallas solo hablan con los puertos de src/core/chain/.
    files: UI,
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          { name: '@stellar/stellar-sdk', message: 'Regla 4 de AGENTS.md: las pantallas no importan Stellar. Usa `chain` de src/core/chain.' },
          { name: '@google/genai', message: 'Regla 4 de AGENTS.md: las pantallas no llaman al proveedor de IA. Usa el puerto de IA.' },
        ],
        patterns: [
          { group: ['**/SimulatedChain', '**/SimulatedChain.ts'], message: 'Regla 4 de AGENTS.md: usa `chain` de src/core/chain, no SimulatedChain.' },
          { group: ['*trustless*', '**/*Trustless*', '**/*trustless*'], message: 'Regla 4 de AGENTS.md: Trustless Work va detrás de EscrowPort.' },
        ],
      }],
    },
  },
);
