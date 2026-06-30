/*
 * Ce fichier teste l'ecran profil mobile GarageFlow.
 * Il existe pour verifier les acces personnels vehicules, notifications et deconnexion.
 * Il communique avec ProfileScreen et useAuth mocke.
 */
import { render, screen } from '@testing-library/react-native';
import { ProfileScreen } from './ProfileScreen';

const mockLogout = jest.fn();
jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ logout: mockLogout, user: { prenom: 'Yannis', nom: 'Semmache', email: 'yannis@example.test', telephone: '0102030405' } }) }));

const navigation = { navigate: jest.fn() } as never;
const route = { key: 'Profile', name: 'Profile' } as never;

describe('ProfileScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  /** Ce test verifie que le profil expose les raccourcis attendus. */
  it('affiche les acces vehicules notifications et deconnexion', () => {
    render(<ProfileScreen navigation={navigation} route={route} />);
    expect(screen.getByText('Yannis Semmache')).toBeTruthy();
    expect(screen.getByText('Mes vehicules')).toBeTruthy();
    expect(screen.getAllByText('Notifications').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Se deconnecter')).toBeTruthy();
  });
});
