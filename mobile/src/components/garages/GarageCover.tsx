/*
 * Ce fichier declare une couverture visuelle pour les garages GarageFlow mobile.
 * Il existe pour donner un repere marketplace meme sans vraie image envoyee par l'API.
 * Il communique avec les cartes garage et l'ecran detail garage.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../utils/theme';

interface GarageCoverProps {
  name: string;
  large?: boolean;
}

/** Cette couverture simule une image propre tant que le backend ne fournit pas de photo. */
export function GarageCover({ large, name }: GarageCoverProps) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'GF';
  return (
    <View style={[styles.cover, large && styles.large]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{initials}</Text>
      </View>
      <Text style={styles.label}>Atelier auto</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  badgeText: { color: colors.primaryDark, fontSize: 13, fontWeight: '900' },
  cover: { backgroundColor: colors.primary, borderRadius: 8, gap: spacing.sm, justifyContent: 'space-between', minHeight: 90, padding: spacing.md },
  label: { color: '#fff', fontSize: 12, fontWeight: '800' },
  large: { minHeight: 142 },
});
