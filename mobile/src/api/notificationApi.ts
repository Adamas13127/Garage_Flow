/*
 * Ce fichier contient les appels API lies aux notifications mobile GarageFlow.
 * Il existe pour afficher les alertes et gerer leur etat lu ou non lu.
 * Il communique avec httpClient.ts et NotificationsScreen.
 */
import { apiRequest } from './httpClient';
import type { NotificationItem } from '../types/notification';

function unwrapItems<T>(response: T[] | { items?: T[] }): T[] { return Array.isArray(response) ? response : response.items ?? []; }

/** Cette fonction recupere toutes les notifications du client connecte. */
export async function getNotifications(): Promise<NotificationItem[]> {
  return unwrapItems(await apiRequest<NotificationItem[] | { items?: NotificationItem[] }>('/api/notifications'));
}

/** Cette fonction recupere seulement les notifications non lues. */
export async function getUnreadNotifications(): Promise<NotificationItem[]> {
  return unwrapItems(await apiRequest<NotificationItem[] | { items?: NotificationItem[] }>('/api/notifications?unreadOnly=true'));
}

/** Cette fonction marque une notification precise comme lue. */
export function markNotificationAsRead(id: number): Promise<NotificationItem> { return apiRequest<NotificationItem>(`/api/notifications/${id}/read`, { method: 'PATCH' }); }

/** Cette fonction marque toutes les notifications du client comme lues. */
export function markAllNotificationsAsRead(): Promise<{ success?: boolean } | null> { return apiRequest<{ success?: boolean } | null>('/api/notifications/read-all', { method: 'PATCH' }); }