/*
 * Ce fichier teste l'ecran vehicules mobile GarageFlow.
 * Il existe pour verifier l'etat vide et l'ouverture volontaire du formulaire vehicule.
 * Il communique avec VehiclesScreen et vehicleApi.ts mocke.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { createVehicle, deleteVehicle, getVehicles, updateVehicle } from '../api/vehicleApi';
import { VehiclesScreen } from './VehiclesScreen';

jest.mock('../api/vehicleApi', () => ({ createVehicle: jest.fn(), deleteVehicle: jest.fn(), getVehicles: jest.fn(), updateVehicle: jest.fn() }));

const mockCreateVehicle = createVehicle as jest.MockedFunction<typeof createVehicle>;
const mockDeleteVehicle = deleteVehicle as jest.MockedFunction<typeof deleteVehicle>;
const mockGetVehicles = getVehicles as jest.MockedFunction<typeof getVehicles>;
const mockUpdateVehicle = updateVehicle as jest.MockedFunction<typeof updateVehicle>;

describe('VehiclesScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetVehicles.mockResolvedValue([]); mockCreateVehicle.mockResolvedValue({ id: 1, marque: 'Renault', modele: 'Clio' }); mockUpdateVehicle.mockResolvedValue({ id: 1, marque: 'Renault', modele: 'Clio' }); mockDeleteVehicle.mockResolvedValue(undefined); });

  /** Ce test verifie que la page affiche un etat vide si aucun vehicule n'existe. */
  it('affiche l etat vide si aucun vehicule', async () => {
    render(<VehiclesScreen />);
    expect(await screen.findByText('Aucun vehicule')).toBeTruthy();
  });

  /** Ce test verifie que le formulaire n'est pas visible avant l'action ajouter. */
  it('cache puis ouvre le formulaire vehicule', async () => {
    render(<VehiclesScreen />);
    await screen.findByText('Aucun vehicule');
    expect(screen.queryByLabelText('Marque')).toBeNull();
    fireEvent.press(screen.getByText('+ Ajouter un vehicule'));
    expect(screen.getByLabelText('Marque')).toBeTruthy();
  });

  /** Ce test verifie que la plaque vide bloque la creation cote UI. */
  it('refuse une plaque vide apres ouverture du formulaire', async () => {
    render(<VehiclesScreen />);
    await screen.findByText('Aucun vehicule');
    fireEvent.press(screen.getByText('+ Ajouter un vehicule'));
    fireEvent.changeText(screen.getByLabelText('Marque'), 'Renault');
    fireEvent.changeText(screen.getByLabelText('Modele'), 'Clio');
    fireEvent.press(screen.getByText('Ajouter le vehicule'));
    expect(await screen.findByText('La plaque est obligatoire.')).toBeTruthy();
    expect(mockCreateVehicle).not.toHaveBeenCalled();
  });
});
