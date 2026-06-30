/*
 * Ce fichier declare une carte garage orientee marketplace pour GarageFlow mobile.
 * Il existe pour aider le client a comparer les garages avant de choisir une prestation.
 * Il communique avec GaragesScreen, HomeScreen et GarageCover.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Garage } from '../../types/garage';
import { colors, shadows, spacing, typography } from '../../utils/theme';
import { AppButton } from '../ui/AppButton';
import { GarageCover } from './GarageCover';

interface GarageMarketplaceCardProps {
  garage: Garage;
  compact?: boolean;
  onViewServices: () => void;
}

function garageAddress(garage: Garage): string {
  return [garage.adresse, garage.codePostal, garage.ville].filter(Boolean).join(' ');
}

/** Cette carte presente les informations utiles avant de voir les prestations. */
export function GarageMarketplaceCard({ compact, garage, onViewServices }: GarageMarketplaceCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onViewServices} style={[styles.card, compact && styles.compact]}>
      <GarageCover name={garage.nom} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>{garage.nom}</Text>
          <Text style={styles.available}>Disponible</Text>
        </View>
        <Text numberOfLines={1} style={styles.meta}>{garageAddress(garage) || 'Adresse non renseignee'}</Text>
        <Text numberOfLines={1} style={styles.meta}>{garage.telephone ?? 'Telephone non renseigne'}</Text>
        {garage.description ? <Text numberOfLines={compact ? 1 : 2} style={styles.description}>{garage.description}</Text> : null}
        <View style={styles.badges}>
          <Text style={styles.badge}>Garage partenaire</Text>
          <Text style={styles.badge}>Prestations disponibles</Text>
        </View>
        {!compact ? <AppButton variant="secondary" onPress={onViewServices}>Voir les prestations</AppButton> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  available: { backgroundColor: colors.successSoft, borderRadius: 12, color: colors.success, fontSize: 11, fontWeight: '900', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  badge: { backgroundColor: colors.surfaceSoft, borderRadius: 12, color: colors.muted, fontSize: 11, fontWeight: '800', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  body: { gap: spacing.sm },
  card: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  compact: { minWidth: 230, width: 230 },
  description: { color: colors.muted, fontSize: typography.secondary, lineHeight: 17 },
  meta: { color: colors.muted, fontSize: typography.secondary },
  title: { color: colors.text, flex: 1, fontSize: typography.cardTitle, fontWeight: '900' },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
});
