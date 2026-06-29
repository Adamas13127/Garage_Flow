/*
 * Ce fichier teste l'ecran d'accueil mobile GarageFlow.
 * Il existe pour verifier que le nom du client connecte apparait.
 * Il communique avec HomeScreen et useAuth mocke.
 */
import { render, screen } from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';

jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { prenom: 'Yannis', nom: 'Semmache' } }) }));

describe('HomeScreen', () => {
  /** Ce test verifie que l'accueil personnalise le message avec l'utilisateur. */
  it('affiche le prenom et le nom mockes', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Bonjour Yannis Semmache')).toBeTruthy();
  });
});