/*
 * Ce fichier declare le composant AppInput de GarageFlow mobile.
 * Il existe pour associer chaque champ a un label lisible et compact.
 * Il communique avec les formulaires de connexion, inscription, vehicule et reservation.
 */
import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

interface AppInputProps extends TextInputProps { label: string; }

/** Ce champ mobile garde un style sobre et compatible avec le clavier. */
export function AppInput({ label, ...props }: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} autoCapitalize="none" placeholderTextColor="#94a3b8" style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { color: colors.text, fontSize: typography.secondary, fontWeight: '700' },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text, fontSize: typography.body, minHeight: 40, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});