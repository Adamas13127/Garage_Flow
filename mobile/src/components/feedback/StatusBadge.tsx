/*
 * Ce fichier declare le badge de statut mobile GarageFlow.
 * Il existe pour rendre les statuts de rendez-vous et interventions plus lisibles.
 * Il communique avec les ecrans de suivi.
 */
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../utils/theme';

interface StatusBadgeProps { status?: string | null; }

/** Ce badge transforme un code technique en texte court. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status ? status.toLowerCase().replace(/_/g, ' ') : 'non renseigne';
  return <Text style={styles.badge}>{label}</Text>;
}

const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', backgroundColor: '#e0f2fe', borderRadius: 6, color: colors.primaryDark, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4 } });