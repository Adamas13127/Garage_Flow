/*
 * Ce fichier declare un composant de selection simple pour GarageFlow mobile.
 * Il existe pour choisir un vehicule, une date ou un creneau sans librairie lourde.
 * Il communique avec BookingScreen.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../utils/theme';

export interface AppSelectOption { label: string; value: string; }
interface AppSelectProps { label: string; value?: string; options: AppSelectOption[]; onChange: (value: string) => void; }

/** Cette selection affiche des boutons accessibles pour une liste courte d'options. */
export function AppSelect({ label, onChange, options, value }: AppSelectProps) {
  return <View style={styles.container}><Text style={styles.label}>{label}</Text><View style={styles.options}>{options.map((option) => <Pressable accessibilityRole="button" key={option.value} onPress={() => onChange(option.value)} style={[styles.option, value === option.value && styles.selected]}><Text style={[styles.optionText, value === option.value && styles.selectedText]}>{option.label}</Text></Pressable>)}</View></View>;
}

const styles = StyleSheet.create({ container: { gap: 8 }, label: { color: colors.text, fontWeight: '700' }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, option: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 }, selected: { backgroundColor: '#e0f2fe', borderColor: colors.primary }, optionText: { color: colors.text }, selectedText: { color: colors.primaryDark, fontWeight: '700' } });