/*
 * Ce fichier declare le composant AppButton de GarageFlow mobile.
 * Il existe pour garder des boutons accessibles, compacts et coherents.
 * Il communique avec les ecrans et formulaires React Native.
 */
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

interface AppButtonProps {
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

/** Ce bouton affiche un loader pendant les appels API pour eviter les doubles actions. */
export function AppButton({ children, disabled, loading, onPress, variant = 'primary' }: PropsWithChildren<AppButtonProps>) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || loading }} disabled={disabled || loading} onPress={onPress} style={[styles.button, styles[variant], (disabled || loading) && styles.disabled]}>
      {loading ? <ActivityIndicator color={isPrimary ? '#fff' : colors.primary} /> : <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText, variant === 'danger' && styles.dangerText]}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', borderRadius: 8, minHeight: 38, justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySoft },
  danger: { backgroundColor: colors.dangerSoft },
  ghost: { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 },
  disabled: { opacity: 0.55 },
  text: { fontSize: typography.button, fontWeight: '700' },
  primaryText: { color: '#fff' },
  secondaryText: { color: colors.primaryDark },
  dangerText: { color: colors.danger },
});
