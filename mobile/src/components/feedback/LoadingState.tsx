/*
 * Ce fichier declare l'etat de chargement mobile GarageFlow.
 * Il existe pour informer l'utilisateur pendant les appels API.
 * Il communique avec les ecrans connectes au backend.
 */
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../utils/theme';

interface LoadingStateProps { label?: string; }

/** Cet etat affiche un indicateur et un texte de chargement lisible. */
export function LoadingState({ label = 'Chargement...' }: LoadingStateProps) {
  return <View style={styles.container}><ActivityIndicator color={colors.primary} /><Text style={styles.text}>{label}</Text></View>;
}

const styles = StyleSheet.create({ container: { alignItems: 'center', gap: 8, padding: 20 }, text: { color: colors.muted } });