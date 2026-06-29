/*
 * Ce fichier teste l'etat vide mobile GarageFlow.
 * Il existe pour verifier que le message utilisateur reste visible.
 * Il communique avec Testing Library React Native.
 */
import { render, screen } from '@testing-library/react-native';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  /** Ce test verifie que le titre et le message sont affiches. */
  it('affiche son message', () => {
    render(<EmptyState title="Aucune donnee" message="Revenez plus tard." />);
    expect(screen.getByText('Aucune donnee')).toBeTruthy();
    expect(screen.getByText('Revenez plus tard.')).toBeTruthy();
  });
});