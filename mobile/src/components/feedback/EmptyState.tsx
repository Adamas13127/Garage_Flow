/*
 * Ce fichier declare l'etat vide mobile GarageFlow.
 * Il existe pour expliquer simplement qu'une liste ne contient pas encore de donnees.
 * Il communique avec les ecrans de listes.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../utils/theme';

interface EmptyStateProps { title: string; message?: string; }

/** Cet etat vide evite les listes blanches et rassure l'utilisateur. */
export function EmptyState({ message, title }: EmptyStateProps) {
  return <View style={styles.container}><Text style={styles.title}>{title}</Text>{message ? <Text style={styles.message}>{message}</Text> : null}</View>;
}

const styles = StyleSheet.create({ container: { alignItems: 'center', borderColor: colors.border, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, padding: 20 }, title: { color: colors.text, fontWeight: '700' }, message: { color: colors.muted, marginTop: 6, textAlign: 'center' } });