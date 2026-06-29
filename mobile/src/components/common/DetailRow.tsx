/*
 * Ce fichier declare une ligne de detail reutilisable dans GarageFlow mobile.
 * Il existe pour afficher proprement une etiquette et une valeur dans les ecrans de detail.
 * Il communique avec les ecrans rendez-vous, interventions et notifications.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../utils/theme';

interface DetailRowProps { label: string; value?: string | number | null; }

/** Cette ligne aide le jury a lire rapidement une information importante. */
export function DetailRow({ label, value }: DetailRowProps) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || 'Non renseigne'}</Text></View>;
}

const styles = StyleSheet.create({
  row: { borderBottomColor: colors.border, borderBottomWidth: 1, gap: 4, paddingVertical: 10 },
  label: { color: colors.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  value: { color: colors.text, fontSize: 15 },
});