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

/** Cette couverture simule une image d'atelier propre tant que le backend ne fournit pas de photo. */
export function GarageCover({ large, name }: GarageCoverProps) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'GF';
  return (
    <View style={[styles.cover, large && styles.large]}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{initials}</Text>
        </View>
        <Text style={styles.available}>Ouvert</Text>
      </View>
      <View style={styles.garageShape}>
        <View style={styles.door} />
        <View style={styles.doorSmall} />
      </View>
      <Text style={styles.label}>Atelier partenaire</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  available: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, color: colors.primaryDark, fontSize: 11, fontWeight: '900', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  badge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  badgeText: { color: colors.primaryDark, fontSize: 13, fontWeight: '900' },
  cover: { backgroundColor: colors.primary, borderRadius: 8, gap: spacing.sm, justifyContent: 'space-between', minHeight: 88, overflow: 'hidden', padding: spacing.md },
  door: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 4, flex: 1, height: 24 },
  doorSmall: { backgroundColor: 'rgba(255,255,255,0.56)', borderRadius: 4, height: 24, width: 38 },
  garageShape: { alignItems: 'flex-end', flexDirection: 'row', gap: spacing.xs, opacity: 0.9 },
  label: { color: '#fff', fontSize: 12, fontWeight: '900' },
  large: { minHeight: 136 },
  topRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
});
