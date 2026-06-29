/*
 * Ce fichier teste la page notifications du frontend GarageFlow.
 * Il existe pour verifier qu'une notification non lue est visible dans l'interface.
 * Il communique avec NotificationsPage et notificationApi.ts mocke.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotificationsPage } from './NotificationsPage';

vi.mock('../api/notificationApi', () => ({
  getNotifications: vi.fn(async () => [
    { id: 1, type: 'RENDEZ_VOUS', contenu: 'Un client a demande un rendez-vous.', lu: false, createdAt: '2026-07-01T08:00:00+02:00', appointmentId: 12 },
  ]),
}));

describe('NotificationsPage', () => {
  /** Ce test verifie que les notifications non lues sont signalees clairement. */
  it('affiche une notification non lue', async () => {
    render(<NotificationsPage />);

    expect(await screen.findByText('Un client a demande un rendez-vous.')).toBeInTheDocument();
    expect(screen.getByText('Non lue')).toBeInTheDocument();
  });
});