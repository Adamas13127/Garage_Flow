/*
 * Ce fichier declare une carte d'action rapide pour GarageFlow mobile.
 * Il existe pour transformer l'accueil en point de depart clair vers les parcours client.
 * Il communique avec HomeScreen et la navigation principale.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadows, spacing, typography } from '../../utils/theme';

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  value?: string;
  onPress: () => void;
}

/** Cette carte resume une action sans forcer le client a lire un long texte. */
export function QuickActionCard({ onPress, subtitle, title, value }: QuickActionCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { ...shadows.card, alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', padding: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  subtitle: { color: colors.muted, fontSize: typography.secondary },
  title: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
  value: { color: colors.primary, fontSize: 18, fontWeight: '900' },
});
