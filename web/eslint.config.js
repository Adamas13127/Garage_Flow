/*
 * Ce fichier configure ESLint pour le frontend web GarageFlow.
 * Il existe pour detecter les erreurs TypeScript et React avant le build.
 * Il communique avec les fichiers src et les plugins React Hooks et React Refresh.
 */
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/** Cette configuration garde un lint simple et adapte a Vite React TypeScript. */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.npm-cache'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);