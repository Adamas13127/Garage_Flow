/*
 * Ce fichier declare les composants Timeline et TimelineStep de GarageFlow mobile.
 * Il existe pour afficher les etapes du suivi de reparation cote client.
 * Il communique avec InterventionDetailScreen.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';
import { formatDateTime } from '../../utils/format';

export type TimelineStepState = 'done' | 'current' | 'todo';

export interface TimelineStepData { code: string; label: string; state: TimelineStepState; date?: string | null; }

interface TimelineProps { steps: TimelineStepData[]; }
interface TimelineStepProps { step: TimelineStepData; }

/** Cette etape indique si une phase de reparation est passee, en cours ou a venir. */
export function TimelineStep({ step }: TimelineStepProps) {
  return <View style={styles.step}><View style={[styles.dot, styles[step.state]]} /><View style={styles.content}><Text style={styles.label}>{step.label}</Text><Text style={styles.state}>{step.state === 'done' ? 'Terminee' : step.state === 'current' ? 'En cours' : 'A venir'}</Text>{step.date ? <Text style={styles.date}>{formatDateTime(step.date)}</Text> : null}</View></View>;
}

/** Cette timeline regroupe les etapes de suivi visibles par le client. */
export function Timeline({ steps }: TimelineProps) {
  return <View style={styles.container}>{steps.map((step) => <TimelineStep key={step.code} step={step} />)}</View>;
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  step: { flexDirection: 'row', gap: spacing.sm },
  dot: { borderRadius: 7, height: 14, marginTop: 3, width: 14 },
  done: { backgroundColor: colors.success },
  current: { backgroundColor: colors.primary },
  todo: { backgroundColor: colors.border },
  content: { flex: 1, paddingBottom: spacing.sm },
  label: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  state: { color: colors.muted, fontSize: typography.secondary, marginTop: 1 },
  date: { color: colors.muted, fontSize: typography.secondary, marginTop: 1 },
});