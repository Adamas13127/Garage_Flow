/*
 * Ce fichier declare le composant FormSection mobile GarageFlow.
 * Il existe pour regrouper les formulaires de vehicule et reservation.
 * Il communique avec VehiclesScreen et BookingScreen.
 */
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../utils/theme';

interface FormSectionProps { title: string; }

/** Cette section affiche un titre clair au-dessus d'un groupe de champs. */
export function FormSection({ children, title }: PropsWithChildren<FormSectionProps>) {
  return <View style={styles.container}><Text style={styles.title}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({ container: { gap: 12 }, title: { color: colors.text, fontSize: 18, fontWeight: '800' } });