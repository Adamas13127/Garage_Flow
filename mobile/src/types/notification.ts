/*
 * Ce fichier declare les types notification utilises par l'application mobile GarageFlow.
 * Il existe pour afficher les alertes in-app du client.
 * Il communique avec notificationApi.ts et NotificationsScreen.
 */
export interface NotificationItem {
  id: number;
  type: string;
  contenu: string;
  lu: boolean;
  createdAt: string;
  appointmentId?: number | null;
  interventionId?: number | null;
}