/*
 * Ce fichier teste l'ecran detail intervention mobile GarageFlow.
 * Il existe pour verifier le statut de suivi et l'absence de notes internes cote client.
 * Il communique avec InterventionDetailScreen et interventionApi.ts mocke.
 */
import { render, screen } from '@testing-library/react-native';
import { getClientIntervention } from '../api/interventionApi';
import { InterventionDetailScreen } from './InterventionDetailScreen';

jest.mock('../api/interventionApi', () => ({ getClientIntervention: jest.fn() }));

const mockGetClientIntervention = getClientIntervention as jest.MockedFunction<typeof getClientIntervention>;
const navigation = {} as never;
const route = { key: 'InterventionDetail', name: 'InterventionDetail', params: { interventionId: 9 } } as never;
const intervention = { id: 9, createdAt: '2026-07-01T10:00:00+02:00', statutActuel: { code: 'REPARATION_EN_COURS', libelle: 'Reparation en cours' }, notesInternes: 'Note interne confidentielle', garage: { id: 1, nom: 'Garage Central' }, vehicle: { id: 2, marque: 'Peugeot', modele: '208' }, service: { id: 3, nom: 'Freinage' } };

describe('InterventionDetailScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetClientIntervention.mockResolvedValue(intervention); });

  /** Ce test verifie que le statut actuel est visible dans le suivi. */
  it('affiche le statut actuel', async () => {
    render(<InterventionDetailScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('reparation en cours')).toBeTruthy();
  });

  /** Ce test verifie que les notes internes garage restent cachees au client. */
  it('n affiche jamais de note interne', async () => {
    render(<InterventionDetailScreen navigation={navigation} route={route} />);
    await screen.findByText('Peugeot 208');
    expect(screen.queryByText('Note interne confidentielle')).toBeNull();
  });
});