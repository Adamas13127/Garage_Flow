/*
 * Ce fichier declare le badge de statut mobile GarageFlow.
 * Il existe pour rendre les statuts de rendez-vous et interventions plus lisibles.
 * Il communique avec les ecrans de suivi.
 */
import { StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

interface StatusBadgeProps { status?: string | null; }

/** Ce badge transforme un code technique en texte court. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status ? status.toLowerCase().replace(/_/g, ' ') : 'non renseigne';
  return <Text numberOfLines={1} style={styles.badge}>{label}</Text>;
}

const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 999, color: colors.primaryDark, fontSize: typography.secondary, fontWeight: '800', paddingHorizontal: spacing.sm, paddingVertical: 3 } });