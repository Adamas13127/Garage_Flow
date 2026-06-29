/*
 * Ce fichier teste l'ecran d'accueil mobile GarageFlow.
 * Il existe pour verifier le message client et les compteurs du resume.
 * Il communique avec HomeScreen, useAuth et les API mobiles mockees.
 */
import { render, screen } from '@testing-library/react-native';
import { getClientAppointments } from '../api/appointmentApi';
import { getClientInterventions } from '../api/interventionApi';
import { getUnreadNotifications } from '../api/notificationApi';
import { getVehicles } from '../api/vehicleApi';
import { HomeScreen } from './HomeScreen';

jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { prenom: 'Yannis', nom: 'Semmache' } }) }));
jest.mock('../api/appointmentApi', () => ({ getClientAppointments: jest.fn() }));
jest.mock('../api/interventionApi', () => ({ getClientInterventions: jest.fn() }));
jest.mock('../api/notificationApi', () => ({ getUnreadNotifications: jest.fn() }));
jest.mock('../api/vehicleApi', () => ({ getVehicles: jest.fn() }));

const mockGetAppointments = getClientAppointments as jest.MockedFunction<typeof getClientAppointments>;
const mockGetInterventions = getClientInterventions as jest.MockedFunction<typeof getClientInterventions>;
const mockGetUnreadNotifications = getUnreadNotifications as jest.MockedFunction<typeof getUnreadNotifications>;
const mockGetVehicles = getVehicles as jest.MockedFunction<typeof getVehicles>;
const navigation = { navigate: jest.fn() } as never;
const route = { key: 'Home', name: 'Home' } as never;

describe('HomeScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetVehicles.mockResolvedValue([{ id: 1, marque: 'Renault', modele: 'Clio' }]); mockGetAppointments.mockResolvedValue([{ id: 2, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T10:00:00+02:00' }]); mockGetInterventions.mockResolvedValue([{ id: 3, statutActuel: { code: 'REPARATION_EN_COURS' } }]); mockGetUnreadNotifications.mockResolvedValue([{ id: 4, type: 'INFO', contenu: 'Message', lu: false, createdAt: '2026-07-01T10:00:00+02:00' }]); });

  /** Ce test verifie que l'accueil personnalise le message avec l'utilisateur. */
  it('affiche le prenom et le nom mockes', async () => {
    render(<HomeScreen navigation={navigation} route={route} />);
    expect(screen.getByText('Bonjour Yannis Semmache')).toBeTruthy();
    expect(await screen.findByText('Vehicules')).toBeTruthy();
  });

  /** Ce test verifie que les compteurs du resume viennent des API mockees. */
  it('affiche les compteurs mockes', async () => {
    render(<HomeScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('A venir ou en attente')).toBeTruthy();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(4);
  });
});