/*
 * Ce fichier configure ESLint pour le projet mobile GarageFlow.
 * Il existe pour verifier les erreurs TypeScript et React Native simples.
 * Il communique avec les fichiers TypeScript et TSX du dossier mobile.
 */
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  { ignores: ['node_modules/', '.expo/', 'dist/', 'build/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        __DEV__: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        fetch: 'readonly',
        Headers: 'readonly',
        module: 'readonly',
        require: 'readonly',
        RequestInit: 'readonly',
        BodyInit: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);