/*
 * Ce fichier teste l'ecran de reservation mobile GarageFlow.
 * Il existe pour verifier que le client ne peut pas reserver sans vehicule choisi.
 * Il communique avec BookingScreen et les API mobiles mockees.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { createAppointment } from '../api/appointmentApi';
import { getAvailableSlots } from '../api/garageApi';
import { getVehicles } from '../api/vehicleApi';
import { BookingScreen } from './BookingScreen';

jest.mock('../api/appointmentApi', () => ({ createAppointment: jest.fn() }));
jest.mock('../api/garageApi', () => ({ getAvailableSlots: jest.fn() }));
jest.mock('../api/vehicleApi', () => ({ getVehicles: jest.fn() }));

const mockCreateAppointment = createAppointment as jest.MockedFunction<typeof createAppointment>;
const mockGetAvailableSlots = getAvailableSlots as jest.MockedFunction<typeof getAvailableSlots>;
const mockGetVehicles = getVehicles as jest.MockedFunction<typeof getVehicles>;
const navigation = { getParent: jest.fn(() => ({ navigate: jest.fn() })) } as never;
const route = { key: 'Booking', name: 'Booking', params: { garageId: 1, serviceId: 2, serviceName: 'Revision' } } as never;

describe('BookingScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetVehicles.mockResolvedValue([]); mockGetAvailableSlots.mockResolvedValue([]); mockCreateAppointment.mockResolvedValue({ id: 1, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T10:00:00+02:00' }); });

  /** Ce test verifie que la reservation exige un vehicule avant l'appel API. */
  it('affiche une erreur si aucun vehicule n est selectionne', async () => {
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Aucun vehicule');
    fireEvent.press(screen.getByText('Creer la demande'));
    expect(await screen.findByText('Veuillez selectionner un vehicule.')).toBeTruthy();
    expect(mockCreateAppointment).not.toHaveBeenCalled();
  });
});