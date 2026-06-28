/*
 * Ce fichier indique a Tailwind ou trouver les classes utilisees par GarageFlow.
 * Il existe pour generer uniquement les styles utiles au frontend web.
 * Il communique avec les composants React et le fichier src/styles.css.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};