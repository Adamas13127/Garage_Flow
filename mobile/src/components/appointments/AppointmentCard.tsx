/*
 * Ce fichier declare la carte rendez-vous mobile GarageFlow.
 * Il existe pour afficher un rendez-vous client, son detail et son action d'annulation si possible.
 * Il communique avec AppointmentsScreen.
 */
import { Alert, Text } from 'react-native';
import type { Appointment } from '../../types/appointment';
import { formatDateTime } from '../../utils/format';
import { StatusBadge } from '../feedback/StatusBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

interface AppointmentCardProps { appointment: Appointment; onCancel?: () => void; onDetails?: () => void; }

/** Cette carte affiche un rendez-vous et demande confirmation avant annulation. */
export function AppointmentCard({ appointment, onCancel, onDetails }: AppointmentCardProps) {
  const canCancel = appointment.statut === 'EN_ATTENTE' || appointment.statut === 'CONFIRME';
  function confirmCancel() { Alert.alert('Annuler le rendez-vous', 'Confirmer l annulation ?', [{ text: 'Non' }, { text: 'Oui', onPress: onCancel }]); }
  return <AppCard title={appointment.garage?.nom ?? `Rendez-vous #${appointment.id}`} subtitle={formatDateTime(appointment.dateDebut)}><Text>{appointment.service?.nom ?? appointment.prestation?.nom ?? 'Prestation non renseignee'}</Text><Text>{appointment.commentaireClient ?? appointment.motif ?? 'Aucun commentaire'}</Text><StatusBadge status={appointment.statut} />{onDetails ? <AppButton variant="secondary" onPress={onDetails}>Voir le detail</AppButton> : null}{canCancel && onCancel ? <AppButton variant="secondary" onPress={confirmCancel}>Annuler</AppButton> : null}</AppCard>;
}