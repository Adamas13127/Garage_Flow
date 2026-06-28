/*
 * Ce fichier configure Vite pour le frontend web GarageFlow.
 * Il existe pour brancher React et l'environnement de tests Vitest.
 * Il communique avec src/main.tsx, PostCSS/Tailwind et les tests du dossier src.
 */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/** Cette configuration active React et jsdom pour tester les composants. */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});