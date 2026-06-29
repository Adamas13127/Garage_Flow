/*
 * Ce fichier declare l'etat d'erreur mobile GarageFlow.
 * Il existe pour afficher les erreurs API sans laisser une page vide.
 * Il communique avec les ecrans connectes au backend.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

interface ErrorStateProps { message: string; }

/** Cet etat affiche une erreur claire et visible pour le client. */
export function ErrorState({ message }: ErrorStateProps) {
  return <View style={styles.container}><Text style={styles.title}>Erreur</Text><Text style={styles.message}>{message}</Text></View>;
}

const styles = StyleSheet.create({ container: { backgroundColor: colors.dangerSoft, borderColor: '#fecdd3', borderRadius: 8, borderWidth: 1, padding: spacing.md }, title: { color: colors.danger, fontSize: typography.body, fontWeight: '800' }, message: { color: colors.danger, fontSize: typography.secondary, marginTop: spacing.xs } });