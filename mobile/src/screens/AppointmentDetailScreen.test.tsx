/*
 * Ce fichier teste l'ecran detail rendez-vous mobile GarageFlow.
 * Il existe pour verifier les informations affichees et les droits d'annulation selon le statut.
 * Il communique avec AppointmentDetailScreen et appointmentApi.ts mocke.
 */
import { render, screen } from '@testing-library/react-native';
import { getClientAppointment, cancelAppointment } from '../api/appointmentApi';
import { AppointmentDetailScreen } from './AppointmentDetailScreen';

jest.mock('../api/appointmentApi', () => ({ cancelAppointment: jest.fn(), getClientAppointment: jest.fn() }));

const mockGetClientAppointment = getClientAppointment as jest.MockedFunction<typeof getClientAppointment>;
const mockCancelAppointment = cancelAppointment as jest.MockedFunction<typeof cancelAppointment>;
const navigation = {} as never;
const route = { key: 'AppointmentDetail', name: 'AppointmentDetail', params: { appointmentId: 7 } } as never;
const appointment = { id: 7, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T10:00:00+02:00', commentaireClient: 'Controle avant depart', createdAt: '2026-06-30T09:00:00+02:00', garage: { id: 1, nom: 'Garage Central', adresse: '1 rue Test' }, service: { id: 2, nom: 'Revision' }, vehicle: { id: 3, marque: 'Renault', modele: 'Clio' } };

describe('AppointmentDetailScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockCancelAppointment.mockResolvedValue(appointment); });

  /** Ce test verifie que le detail affiche les informations principales du rendez-vous. */
  it('affiche les informations d un rendez-vous mocke', async () => {
    mockGetClientAppointment.mockResolvedValue(appointment);
    render(<AppointmentDetailScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('Garage Central')).toBeTruthy();
    expect(screen.getByText('Renault Clio')).toBeTruthy();
    expect(screen.getByText('Revision')).toBeTruthy();
  });

  /** Ce test verifie qu'un rendez-vous en attente peut etre annule. */
  it('affiche le bouton annuler pour EN_ATTENTE', async () => {
    mockGetClientAppointment.mockResolvedValue(appointment);
    render(<AppointmentDetailScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('Annuler le rendez-vous')).toBeTruthy();
  });

  /** Ce test verifie qu'un rendez-vous termine ne montre plus l'action annuler. */
  it('n affiche pas annuler pour TERMINE', async () => {
    mockGetClientAppointment.mockResolvedValue({ ...appointment, statut: 'TERMINE' });
    render(<AppointmentDetailScreen navigation={navigation} route={route} />);
    await screen.findByText('Garage Central');
    expect(screen.queryByText('Annuler le rendez-vous')).toBeNull();
  });
});