/*
 * Ce fichier declare le composant AppInput de GarageFlow mobile.
 * Il existe pour associer chaque champ a un label lisible.
 * Il communique avec LoginScreen et RegisterScreen.
 */
import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../utils/theme';

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
  container: { gap: 6 },
  label: { color: colors.text, fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text, minHeight: 44, paddingHorizontal: 12 },
});