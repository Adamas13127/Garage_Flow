/*
 * Ce fichier configure Babel pour Expo.
 * Il existe pour transformer le code React Native pendant le developpement et les tests.
 * Il communique avec Expo, Metro et Jest.
 */
module.exports = function configureBabel(api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};