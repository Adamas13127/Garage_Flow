/*
 * Ce fichier declare l'ecran detail intervention mobile GarageFlow.
 * Il existe pour montrer au client l'avancement de sa reparation avec une timeline.
 * Il communique avec interventionApi.ts, InterventionsStackNavigator et Timeline.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';
import { getClientIntervention } from '../api/interventionApi';
import { DetailRow } from '../components/common/DetailRow';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { Timeline, type TimelineStepData } from '../components/interventions/Timeline';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppCard } from '../components/ui/AppCard';
import type { InterventionsStackParamList } from '../navigation/InterventionsStackNavigator';
import type { Intervention, InterventionStatusHistory } from '../types/intervention';
import { formatDateTime } from '../utils/format';
import { colors } from '../utils/theme';

type InterventionDetailScreenProps = NativeStackScreenProps<InterventionsStackParamList, 'InterventionDetail'>;

const FOLLOW_UP_STEPS = [
  { code: 'VEHICULE_DEPOSE', label: 'Vehicule depose' },
  { code: 'DIAGNOSTIC_EN_COURS', label: 'Diagnostic en cours' },
  { code: 'ATTENTE_VALIDATION_CLIENT', label: 'Attente validation client' },
  { code: 'REPARATION_EN_COURS', label: 'Reparation en cours' },
  { code: 'VEHICULE_PRET', label: 'Vehicule pret' },
  { code: 'VEHICULE_RECUPERE', label: 'Vehicule recupere' },
];

function currentStatus(intervention?: Intervention | null): string | null { return intervention?.statutActuel?.code ?? intervention?.statut ?? null; }
function historyCode(item: InterventionStatusHistory): string | null { return item.statut?.code ?? item.statutCode ?? item.code ?? null; }
function historyDate(item: InterventionStatusHistory): string | null | undefined { return item.createdAt ?? item.dateChangement; }
function vehicleLabel(intervention: Intervention): string { const vehicle = intervention.vehicle ?? intervention.vehicule ?? intervention.appointment?.vehicle ?? intervention.appointment?.vehicule ?? intervention.rendezVous?.vehicle ?? intervention.rendezVous?.vehicule; return vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Non renseigne'; }
function serviceLabel(intervention: Intervention): string | undefined | null { return intervention.service?.nom ?? intervention.prestation?.nom ?? intervention.appointment?.service?.nom ?? intervention.appointment?.prestation?.nom ?? intervention.rendezVous?.service?.nom ?? intervention.rendezVous?.prestation?.nom; }
function garageLabel(intervention: Intervention): string | undefined | null { return intervention.garage?.nom ?? intervention.appointment?.garage?.nom ?? intervention.rendezVous?.garage?.nom; }

/** Cette fonction construit une timeline lisible meme si le backend ne renvoie pas encore tout l'historique. */
function buildTimeline(intervention: Intervention | null): TimelineStepData[] {
  const history = intervention?.statusHistory ?? intervention?.historiqueStatuts ?? [];
  const current = currentStatus(intervention);
  const currentIndex = Math.max(0, FOLLOW_UP_STEPS.findIndex((step) => step.code === current));
  return FOLLOW_UP_STEPS.map((step, index) => { const matchingHistory = history.find((item) => historyCode(item) === step.code); const state = matchingHistory || index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'; return { ...step, state, date: matchingHistory ? historyDate(matchingHistory) : null }; });
}

/** Cet ecran affiche le suivi de reparation sans exposer les notes internes du garage. */
export function InterventionDetailScreen({ route }: InterventionDetailScreenProps) {
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getClientIntervention(route.params.interventionId).then(setIntervention).catch((exception: Error) => setError(exception.message)).finally(() => setLoading(false)); }, [route.params.interventionId]);
  const steps = useMemo(() => buildTimeline(intervention), [intervention]);
  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Suivi reparation</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && !intervention ? <EmptyState title="Intervention introuvable" message="Le suivi demande n'est pas disponible." /> : null}{intervention ? <AppCard title={`Intervention #${intervention.id}`} subtitle={garageLabel(intervention) ?? undefined}><StatusBadge status={currentStatus(intervention)} /><DetailRow label="Garage" value={garageLabel(intervention)} /><DetailRow label="Vehicule" value={vehicleLabel(intervention)} /><DetailRow label="Prestation" value={serviceLabel(intervention)} /><DetailRow label="Date de creation" value={formatDateTime(intervention.createdAt)} /><DetailRow label="Date de cloture" value={formatDateTime(intervention.closedAt ?? intervention.dateCloture)} /><DetailRow label="Rendez-vous lie" value={intervention.appointment?.id ?? intervention.rendezVous?.id} /></AppCard> : null}<AppCard title="Timeline de suivi"><Timeline steps={steps} /></AppCard></ScreenContainer>;
}