/*
 * Ce fichier contient les appels API lies aux notifications de l'utilisateur connecte.
 * Il existe pour isoler l'endpoint /api/notifications des pages React.
 * Il communique avec le client HTTP, DashboardPage et NotificationsPage.
 */
import { unwrapItems } from './apiResponse';
import { apiRequest } from './httpClient';
import type { NotificationItem } from '../types/notification';

/** Cette fonction recupere toutes les notifications disponibles pour l'utilisateur connecte. */
export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await apiRequest<NotificationItem[] | { items?: NotificationItem[] }>('/api/notifications');
  return unwrapItems(response);
}

/** Cette fonction filtre les notifications non lues pour alimenter le dashboard. */
export async function getUnreadNotifications(): Promise<NotificationItem[]> {
  const notifications = await getNotifications();
  return notifications.filter((notification) => !notification.lu);
}