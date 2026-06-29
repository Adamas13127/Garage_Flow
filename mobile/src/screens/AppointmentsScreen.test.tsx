/*
 * Ce fichier teste l'ecran des rendez-vous client mobile GarageFlow.
 * Il existe pour verifier l'affichage du bouton annuler et l'appel API apres confirmation.
 * Il communique avec AppointmentsScreen, AppointmentCard et appointmentApi.ts mocke.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { cancelAppointment, getClientAppointments } from '../api/appointmentApi';
import { AppointmentsScreen } from './AppointmentsScreen';

jest.mock('../api/appointmentApi', () => ({ cancelAppointment: jest.fn(), getClientAppointments: jest.fn() }));

const mockCancelAppointment = cancelAppointment as jest.MockedFunction<typeof cancelAppointment>;
const mockGetClientAppointments = getClientAppointments as jest.MockedFunction<typeof getClientAppointments>;

describe('AppointmentsScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  /** Ce rendez-vous mocke represente une demande encore annulable par le client. */
  const pendingAppointment = { id: 7, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T10:00:00+02:00', garage: { id: 1, nom: 'Garage Central' }, service: { id: 2, nom: 'Revision' }, vehicle: { id: 3, marque: 'Renault', modele: 'Clio' } };

  /** Ce test verifie qu'un rendez-vous en attente affiche l'action d'annulation. */
  it('affiche le bouton annuler pour un rendez-vous en attente', async () => {
    mockGetClientAppointments.mockResolvedValue([pendingAppointment]);
    render(<AppointmentsScreen />);
    expect(await screen.findByText('Annuler')).toBeTruthy();
  });

  /** Ce test verifie qu'un rendez-vous termine ne peut plus etre annule. */
  it('ne montre pas le bouton annuler pour un rendez-vous termine', async () => {
    mockGetClientAppointments.mockResolvedValue([{ ...pendingAppointment, id: 8, statut: 'TERMINE' }]);
    render(<AppointmentsScreen />);
    await screen.findByText('Garage Central');
    expect(screen.queryByText('Annuler')).toBeNull();
  });

  /** Ce test verifie que la confirmation declenche bien l'appel API d'annulation. */
  it('appelle cancelAppointment apres confirmation', async () => {
    mockGetClientAppointments.mockResolvedValue([pendingAppointment]);
    mockCancelAppointment.mockResolvedValue({ ...pendingAppointment });
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => { buttons?.[1]?.onPress?.(); });
    render(<AppointmentsScreen />);
    fireEvent.press(await screen.findByText('Annuler'));
    await waitFor(() => expect(mockCancelAppointment).toHaveBeenCalledWith(7));
  });
});