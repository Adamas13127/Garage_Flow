/*
 * Ce fichier declare les types de notification du frontend GarageFlow.
 * Il existe pour afficher les notifications in-app du backend.
 * Il communique avec NotificationsPage, DashboardPage et notificationApi.ts.
 */

/** Ce type represente une notification retournee par /api/notifications. */
export interface NotificationItem {
  id: number;
  type: string;
  canal?: string | null;
  contenu: string;
  lu: boolean;
  createdAt: string;
  readAt?: string | null;
  appointmentId?: number | null;
  interventionId?: number | null;
}