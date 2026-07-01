/*
 * Ce fichier teste l'ecran des rendez-vous client mobile GarageFlow.
 * Il existe pour verifier les filtres RDV, l'action detail et l'annulation.
 * Il communique avec AppointmentsScreen et appointmentApi.ts mocke.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { cancelAppointment, getClientAppointments } from '../api/appointmentApi';
import { AppointmentsScreen } from './AppointmentsScreen';

jest.mock('../api/appointmentApi', () => ({ cancelAppointment: jest.fn(), getClientAppointments: jest.fn() }));

const mockCancelAppointment = cancelAppointment as jest.MockedFunction<typeof cancelAppointment>;
const mockGetClientAppointments = getClientAppointments as jest.MockedFunction<typeof getClientAppointments>;
const navigation = { navigate: jest.fn() } as never;
const route = { key: 'AppointmentsList', name: 'AppointmentsList' } as never;

describe('AppointmentsScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  /** Ce rendez-vous mocke represente une demande encore annulable par le client. */
  const pendingAppointment = { id: 7, statut: 'EN_ATTENTE', dateDebut: '2030-07-01T10:00:00+02:00', garage: { id: 1, nom: 'Garage Central' }, service: { id: 2, nom: 'Revision' }, vehicle: { id: 3, marque: 'Renault', modele: 'Clio' } };

  /** Ce test verifie que les filtres RDV principaux sont visibles. */
  it('affiche les filtres de rendez-vous', async () => {
    mockGetClientAppointments.mockResolvedValue([pendingAppointment]);
    render(<AppointmentsScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('A venir')).toBeTruthy();
    expect(screen.getByText('En attente')).toBeTruthy();
    expect(screen.getByText('Passes')).toBeTruthy();
    expect(screen.getByText('Tous')).toBeTruthy();
  });

  /** Ce test verifie qu'un rendez-vous en attente affiche l'action d'annulation. */
  it('affiche le bouton annuler pour un rendez-vous en attente', async () => {
    mockGetClientAppointments.mockResolvedValue([pendingAppointment]);
    render(<AppointmentsScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('Annuler')).toBeTruthy();
  });

  /** Ce test verifie qu'un rendez-vous termine ne peut plus etre annule. */
  it('ne montre pas le bouton annuler pour un rendez-vous termine', async () => {
    mockGetClientAppointments.mockResolvedValue([{ ...pendingAppointment, id: 8, statut: 'TERMINE' }]);
    render(<AppointmentsScreen navigation={navigation} route={route} />);
    fireEvent.press(await screen.findByText('Tous'));
    await screen.findByText('Garage Central');
    expect(screen.queryByText('Annuler')).toBeNull();
  });

  /** Ce test verifie que l'action d'annulation appelle bien l'API. */
  it('appelle cancelAppointment', async () => {
    mockGetClientAppointments.mockResolvedValue([pendingAppointment]);
    mockCancelAppointment.mockResolvedValue({ ...pendingAppointment });
    render(<AppointmentsScreen navigation={navigation} route={route} />);
    fireEvent.press(await screen.findByText('Annuler'));
    await waitFor(() => expect(mockCancelAppointment).toHaveBeenCalledWith(7));
  });
});
