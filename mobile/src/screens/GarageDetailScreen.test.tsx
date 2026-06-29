/*
 * Ce fichier teste l'ecran detail garage mobile GarageFlow.
 * Il existe pour verifier que les prestations d'un garage sont affichees.
 * Il communique avec GarageDetailScreen et garageApi.ts mocke.
 */
import { render, screen } from '@testing-library/react-native';
import { getGarage, getGarageServices } from '../api/garageApi';
import { GarageDetailScreen } from './GarageDetailScreen';

jest.mock('../api/garageApi', () => ({ getGarage: jest.fn(), getGarageServices: jest.fn() }));

const mockGetGarage = getGarage as jest.MockedFunction<typeof getGarage>;
const mockGetGarageServices = getGarageServices as jest.MockedFunction<typeof getGarageServices>;
const navigation = { navigate: jest.fn() } as never;

describe('GarageDetailScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetGarage.mockResolvedValue({ id: 1, nom: 'Garage Central' }); mockGetGarageServices.mockResolvedValue([{ id: 2, nom: 'Revision', actif: true }]); });

  /** Ce test verifie que les prestations actives sont visibles. */
  it('affiche les prestations', async () => {
    render(<GarageDetailScreen navigation={navigation} route={{ key: 'GarageDetail', name: 'GarageDetail', params: { garageId: 1 } }} />);
    expect(await screen.findByText('Revision')).toBeTruthy();
  });
});