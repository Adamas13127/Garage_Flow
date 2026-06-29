/*
 * Ce fichier declare l'ecran d'accueil client mobile GarageFlow.
 * Il existe pour presenter un resume client avec compteurs et raccourcis principaux.
 * Il communique avec useAuth, les API mobiles et MainTabs.
 */
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getClientAppointments } from '../api/appointmentApi';
import { getClientInterventions } from '../api/interventionApi';
import { getUnreadNotifications } from '../api/notificationApi';
import { getVehicles } from '../api/vehicleApi';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { SummaryCard } from '../components/common/SummaryCard';
import { AppButton } from '../components/ui/AppButton';
import type { MainTabsParamList } from '../navigation/MainTabs';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography } from '../utils/theme';

type HomeScreenProps = BottomTabScreenProps<MainTabsParamList, 'Home'>;

interface HomeCounts { appointments: number; interventions: number; notifications: number; vehicles: number; }

function isUpcomingAppointment(status: string): boolean { return status === 'EN_ATTENTE' || status === 'CONFIRME'; }
function isOpenIntervention(status?: string | null): boolean { return status !== 'VEHICULE_RECUPERE' && status !== 'TERMINEE' && status !== 'TERMINE'; }

/** Cet ecran affiche un tableau de bord simple pour orienter le client connecte. */
export function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<HomeCounts>({ appointments: 0, interventions: 0, notifications: 0, vehicles: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { async function loadSummary() { try { setLoading(true); const results = await Promise.allSettled([getVehicles(), getClientAppointments(), getClientInterventions(), getUnreadNotifications()]); const vehicles = results[0].status === 'fulfilled' ? results[0].value.length : 0; const appointments = results[1].status === 'fulfilled' ? results[1].value.filter((item) => isUpcomingAppointment(item.statut)).length : 0; const interventions = results[2].status === 'fulfilled' ? results[2].value.filter((item) => isOpenIntervention(item.statutActuel?.code ?? item.statut)).length : 0; const notifications = results[3].status === 'fulfilled' ? results[3].value.length : 0; setCounts({ appointments, interventions, notifications, vehicles }); if (results.some((result) => result.status === 'rejected')) setError('Certaines donnees du resume ne sont pas disponibles.'); } finally { setLoading(false); } } void loadSummary(); }, []);

  return <ScreenContainer><Text style={{ color: colors.text, fontSize: typography.screenTitle, fontWeight: '800' }}>Bonjour {user?.prenom} {user?.nom}</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}<View style={styles.grid}><SummaryCard label="Vehicules" value={counts.vehicles} helper="Dans votre compte" onPress={() => navigation.navigate('Vehicles')} /><SummaryCard label="Rendez-vous" value={counts.appointments} helper="A venir ou en attente" onPress={() => navigation.navigate('Appointments')} /><SummaryCard label="Reparations" value={counts.interventions} helper="En cours" onPress={() => navigation.navigate('Interventions')} /><SummaryCard label="Non lues" value={counts.notifications} helper="Notifications" onPress={() => navigation.navigate('Notifications')} /></View><View style={styles.shortcuts}><AppButton variant="secondary" onPress={() => navigation.navigate('Vehicles')}>Mes vehicules</AppButton><AppButton variant="secondary" onPress={() => navigation.navigate('Garages')}>Prendre rendez-vous</AppButton><AppButton variant="secondary" onPress={() => navigation.navigate('Appointments')}>Mes rendez-vous</AppButton><AppButton variant="secondary" onPress={() => navigation.navigate('Interventions')}>Suivi reparations</AppButton><AppButton variant="secondary" onPress={() => navigation.navigate('Notifications')}>Notifications</AppButton></View></ScreenContainer>;
}

const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, shortcuts: { gap: spacing.sm } });