/*
 * Ce fichier teste la page notifications du frontend GarageFlow.
 * Il existe pour verifier les actions de lecture sans appeler le vrai backend.
 * Il communique avec NotificationsPage et notificationApi.ts mocke.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationsPage } from './NotificationsPage';

const notificationApiMock = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

vi.mock('../api/notificationApi', () => notificationApiMock);

const unreadNotification = { id: 1, type: 'RENDEZ_VOUS', contenu: 'Un client a demande un rendez-vous.', lu: false, createdAt: '2026-07-01T08:00:00+02:00', appointmentId: 12 };

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationApiMock.getNotifications.mockResolvedValue([unreadNotification]);
    notificationApiMock.markNotificationAsRead.mockResolvedValue({ ...unreadNotification, lu: true });
    notificationApiMock.markAllNotificationsAsRead.mockResolvedValue(undefined);
  });

  /** Ce test verifie que les notifications non lues sont signalees clairement. */
  it('affiche une notification non lue', async () => {
    render(<NotificationsPage />);

    expect(await screen.findByText('Un client a demande un rendez-vous.')).toBeInTheDocument();
    expect(screen.getByText('Non lue')).toBeInTheDocument();
  });

  /** Ce test verifie que le bouton unitaire appelle l'API de lecture. */
  it('appelle markNotificationAsRead au clic', async () => {
    const user = userEvent.setup();

    render(<NotificationsPage />);
    await user.click(await screen.findByRole('button', { name: 'Marquer comme lue' }));

    expect(notificationApiMock.markNotificationAsRead).toHaveBeenCalledWith(1);
  });

  /** Ce test verifie que le bouton global appelle l'API de lecture de masse. */
  it('appelle markAllNotificationsAsRead au clic sur tout marquer comme lu', async () => {
    const user = userEvent.setup();

    render(<NotificationsPage />);
    await user.click(await screen.findByRole('button', { name: 'Tout marquer comme lu' }));

    expect(notificationApiMock.markAllNotificationsAsRead).toHaveBeenCalled();
  });
});