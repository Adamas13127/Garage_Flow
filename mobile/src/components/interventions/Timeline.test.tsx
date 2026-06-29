/*
 * Ce fichier teste la timeline de suivi reparation GarageFlow mobile.
 * Il existe pour verifier que les etapes MVP sont bien affichees au client.
 * Il communique avec le composant Timeline.
 */
import { render, screen } from '@testing-library/react-native';
import { Timeline } from './Timeline';

describe('Timeline', () => {
  /** Ce test verifie que la timeline affiche les etapes du suivi reparation. */
  it('affiche les etapes du suivi reparation', () => {
    render(<Timeline steps={[{ code: 'VEHICULE_DEPOSE', label: 'Vehicule depose', state: 'done' }, { code: 'REPARATION_EN_COURS', label: 'Reparation en cours', state: 'current' }]} />);
    expect(screen.getByText('Vehicule depose')).toBeTruthy();
    expect(screen.getByText('Reparation en cours')).toBeTruthy();
  });
});