/*
 * Ce fichier declare le composant AppButton de GarageFlow mobile.
 * Il existe pour garder des boutons accessibles et coherents.
 * Il communique avec les ecrans et formulaires React Native.
 */
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../utils/theme';

interface AppButtonProps {
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

/** Ce bouton affiche un loader pendant les appels API pour eviter les doubles actions. */
export function AppButton({ children, disabled, loading, onPress, variant = 'primary' }: PropsWithChildren<AppButtonProps>) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={[styles.button, isPrimary ? styles.primary : styles.secondary, (disabled || loading) && styles.disabled]}>
      {loading ? <ActivityIndicator color={isPrimary ? '#fff' : colors.primary} /> : <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText]}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', borderRadius: 8, minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: '#e0f2fe' },
  disabled: { opacity: 0.6 },
  text: { fontWeight: '700' },
  primaryText: { color: '#fff' },
  secondaryText: { color: colors.primaryDark },
});