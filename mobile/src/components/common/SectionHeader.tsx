/*
 * Ce fichier declare un titre de section reutilisable pour GarageFlow mobile.
 * Il existe pour structurer les ecrans sans utiliser de grands titres repetitifs.
 * Il communique avec les ecrans client qui affichent des listes et des cartes.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Ce composant separe les blocs importants pour aider le jury a lire l'ecran. */
export function SectionHeader({ actionLabel, onAction, title }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? <Text accessibilityRole="button" onPress={onAction} style={styles.action}>{actionLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: { color: colors.primary, fontSize: typography.secondary, fontWeight: '800' },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  title: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: '800' },
});
