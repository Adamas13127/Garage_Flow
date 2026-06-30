/*
 * Ce fichier teste l'ecran garages mobile GarageFlow.
 * Il existe pour verifier que la marketplace garages affiche categories et cartes.
 * Il communique avec GaragesScreen et garageApi.ts mocke.
 */
import { render, screen } from '@testing-library/react-native';
import { getGarages } from '../api/garageApi';
import { GaragesScreen } from './GaragesScreen';

jest.mock('../api/garageApi', () => ({ getGarages: jest.fn() }));

const mockGetGarages = getGarages as jest.MockedFunction<typeof getGarages>;
const navigation = { navigate: jest.fn() } as never;

describe('GaragesScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetGarages.mockResolvedValue([{ id: 1, nom: 'Garage Central', ville: 'Paris', adresse: '1 rue Test', telephone: '0102030405', description: 'Garage de proximite' }]); });

  /** Ce test verifie que les garages renvoyes par l'API mockee sont visibles. */
  it('affiche une liste de garages mockee', async () => {
    render(<GaragesScreen navigation={navigation} route={{ key: 'GaragesList', name: 'GaragesList' }} />);
    expect(await screen.findByText('Garage Central')).toBeTruthy();
    expect(screen.getByText('Voir les prestations')).toBeTruthy();
  });

  /** Ce test verifie que les categories et filtres marketplace sont visibles. */
  it('affiche les categories de services et filtres', async () => {
    render(<GaragesScreen navigation={navigation} route={{ key: 'GaragesList', name: 'GaragesList' }} />);
    expect((await screen.findAllByText('Entretien')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Freins').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Ouverts')).toBeTruthy();
  });
});

