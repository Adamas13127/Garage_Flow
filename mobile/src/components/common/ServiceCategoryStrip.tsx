/*
 * Ce fichier declare la bande de categories de services GarageFlow mobile.
 * Il existe pour rendre le parcours de reservation plus visuel et plus rapide.
 * Il communique avec l'accueil, les garages et les details de garage.
 */
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export const serviceCategories: { icon: IoniconName; label: string }[] = [
  { icon: 'settings-outline', label: 'Entretien' },
  { icon: 'water-outline', label: 'Vidange' },
  { icon: 'disc-outline', label: 'Freins' },
  { icon: 'ellipse-outline', label: 'Pneus' },
  { icon: 'snow-outline', label: 'Clim' },
  { icon: 'pulse-outline', label: 'Diagnostic' },
  { icon: 'battery-charging-outline', label: 'Batterie' },
  { icon: 'car-outline', label: 'Carrosserie' },
  { icon: 'flash-outline', label: 'Electrique' },
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
              <Ionicons color={isSelected ? '#fff' : colors.primary} name={category.icon} size={16} />
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
  iconBox: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 16, height: 28, justifyContent: 'center', width: 28 },
  label: { color: colors.text, fontSize: typography.secondary, fontWeight: '800' },
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectedIcon: { backgroundColor: 'rgba(255,255,255,0.22)' },
  selectedText: { color: '#fff' },
});
