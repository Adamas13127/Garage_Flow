/*
 * Ce fichier teste l'ecran vehicules mobile GarageFlow.
 * Il existe pour verifier l'etat vide et l'ouverture volontaire du formulaire vehicule.
 * Il communique avec VehiclesScreen et vehicleApi.ts mocke.
 */
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createVehicle, deleteVehicle, getVehicles, updateVehicle } from '../api/vehicleApi';
import { VehiclesScreen } from './VehiclesScreen';

jest.mock('../api/vehicleApi', () => ({ createVehicle: jest.fn(), deleteVehicle: jest.fn(), getVehicles: jest.fn(), updateVehicle: jest.fn() }));

const mockCreateVehicle = createVehicle as jest.MockedFunction<typeof createVehicle>;
const mockDeleteVehicle = deleteVehicle as jest.MockedFunction<typeof deleteVehicle>;
const mockGetVehicles = getVehicles as jest.MockedFunction<typeof getVehicles>;
const mockUpdateVehicle = updateVehicle as jest.MockedFunction<typeof updateVehicle>;
const route = { key: 'Vehicles', name: 'Vehicles' } as never;

/** Ce mock de navigation capture le callback 'focus' pour simuler un retour sur l'ecran. */
function createNavigation() {
  const listeners: Record<string, () => void> = {};
  const navigation = { addListener: jest.fn((event: string, callback: () => void) => { listeners[event] = callback; return jest.fn(); }) };
  return { navigation: navigation as never, emitFocus: () => listeners.focus?.() };
}

describe('VehiclesScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetVehicles.mockResolvedValue([]); mockCreateVehicle.mockResolvedValue({ id: 1, marque: 'Renault', modele: 'Clio' }); mockUpdateVehicle.mockResolvedValue({ id: 1, marque: 'Renault', modele: 'Clio' }); mockDeleteVehicle.mockResolvedValue(undefined); });

  /** Ce test verifie que la page affiche un etat vide si aucun vehicule n'existe. */
  it('affiche l etat vide si aucun vehicule', async () => {
    const { navigation } = createNavigation();
    render(<VehiclesScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('Aucun vehicule')).toBeTruthy();
  });

  /** Ce test verifie que le formulaire n'est pas visible avant l'action ajouter. */
  it('cache puis ouvre le formulaire vehicule', async () => {
    const { navigation } = createNavigation();
    render(<VehiclesScreen navigation={navigation} route={route} />);
    await screen.findByText('Aucun vehicule');
    expect(screen.queryByLabelText('Marque')).toBeNull();
    fireEvent.press(screen.getByText('+ Ajouter un vehicule'));
    expect(screen.getByLabelText('Marque')).toBeTruthy();
  });

  /** Ce test verifie que la plaque vide bloque la creation cote UI. */
  it('refuse une plaque vide apres ouverture du formulaire', async () => {
    const { navigation } = createNavigation();
    render(<VehiclesScreen navigation={navigation} route={route} />);
    await screen.findByText('Aucun vehicule');
    fireEvent.press(screen.getByText('+ Ajouter un vehicule'));
    fireEvent.changeText(screen.getByLabelText('Marque'), 'Renault');
    fireEvent.changeText(screen.getByLabelText('Modele'), 'Clio');
    fireEvent.press(screen.getByText('Ajouter le vehicule'));
    expect(await screen.findByText('La plaque est obligatoire.')).toBeTruthy();
    expect(mockCreateVehicle).not.toHaveBeenCalled();
  });

  /** Ce test verifie que le retour sur l'ecran recharge les vehicules, sans le recharger au montage initial. */
  it('recharge les vehicules quand l ecran redevient visible', async () => {
    mockGetVehicles.mockResolvedValue([]);
    const { navigation, emitFocus } = createNavigation();
    render(<VehiclesScreen navigation={navigation} route={route} />);
    await screen.findByText('Aucun vehicule');
    expect(mockGetVehicles).toHaveBeenCalledTimes(1);

    mockGetVehicles.mockResolvedValue([{ id: 1, marque: 'Renault', modele: 'Clio' }]);
    act(() => emitFocus());
    expect(await screen.findByText('Renault Clio')).toBeTruthy();
    expect(mockGetVehicles).toHaveBeenCalledTimes(2);
  });
});
