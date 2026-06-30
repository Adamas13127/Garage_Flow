/*
 * Ce fichier teste l'ecran de reservation mobile GarageFlow.
 * Il existe pour verifier les creneaux lisibles et le contrat de creation rendez-vous.
 * Il communique avec BookingScreen et les API mobiles mockees.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { createAppointment } from '../api/appointmentApi';
import { getAvailableSlots } from '../api/garageApi';
import { getVehicles } from '../api/vehicleApi';
import { BookingScreen, normalizeAvailableSlots } from './BookingScreen';

jest.mock('../api/appointmentApi', () => ({ createAppointment: jest.fn() }));
jest.mock('../api/garageApi', () => ({ getAvailableSlots: jest.fn() }));
jest.mock('../api/vehicleApi', () => ({ getVehicles: jest.fn() }));

const mockCreateAppointment = createAppointment as jest.MockedFunction<typeof createAppointment>;
const mockGetAvailableSlots = getAvailableSlots as jest.MockedFunction<typeof getAvailableSlots>;
const mockGetVehicles = getVehicles as jest.MockedFunction<typeof getVehicles>;
const navigate = jest.fn();
const navigation = { getParent: jest.fn(() => ({ navigate })), goBack: jest.fn() } as never;
const route = { key: 'Booking', name: 'Booking', params: { garageId: 1, serviceId: 2, serviceName: 'Revision' } } as never;

describe('BookingScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetVehicles.mockResolvedValue([]); mockGetAvailableSlots.mockResolvedValue([]); mockCreateAppointment.mockResolvedValue({ id: 1, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T09:00:00+02:00' }); });

  /** Ce test verifie que la reservation exige un vehicule avant l'appel API. */
  it('affiche une erreur si aucun vehicule n est selectionne', async () => {
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Aucun vehicule');
    expect(screen.queryByText('Vehicule')).toBeNull();
    expect(mockCreateAppointment).not.toHaveBeenCalled();
  });

  /** Ce test verifie que le parsing ignore les identifiants numeriques et garde les dates API. */
  it('normalise les creneaux avec un format lisible', () => {
    const slots = normalizeAvailableSlots([{ id: 1, dateDebut: '2026-07-01T09:00:00+02:00', dateFin: '2026-07-01T09:30:00+02:00' }]);
    expect(slots).toEqual([{ dateDebut: '2026-07-01T09:00:00+02:00', label: '09:00 - 09:30' }]);
  });

  /** Ce test verifie que les creneaux charges sont affiches sans date incoherente. */
  it('affiche les creneaux avec un format lisible a partir des donnees mockees', async () => {
    mockGetVehicles.mockResolvedValue([{ id: 3, marque: 'Renault', modele: 'Clio' }]);
    mockGetAvailableSlots.mockResolvedValue([{ dateDebut: '2026-07-01T09:00:00+02:00', dateFin: '2026-07-01T09:30:00+02:00' }]);
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Renault Clio');
    fireEvent.press(screen.getByText('Charger les creneaux'));
    expect(await screen.findByText('09:00 - 09:30')).toBeTruthy();
    expect(screen.queryByText('03/01/1 00:09')).toBeNull();
  });

  /** Ce test verifie que le mobile envoie dateDebut, attendu par le backend. */
  it('envoie a createAppointment une date de debut au bon format', async () => {
    mockGetVehicles.mockResolvedValue([{ id: 3, marque: 'Renault', modele: 'Clio' }]);
    mockGetAvailableSlots.mockResolvedValue([{ dateDebut: '2026-07-01T09:00:00+02:00', dateFin: '2026-07-01T09:30:00+02:00' }]);
    render(<BookingScreen navigation={navigation} route={route} />);
    fireEvent.press(await screen.findByText('Renault Clio'));
    fireEvent.press(screen.getByText('Charger les creneaux'));
    fireEvent.press(await screen.findByText('09:00 - 09:30'));
    fireEvent.press(screen.getByText('Confirmer RDV'));
    await waitFor(() => expect(mockCreateAppointment).toHaveBeenCalledWith({ garageId: 1, serviceId: 2, vehicleId: 3, dateDebut: '2026-07-01T09:00:00+02:00', commentaireClient: null }));
  });

  /** Ce test verifie que l'absence de disponibilite donne un message clair. */
  it('affiche une erreur claire si aucun creneau', async () => {
    mockGetVehicles.mockResolvedValue([{ id: 3, marque: 'Renault', modele: 'Clio' }]);
    mockGetAvailableSlots.mockResolvedValue([]);
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Renault Clio');
    fireEvent.press(screen.getByText('Charger les creneaux'));
    expect(await screen.findByText('Aucun creneau disponible pour cette date.')).toBeTruthy();
  });
});
