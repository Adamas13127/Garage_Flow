/*
 * Ce fichier teste l'ecran de suivi des interventions mobile GarageFlow.
 * Il existe pour verifier que les cartes de suivi client affichent les reparations.
 * Il communique avec InterventionsScreen et interventionApi.ts mocke.
 */
import { render, screen } from '@testing-library/react-native';
import { getClientInterventions } from '../api/interventionApi';
import { InterventionsScreen } from './InterventionsScreen';

jest.mock('../api/interventionApi', () => ({ getClientInterventions: jest.fn() }));

const mockGetClientInterventions = getClientInterventions as jest.MockedFunction<typeof getClientInterventions>;
const navigation = { navigate: jest.fn() } as never;
const route = { key: 'InterventionsList', name: 'InterventionsList' } as never;

describe('InterventionsScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetClientInterventions.mockResolvedValue([{ id: 9, createdAt: '2026-07-01T10:00:00+02:00', statutActuel: { code: 'REPARATION_EN_COURS' }, garage: { id: 1, nom: 'Garage Central' }, vehicle: { id: 2, marque: 'Renault', modele: 'Clio' }, service: { id: 3, nom: 'Revision' } }]); });

  /** Ce test verifie que les informations de suivi sont visibles dans une carte compacte. */
  it('affiche les cartes de suivi intervention', async () => {
    render(<InterventionsScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('Renault Clio')).toBeTruthy();
    expect(screen.getByText('Garage Central')).toBeTruthy();
    expect(screen.getByText('Voir le suivi')).toBeTruthy();
  });
});
