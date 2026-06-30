/*
 * Ce fichier declare la bande de categories de services GarageFlow mobile.
 * Il existe pour rendre le parcours de reservation plus visuel et plus rapide.
 * Il communique avec l'accueil, les garages et les details de garage.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

export const serviceCategories = [
  { icon: 'E', label: 'Entretien' },
  { icon: 'V', label: 'Vidange' },
  { icon: 'F', label: 'Freins' },
  { icon: 'P', label: 'Pneus' },
  { icon: 'C', label: 'Clim' },
  { icon: 'D', label: 'Diagnostic' },
  { icon: 'B', label: 'Batterie' },
  { icon: 'CA', label: 'Carrosserie' },
  { icon: 'EL', label: 'Electrique' },
];

interface ServiceCategoryStripProps {
  selected?: string;
  onSelect?: (label: string) => void;
}

/** Cette bande montre les familles de prestations comme dans une marketplace auto. */
export function ServiceCategoryStrip({ onSelect, selected }: ServiceCategoryStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {serviceCategories.map((category) => {
        const isSelected = selected === category.label;
        return (
          <Pressable accessibilityRole="button" key={category.label} onPress={() => onSelect?.(category.label)} style={[styles.chip, isSelected && styles.selected]}>
            <View style={[styles.iconBox, isSelected && styles.selectedIcon]}>
              <Text style={[styles.icon, isSelected && styles.selectedText]}>{category.icon}</Text>
            </View>
            <Text style={[styles.label, isSelected && styles.selectedText]}>{category.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Cette fonction aide les cartes de prestation a choisir une categorie lisible. */
export function getServiceCategoryLabel(serviceName?: string | null): string {
  const name = (serviceName ?? '').toLowerCase();
  if (name.includes('vidange')) return 'Vidange';
  if (name.includes('frein')) return 'Freins';
  if (name.includes('pneu')) return 'Pneus';
  if (name.includes('clim')) return 'Clim';
  if (name.includes('diag')) return 'Diagnostic';
  if (name.includes('batter')) return 'Batterie';
  if (name.includes('carross')) return 'Carrosserie';
  if (name.includes('elect')) return 'Electrique';
  return 'Entretien';
}

const styles = StyleSheet.create({
  chip: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.xs, minWidth: 68, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  icon: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  iconBox: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 16, height: 28, justifyContent: 'center', width: 28 },
  label: { color: colors.text, fontSize: typography.secondary, fontWeight: '800' },
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectedIcon: { backgroundColor: 'rgba(255,255,255,0.22)' },
  selectedText: { color: '#fff' },
});
