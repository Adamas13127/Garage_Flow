/*
 * Ce fichier declare les filtres compacts de GarageFlow mobile.
 * Il existe pour filtrer les listes sans afficher de gros boutons.
 * Il communique avec les ecrans garages, rendez-vous et notifications.
 */
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

export interface FilterOption<T extends string> {
  label: string;
  value: T;
}

interface FilterChipsProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Ces pastilles permettent au client de changer de vue rapidement. */
export function FilterChips<T extends string>({ onChange, options, value }: FilterChipsProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable accessibilityRole="button" key={option.value} onPress={() => onChange(option.value)} style={[styles.chip, selected && styles.selected]}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  label: { color: colors.muted, fontSize: typography.secondary, fontWeight: '800' },
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectedLabel: { color: '#fff' },
});
