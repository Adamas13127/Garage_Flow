/*
 * Ce fichier declare l'en-tete mobile commun de GarageFlow.
 * Il existe pour afficher le contexte de la page, la localisation et les notifications.
 * Il communique avec les ecrans et avec NotificationBell.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';
import { NotificationBell } from './NotificationBell';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  unreadCount?: number;
  onBack?: () => void;
  onNotifications?: () => void;
}

/** Cet en-tete donne au client un repere clair avant de choisir une action. */
export function MobileHeader({ onBack, onNotifications, showBack, subtitle, title, unreadCount }: MobileHeaderProps) {
  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable accessibilityLabel="Retour" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>{'<'}</Text>
        </Pressable>
      ) : null}
      <View style={styles.texts}>
        <Text numberOfLines={1} style={styles.subtitle}>{subtitle ?? 'GarageFlow'}</Text>
        <Text numberOfLines={2} style={styles.title}>{title}</Text>
      </View>
      {onNotifications ? <NotificationBell onPress={onNotifications} unreadCount={unreadCount} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 },
  backText: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  subtitle: { color: colors.muted, fontSize: typography.secondary, fontWeight: '700' },
  texts: { flex: 1, gap: spacing.xs },
  title: { color: colors.text, fontSize: typography.screenTitle, fontWeight: '900' },
});
