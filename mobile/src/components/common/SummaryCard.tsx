/*
 * Ce fichier declare une carte de compteur pour l'accueil mobile GarageFlow.
 * Il existe pour resumer les informations client comme les vehicules ou notifications.
 * Il communique avec HomeScreen.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../utils/theme';

interface SummaryCardProps { label: string; value: number | string; helper?: string; onPress?: () => void; }

/** Cette carte transforme une donnee API en raccourci clair pour le client. */
export function SummaryCard({ helper, label, onPress, value }: SummaryCardProps) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}><View><Text style={styles.value}>{value}</Text><Text style={styles.label}>{label}</Text>{helper ? <Text style={styles.helper}>{helper}</Text> : null}</View></Pressable>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, minHeight: 92, padding: 14 },
  value: { color: colors.primaryDark, fontSize: 26, fontWeight: '800' },
  label: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 4 },
  helper: { color: colors.muted, fontSize: 12, marginTop: 4 },
});