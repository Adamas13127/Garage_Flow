/*
 * Ce fichier teste le bouton mobile GarageFlow.
 * Il existe pour verifier que le composant AppButton affiche son texte et ses variantes.
 * Il communique avec Testing Library React Native.
 */
import { render, screen } from '@testing-library/react-native';
import { AppButton } from './AppButton';

describe('AppButton', () => {
  /** Ce test verifie que le texte du bouton est visible. */
  it('affiche son texte', () => {
    render(<AppButton>Continuer</AppButton>);
    expect(screen.getByText('Continuer')).toBeTruthy();
  });

  /** Ce test verifie que la variante danger reste utilisable pour les actions sensibles. */
  it('affiche une action danger', () => {
    render(<AppButton variant="danger">Supprimer</AppButton>);
    expect(screen.getByText('Supprimer')).toBeTruthy();
  });
});