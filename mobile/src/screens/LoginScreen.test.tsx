/*
 * Ce fichier teste l'ecran de connexion mobile GarageFlow.
 * Il existe pour verifier que les champs email et mot de passe sont visibles.
 * Il communique avec LoginScreen et useAuth mocke.
 */
import { render, screen } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';

jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ login: jest.fn() }) }));

const navigation = { navigate: jest.fn() } as never;

describe('LoginScreen', () => {
  /** Ce test verifie que le formulaire de connexion est present. */
  it('affiche les champs email et mot de passe', () => {
    render(<LoginScreen navigation={navigation} route={{ key: 'Login', name: 'Login' }} />);
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Mot de passe')).toBeTruthy();
  });
});