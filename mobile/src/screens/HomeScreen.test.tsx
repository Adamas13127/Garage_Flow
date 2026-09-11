/*
 * Ce fichier teste l'ecran d'accueil mobile GarageFlow.
 * Il existe pour verifier le message client, les categories et les actions rapides.
 * Il communique avec HomeScreen, useAuth et les API mobiles mockees.
 */
import { act, render, screen } from '@testing-library/react-native';
import { getClientAppointments } from '../api/appointmentApi';
import { getGarages } from '../api/garageApi';
import { getClientInterventions } from '../api/interventionApi';
import { getUnreadNotifications } from '../api/notificationApi';
import { getVehicles } from '../api/vehicleApi';
import { HomeScreen } from './HomeScreen';

jest.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { prenom: 'Yannis', nom: 'Semmache' } }) }));
jest.mock('../api/appointmentApi', () => ({ getClientAppointments: jest.fn() }));
jest.mock('../api/garageApi', () => ({ getGarages: jest.fn() }));
jest.mock('../api/interventionApi', () => ({ getClientInterventions: jest.fn() }));
jest.mock('../api/notificationApi', () => ({ getUnreadNotifications: jest.fn() }));
jest.mock('../api/vehicleApi', () => ({ getVehicles: jest.fn() }));

const mockGetAppointments = getClientAppointments as jest.MockedFunction<typeof getClientAppointments>;
const mockGetGarages = getGarages as jest.MockedFunction<typeof getGarages>;
const mockGetInterventions = getClientInterventions as jest.MockedFunction<typeof getClientInterventions>;
const mockGetUnreadNotifications = getUnreadNotifications as jest.MockedFunction<typeof getUnreadNotifications>;
const mockGetVehicles = getVehicles as jest.MockedFunction<typeof getVehicles>;
const route = { key: 'Home', name: 'Home' } as never;

/** Ce mock de navigation capture le callback 'focus' pour simuler un retour sur l'ecran. */
function createNavigation() {
  const listeners: Record<string, () => void> = {};
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn((event: string, callback: () => void) => { listeners[event] = callback; return jest.fn(); }),
  };
  return { navigation: navigation as never, emitFocus: () => listeners.focus?.() };
}

describe('HomeScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetVehicles.mockResolvedValue([{ id: 1, marque: 'Renault', modele: 'Clio' }]); mockGetAppointments.mockResolvedValue([{ id: 2, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T10:00:00+02:00' }]); mockGetInterventions.mockResolvedValue([{ id: 3, statutActuel: { code: 'REPARATION_EN_COURS' } }]); mockGetUnreadNotifications.mockResolvedValue([{ id: 4, type: 'INFO', contenu: 'Message', lu: false, createdAt: '2026-07-01T10:00:00+02:00' }]); mockGetGarages.mockResolvedValue([{ id: 5, nom: 'Garage Central', ville: 'Paris' }]); });

  /** Ce test verifie que l'accueil personnalise le message avec l'utilisateur. */
  it('affiche le prenom mocke et les actions rapides', async () => {
    const { navigation } = createNavigation();
    render(<HomeScreen navigation={navigation} route={route} />);
    expect(screen.getByText('Bonjour Yannis')).toBeTruthy();
    expect(screen.getByText('Prendre rendez-vous')).toBeTruthy();
    expect(await screen.findByText('Vehicules')).toBeTruthy();
  });

  /** Ce test verifie que les categories de services sont visibles sur l'accueil. */
  it('affiche les categories de services', async () => {
    const { navigation } = createNavigation();
    render(<HomeScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('Entretien')).toBeTruthy();
    expect(screen.getByText('Vidange')).toBeTruthy();
    expect(screen.getByText('Diagnostic')).toBeTruthy();
  });

  /** Ce test verifie que le retour sur l'accueil recalcule les compteurs, sans le recharger au montage initial. */
  it('recalcule les compteurs quand l ecran redevient visible', async () => {
    const { navigation, emitFocus } = createNavigation();
    render(<HomeScreen navigation={navigation} route={route} />);
    await screen.findByText('Vehicules');
    expect(mockGetVehicles).toHaveBeenCalledTimes(1);

    mockGetVehicles.mockResolvedValue([{ id: 1, marque: 'Renault', modele: 'Clio' }, { id: 2, marque: 'Peugeot', modele: '208' }]);
    act(() => emitFocus());
    await screen.findByText('2');
    expect(mockGetVehicles).toHaveBeenCalledTimes(2);
  });
});
