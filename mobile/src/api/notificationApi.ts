/*
 * Ce fichier contient les appels API lies aux notifications mobile GarageFlow.
 * Il existe pour afficher les alertes du client dans NotificationsScreen.
 * Il communique avec httpClient.ts.
 */
import { apiRequest } from './httpClient';
import type { NotificationItem } from '../types/notification';

function unwrapItems<T>(response: T[] | { items?: T[] }): T[] { return Array.isArray(response) ? response : response.items ?? []; }

/** Cette fonction recupere les notifications du client connecte. */
export async function getNotifications(): Promise<NotificationItem[]> {
  return unwrapItems(await apiRequest<NotificationItem[] | { items?: NotificationItem[] }>('/api/notifications'));
}