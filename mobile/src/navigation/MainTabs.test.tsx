/*
 * Ce fichier teste la navigation principale mobile GarageFlow.
 * Il existe pour verifier que les cinq onglets visibles ont des labels et icones propres.
 * Il communique avec MainTabs sans appeler les API ni le backend.
 */
jest.mock('@expo/vector-icons', () => ({ Ionicons: require('react-native').Text }));

import { tabIconFor, visibleMainTabs } from './MainTabs';

describe('MainTabs', () => {
  /** Ce test verifie que la barre du bas garde les cinq entrees visibles attendues. */
  it('declare les cinq onglets visibles avec labels attendus', () => {
    expect(visibleMainTabs.map((tab) => tab.label)).toEqual(['Accueil', 'Garages', 'RDV', 'Suivi', 'Profil']);
  });

  /** Ce test verifie que chaque onglet visible utilise une vraie icone Ionicons. */
  it('associe des icones propres aux onglets visibles', () => {
    expect(tabIconFor('Home')).toBe('home-outline');
    expect(tabIconFor('Garages')).toBe('car-sport-outline');
    expect(tabIconFor('Appointments')).toBe('calendar-outline');
    expect(tabIconFor('Interventions')).toBe('construct-outline');
    expect(tabIconFor('Profile')).toBe('person-outline');
  });
});

