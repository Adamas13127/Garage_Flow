/*
 * Ce fichier declare les types de notification du frontend GarageFlow.
 * Il existe pour afficher les notifications in-app du backend.
 * Il communique avec NotificationsPage et le client HTTP.
 */

/** Ce type represente une notification retournee par /api/notifications. */
export interface NotificationItem {
  id: number;
  type: string;
  canal: string;
  contenu: string;
  lu: boolean;
  createdAt: string;
  readAt?: string | null;
  appointmentId?: number | null;
  interventionId?: number | null;
}