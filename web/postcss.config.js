/*
 * Ce fichier configure PostCSS pour transformer Tailwind en CSS lisible par le navigateur.
 * Il existe pour brancher Tailwind CSS et Autoprefixer dans le build Vite.
 * Il communique avec Vite et le fichier src/styles.css.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};