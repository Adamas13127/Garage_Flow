/*
 * Ce fichier declare l'ecran detail rendez-vous mobile GarageFlow.
 * Il existe pour afficher toutes les informations utiles d'un rendez-vous client.
 * Il communique avec appointmentApi.ts, AppointmentsStackNavigator et les composants de detail.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { cancelAppointment, getClientAppointment } from '../api/appointmentApi';
import { ConfirmActionButton } from '../components/common/ConfirmActionButton';
import { DetailRow } from '../components/common/DetailRow';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppCard } from '../components/ui/AppCard';
import type { AppointmentsStackParamList } from '../navigation/AppointmentsStackNavigator';
import type { Appointment } from '../types/appointment';
import { formatDateTime } from '../utils/format';
import { colors } from '../utils/theme';

type AppointmentDetailScreenProps = NativeStackScreenProps<AppointmentsStackParamList, 'AppointmentDetail'>;

function canCancel(status?: string | null): boolean { return status === 'EN_ATTENTE' || status === 'CONFIRME'; }
function vehicleLabel(appointment: Appointment): string { const vehicle = appointment.vehicle ?? appointment.vehicule; return vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Non renseigne'; }

/** Cet ecran charge le rendez-vous et laisse le client l'annuler si son statut le permet. */
export function AppointmentDetailScreen({ route }: AppointmentDetailScreenProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadAppointment() { try { setLoading(true); setError(null); setAppointment(await getClientAppointment(route.params.appointmentId)); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de charger le rendez-vous.'); } finally { setLoading(false); } }
  useEffect(() => { void loadAppointment(); }, [route.params.appointmentId]);

  async function handleCancel() { if (!appointment) return; try { setSaving(true); setError(null); await cancelAppointment(appointment.id); setSuccess('Rendez-vous annule.'); await loadAppointment(); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible d annuler le rendez-vous.'); } finally { setSaving(false); } }

  const service = appointment?.service ?? appointment?.prestation;
  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Detail rendez-vous</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{success ? <Text style={{ color: colors.success, fontWeight: '700' }}>{success}</Text> : null}{!loading && !error && !appointment ? <EmptyState title="Rendez-vous introuvable" message="Ce rendez-vous n'est pas disponible." /> : null}{appointment ? <AppCard title={appointment.garage?.nom ?? 'Garage'} subtitle={appointment.garage?.adresse ?? undefined}><StatusBadge status={appointment.statut} /><DetailRow label="Vehicule" value={vehicleLabel(appointment)} /><DetailRow label="Prestation" value={service?.nom} /><DetailRow label="Date et heure" value={formatDateTime(appointment.dateDebut)} /><DetailRow label="Commentaire client" value={appointment.commentaireClient ?? appointment.motif} /><DetailRow label="Date de creation" value={formatDateTime(appointment.createdAt)} />{canCancel(appointment.statut) ? <ConfirmActionButton loading={saving} confirmTitle="Annuler le rendez-vous" confirmMessage="Voulez-vous vraiment annuler ce rendez-vous ?" onConfirm={() => void handleCancel()}>Annuler le rendez-vous</ConfirmActionButton> : null}</AppCard> : null}</ScreenContainer>;
}