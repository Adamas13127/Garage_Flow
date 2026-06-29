/*
 * Ce fichier declare le composant AppCard de GarageFlow mobile.
 * Il existe pour afficher des blocs d'information reutilisables avec une surface compacte.
 * Il communique avec les ecrans Home et listes metier.
 */
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, shadows, spacing, typography } from '../../utils/theme';

interface AppCardProps { title?: string; subtitle?: string; }

/** Cette carte mobile presente un contenu metier avec un titre optionnel. */
export function AppCard({ children, subtitle, title }: PropsWithChildren<AppCardProps>) {
  return (
    <View style={styles.card}>
      {title ? <Text numberOfLines={2} style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text> : null}
      {children ? <View style={title || subtitle ? styles.body : undefined}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, padding: spacing.md },
  title: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: typography.secondary, marginTop: spacing.xs },
  body: { gap: spacing.sm, marginTop: spacing.sm },
});