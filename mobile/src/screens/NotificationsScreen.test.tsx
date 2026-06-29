/*
 * Ce fichier teste l'ecran notifications mobile GarageFlow.
 * Il existe pour verifier le filtre non lues et l'action marquer comme lue.
 * Il communique avec NotificationsScreen et notificationApi.ts mocke.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { getNotifications, getUnreadNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../api/notificationApi';
import { NotificationsScreen } from './NotificationsScreen';

jest.mock('../api/notificationApi', () => ({ getNotifications: jest.fn(), getUnreadNotifications: jest.fn(), markAllNotificationsAsRead: jest.fn(), markNotificationAsRead: jest.fn() }));

const mockGetNotifications = getNotifications as jest.MockedFunction<typeof getNotifications>;
const mockGetUnreadNotifications = getUnreadNotifications as jest.MockedFunction<typeof getUnreadNotifications>;
const mockMarkAllNotificationsAsRead = markAllNotificationsAsRead as jest.MockedFunction<typeof markAllNotificationsAsRead>;
const mockMarkNotificationAsRead = markNotificationAsRead as jest.MockedFunction<typeof markNotificationAsRead>;
const unreadNotification = { id: 5, type: 'RENDEZ_VOUS', titre: 'Rendez-vous', contenu: 'Votre rendez-vous est confirme', lu: false, createdAt: '2026-07-01T10:00:00+02:00', appointmentId: 7 };

describe('NotificationsScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGetNotifications.mockResolvedValue([unreadNotification]); mockGetUnreadNotifications.mockResolvedValue([unreadNotification]); mockMarkNotificationAsRead.mockResolvedValue({ ...unreadNotification, lu: true }); mockMarkAllNotificationsAsRead.mockResolvedValue({ success: true }); });

  /** Ce test verifie que le filtre non lues est visible et utilisable. */
  it('affiche le filtre non lues', async () => {
    render(<NotificationsScreen />);
    expect(await screen.findByText('Non lues')).toBeTruthy();
  });

  /** Ce test verifie que le clic appelle l'API pour marquer une notification comme lue. */
  it('appelle markNotificationAsRead au clic', async () => {
    render(<NotificationsScreen />);
    fireEvent.press(await screen.findByText('Marquer comme lue'));
    await waitFor(() => expect(mockMarkNotificationAsRead).toHaveBeenCalledWith(5));
  });
});