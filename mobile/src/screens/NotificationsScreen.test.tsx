/*
 * Ce fichier teste l'ecran notifications mobile GarageFlow.
 * Il existe pour verifier le filtre non lues et l'action marquer comme lue.
 * Il communique avec NotificationsScreen et notificationApi.ts mocke.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { getNotifications, getUnreadNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../api/notificationApi';
import { NotificationsScreen } from './NotificationsScreen';

jest.mock('../api/notificationApi', () => ({ getNotifications: jest.fn(), getUnreadNotifications: jest.fn(), markAllNotificationsAsRead: jest.fn(), markNotificationAsRead: jest.fn() }));

const mockGetNotifications = getNotifications as jest.MockedFunction<typeof getNotifications>;
const mockGetUnreadNotifications = getUnreadNotifications as jest.MockedFunction<typeof getUnreadNotifications>;
const mockMarkAllNotificationsAsRead = markAllNotificationsAsRead as jest.MockedFunction<typeof markAllNotificationsAsRead>;
const mockMarkNotificationAsRead = markNotificationAsRead as jest.MockedFunction<typeof markNotificationAsRead>;
const unreadNotification = { id: 5, type: 'RENDEZ_VOUS', titre: 'Rendez-vous', contenu: 'Votre rendez-vous est confirme', lu: false, createdAt: '2026-07-01T10:00:00+02:00', appointmentId: 7 };
const route = { key: 'Notifications', name: 'Notifications' } as never;

/** Ce mock de navigation capture le callback 'focus' pour simuler un retour sur l'ecran. */
function createNavigation() {
  const listeners: Record<string, () => void> = {};
  const navigation = { addListener: jest.fn((event: string, callback: () => void) => { listeners[event] = callback; return jest.fn(); }) };
  return { navigation: navigation as never, emitFocus: () => listeners.focus?.() };
}

describe('NotificationsScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetNotifications.mockResolvedValue([unreadNotification]); mockGetUnreadNotifications.mockResolvedValue([unreadNotification]); mockMarkNotificationAsRead.mockResolvedValue({ ...unreadNotification, lu: true }); mockMarkAllNotificationsAsRead.mockResolvedValue({ success: true }); });

  /** Ce test verifie que le filtre non lues est visible et utilisable. */
  it('affiche le filtre non lues', async () => {
    const { navigation } = createNavigation();
    render(<NotificationsScreen navigation={navigation} route={route} />);
    expect(await screen.findByText('Non lues')).toBeTruthy();
  });

  /** Ce test verifie que le clic appelle l'API pour marquer une notification comme lue. */
  it('appelle markNotificationAsRead au clic', async () => {
    const { navigation } = createNavigation();
    render(<NotificationsScreen navigation={navigation} route={route} />);
    fireEvent.press(await screen.findByText('Marquer comme lue'));
    await waitFor(() => expect(mockMarkNotificationAsRead).toHaveBeenCalledWith(5));
  });

  /** Ce test verifie que le retour sur l'ecran recharge les notifications, sans le recharger au montage initial. */
  it('recharge les notifications quand l ecran redevient visible', async () => {
    const { navigation, emitFocus } = createNavigation();
    render(<NotificationsScreen navigation={navigation} route={route} />);
    await screen.findByText('Votre rendez-vous est confirme');
    expect(mockGetNotifications).toHaveBeenCalledTimes(1);

    mockGetNotifications.mockResolvedValue([{ ...unreadNotification, id: 6, contenu: 'Nouvelle alerte garage' }]);
    act(() => emitFocus());
    expect(await screen.findByText('Nouvelle alerte garage')).toBeTruthy();
    expect(mockGetNotifications).toHaveBeenCalledTimes(2);
  });
});