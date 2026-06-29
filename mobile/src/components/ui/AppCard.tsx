/*
 * Ce fichier declare le composant AppCard de GarageFlow mobile.
 * Il existe pour afficher des blocs d'information reutilisables.
 * Il communique avec les ecrans Home et listes metier.
 */
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../utils/theme';

interface AppCardProps { title?: string; subtitle?: string; }

/** Cette carte mobile presente un contenu metier avec un titre optionnel. */
export function AppCard({ children, subtitle, title }: PropsWithChildren<AppCardProps>) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children ? <View style={title || subtitle ? styles.body : undefined}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, padding: 16 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  body: { marginTop: 12 },
});