/*
 * Ce fichier declare le conteneur d'ecran mobile GarageFlow.
 * Il existe pour appliquer les marges, le scroll et la couleur de fond communs.
 * Il communique avec tous les ecrans.
 */
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../../utils/theme';

/** Ce conteneur evite les pages blanches et garde un espacement confortable. */
export function ScreenContainer({ children }: PropsWithChildren) {
  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.screen}>{children}</ScrollView>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.md, padding: spacing.lg },
});