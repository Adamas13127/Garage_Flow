/*
 * Ce fichier prepare l'environnement de tests mobile GarageFlow.
 * Il existe pour mocker les modules natifs simples pendant les tests Jest.
 * Il communique avec jest.config.js.
 */
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));