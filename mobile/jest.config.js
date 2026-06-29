/*
 * Ce fichier configure Jest pour les tests mobiles GarageFlow.
 * Il existe pour lancer les tests React Native avec le preset Expo.
 * Il communique avec les fichiers .test.tsx du dossier src.
 */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: ['**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo|@expo|expo-modules-core|@react-navigation|react-native-safe-area-context|react-native-screens)/)',
  ],
};