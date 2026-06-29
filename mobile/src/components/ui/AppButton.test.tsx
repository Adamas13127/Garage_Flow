/*
 * Ce fichier teste le bouton mobile GarageFlow.
 * Il existe pour verifier que le composant AppButton affiche son texte.
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
});