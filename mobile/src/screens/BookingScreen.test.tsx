/*
 * Ce fichier teste l'ecran de reservation mobile GarageFlow.
 * Il existe pour verifier la selection guidee de date, les creneaux lisibles et le contrat de creation rendez-vous.
 * Il communique avec BookingScreen et les API mobiles mockees.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { createAppointment } from '../api/appointmentApi';
import { getAvailableSlots } from '../api/garageApi';
import { getVehicles } from '../api/vehicleApi';
import { BookingScreen, buildDateChoices, groupSlotsByPeriod, normalizeAvailableSlots } from './BookingScreen';

jest.mock('../api/appointmentApi', () => ({ createAppointment: jest.fn() }));
jest.mock('../api/garageApi', () => ({ getAvailableSlots: jest.fn() }));
jest.mock('../api/vehicleApi', () => ({ getVehicles: jest.fn() }));

const mockCreateAppointment = createAppointment as jest.MockedFunction<typeof createAppointment>;
const mockGetAvailableSlots = getAvailableSlots as jest.MockedFunction<typeof getAvailableSlots>;
const mockGetVehicles = getVehicles as jest.MockedFunction<typeof getVehicles>;
const navigate = jest.fn();
const navigation = { getParent: jest.fn(() => ({ navigate })), goBack: jest.fn() } as never;
const route = { key: 'Booking', name: 'Booking', params: { garageId: 1, serviceId: 2, serviceName: 'Revision' } } as never;
const vehicle = { id: 3, marque: 'Renault', modele: 'Clio' };
const morningSlot = { dateDebut: '2026-07-01T09:00:00+02:00', dateFin: '2026-07-01T09:30:00+02:00' };
const afternoonSlot = { dateDebut: '2026-07-01T14:00:00+02:00', dateFin: '2026-07-01T14:30:00+02:00' };

describe('BookingScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetVehicles.mockResolvedValue([]); mockGetAvailableSlots.mockResolvedValue([]); mockCreateAppointment.mockResolvedValue({ id: 1, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T09:00:00+02:00' }); });

  /** Ce test verifie que la reservation exige un vehicule et ne montre pas de formulaire inutile. */
  it('affiche une aide si aucun vehicule n est disponible', async () => {
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Aucun vehicule');
    expect(screen.queryByText('Vehicule')).toBeNull();
    expect(screen.getByText('Ajouter un vehicule')).toBeTruthy();
    expect(mockCreateAppointment).not.toHaveBeenCalled();
  });

  /** Ce test verifie que le champ texte manuel de date a disparu. */
  it('n affiche plus de champ texte manuel de date', async () => {
    mockGetVehicles.mockResolvedValue([vehicle]);
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Renault Clio');
    expect(screen.queryByLabelText('Date')).toBeNull();
  });

  /** Ce test verifie que la liste de jours guide le client. */
  it('affiche une liste de jours cliquables', async () => {
    mockGetVehicles.mockResolvedValue([vehicle]);
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Renault Clio');
    expect(screen.getByText('Aujourd hui')).toBeTruthy();
    expect(screen.getByText('Demain')).toBeTruthy();
  });

  /** Ce test verifie que cliquer sur une date selectionne et charge cette date. */
  it('clique sur une date et charge ses creneaux', async () => {
    mockGetVehicles.mockResolvedValue([vehicle]);
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Renault Clio');
    fireEvent.press(screen.getByText('Demain'));
    const tomorrow = buildDateChoices()[1].date;
    await waitFor(() => expect(mockGetAvailableSlots).toHaveBeenCalledWith(1, 2, tomorrow));
  });

  /** Ce test verifie que le parsing ignore les identifiants numeriques et garde les dates API. */
  it('normalise les creneaux avec un format lisible', () => {
    const slots = normalizeAvailableSlots([{ id: 1, ...morningSlot }]);
    expect(slots).toEqual([{ dateDebut: morningSlot.dateDebut, endLabel: '09:30', label: '09:00 - 09:30', period: 'morning' }]);
  });

  /** Ce test verifie que les creneaux sont groupes par moment de journee. */
  it('groupe les creneaux matin et apres-midi', () => {
    const groups = groupSlotsByPeriod(normalizeAvailableSlots([morningSlot, afternoonSlot]));
    expect(groups.map((group) => group.title)).toEqual(['Matin', 'Apres-midi']);
  });

  /** Ce test verifie que les creneaux charges sont affiches sans date incoherente. */
  it('affiche les creneaux avec un format lisible a partir des donnees mockees', async () => {
    mockGetVehicles.mockResolvedValue([vehicle]);
    mockGetAvailableSlots.mockResolvedValue([morningSlot, afternoonSlot]);
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Renault Clio');
    expect(await screen.findByText('Matin')).toBeTruthy();
    expect(screen.getByText('Apres-midi')).toBeTruthy();
    expect(screen.getByText('09:00')).toBeTruthy();
    expect(screen.getByText('09:30')).toBeTruthy();
    expect(screen.queryByText('03/01/1 00:09')).toBeNull();
  });

  /** Ce test verifie le message specifique quand aujourd'hui n'a plus de creneau. */
  it('affiche un message clair si aucun creneau restant aujourd hui', async () => {
    mockGetVehicles.mockResolvedValue([vehicle]);
    mockGetAvailableSlots.mockResolvedValue([]);
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Renault Clio');
    expect(await screen.findByText('Aucun creneau restant aujourd hui.')).toBeTruthy();
    expect(screen.getByText('Essayez une autre date.')).toBeTruthy();
    expect(screen.getByText('Jour suivant')).toBeTruthy();
  });

  /** Ce test verifie le message generique quand une autre date n'a pas de creneau. */
  it('affiche un message clair si aucun creneau pour une autre date', async () => {
    mockGetVehicles.mockResolvedValue([vehicle]);
    mockGetAvailableSlots.mockResolvedValue([]);
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Renault Clio');
    fireEvent.press(screen.getByText('Demain'));
    expect(await screen.findByText('Aucun creneau disponible pour cette date.')).toBeTruthy();
  });

  /** Ce test verifie que le bouton final reste bloque tant que le formulaire est incomplet. */
  it('desactive le bouton confirmer tant que vehicule et creneau ne sont pas choisis', async () => {
    mockGetVehicles.mockResolvedValue([vehicle]);
    mockGetAvailableSlots.mockResolvedValue([morningSlot]);
    render(<BookingScreen navigation={navigation} route={route} />);
    await screen.findByText('Renault Clio');
    fireEvent.press(screen.getByText('Confirmer le rendez-vous'));
    expect(mockCreateAppointment).not.toHaveBeenCalled();
  });

  /** Ce test verifie que le mobile envoie dateDebut, attendu par le backend. */
  it('envoie a createAppointment une date de debut au bon format', async () => {
    mockGetVehicles.mockResolvedValue([vehicle]);
    mockGetAvailableSlots.mockResolvedValue([morningSlot]);
    render(<BookingScreen navigation={navigation} route={route} />);
    fireEvent.press(await screen.findByText('Renault Clio'));
    fireEvent.press(await screen.findByText('09:00'));
    fireEvent.press(screen.getByText('Confirmer le rendez-vous'));
    await waitFor(() => expect(mockCreateAppointment).toHaveBeenCalledWith({ garageId: 1, serviceId: 2, vehicleId: 3, dateDebut: morningSlot.dateDebut, commentaireClient: null }));
  });
});
