/*
 * Ce fichier declare l'etat d'erreur mobile GarageFlow.
 * Il existe pour afficher les erreurs API sans laisser une page vide.
 * Il communique avec les ecrans connectes au backend.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../utils/theme';

interface ErrorStateProps { message: string; }

/** Cet etat affiche une erreur claire et visible pour le client. */
export function ErrorState({ message }: ErrorStateProps) {
  return <View style={styles.container}><Text style={styles.title}>Erreur</Text><Text style={styles.message}>{message}</Text></View>;
}

const styles = StyleSheet.create({ container: { backgroundColor: '#fff1f2', borderColor: '#fecdd3', borderRadius: 8, borderWidth: 1, padding: 14 }, title: { color: colors.danger, fontWeight: '700' }, message: { color: colors.danger, marginTop: 4 } });