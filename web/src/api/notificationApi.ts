/*
 * Ce fichier contient les appels API lies aux notifications de l'utilisateur connecte.
 * Il existe pour isoler les endpoints notifications des pages React.
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

/** Cette fonction marque une notification precise comme lue. */
export function markNotificationAsRead(id: number): Promise<NotificationItem> {
  return apiRequest<NotificationItem>(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

/** Cette fonction marque toutes les notifications de l'utilisateur comme lues. */
export function markAllNotificationsAsRead(): Promise<void> {
  return apiRequest<void>('/api/notifications/read-all', { method: 'PATCH' });
}