/*
 * Ce fichier declare les types notification utilises par l'application mobile GarageFlow.
 * Il existe pour afficher les alertes in-app et gerer leur etat lu/non lu.
 * Il communique avec notificationApi.ts et NotificationsScreen.
 */
export interface NotificationItem {
  id: number;
  type: string;
  titre?: string | null;
  contenu?: string | null;
  message?: string | null;
  lu: boolean;
  readAt?: string | null;
  createdAt: string;
  appointmentId?: number | null;
  interventionId?: number | null;
}