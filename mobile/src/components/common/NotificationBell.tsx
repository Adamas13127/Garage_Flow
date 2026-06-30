/*
 * Ce fichier declare la cloche de notifications de GarageFlow mobile.
 * Il existe pour donner un acces rapide aux alertes sans occuper un onglet principal.
 * Il communique avec les ecrans qui savent naviguer vers Notifications.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../utils/theme';

interface NotificationBellProps {
  unreadCount?: number;
  onPress?: () => void;
}

/** Cette cloche indique au client s'il a des notifications non lues. */
export function NotificationBell({ onPress, unreadCount = 0 }: NotificationBellProps) {
  return (
    <Pressable accessibilityLabel="Notifications" accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.icon}>!</Text>
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', backgroundColor: colors.danger, borderRadius: 10, minWidth: 18, paddingHorizontal: spacing.xs, position: 'absolute', right: -4, top: -4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  button: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 },
  icon: { color: colors.primary, fontSize: 18, fontWeight: '900' },
});
