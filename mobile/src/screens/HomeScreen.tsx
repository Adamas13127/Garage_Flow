/*
 * Ce fichier declare l'ecran d'accueil client mobile GarageFlow.
 * Il existe pour presenter un accueil marketplace avec actions, categories et suivis utiles.
 * Il communique avec useAuth, les API mobiles et MainTabs.
 */
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getClientAppointments } from '../api/appointmentApi';
import { getGarages } from '../api/garageApi';
import { getClientInterventions } from '../api/interventionApi';
import { getUnreadNotifications } from '../api/notificationApi';
import { getVehicles } from '../api/vehicleApi';
import { QuickActionCard } from '../components/common/QuickActionCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { ServiceCategoryStrip } from '../components/common/ServiceCategoryStrip';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { GarageMarketplaceCard } from '../components/garages/GarageMarketplaceCard';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import type { MainTabsParamList } from '../navigation/MainTabs';
import { useAuth } from '../hooks/useAuth';
import type { Appointment } from '../types/appointment';
import type { Garage } from '../types/garage';
import type { Intervention } from '../types/intervention';
import { formatDateTime } from '../utils/format';
import { colors, shadows, spacing, typography } from '../utils/theme';
import { MobileHeader } from '../components/common/MobileHeader';

type HomeScreenProps = BottomTabScreenProps<MainTabsParamList, 'Home'>;

interface HomeCounts { appointments: number; interventions: number; notifications: number; vehicles: number; }

function isUpcomingAppointment(status: string): boolean { return status === 'EN_ATTENTE' || status === 'CONFIRME'; }
function isOpenIntervention(status?: string | null): boolean { return status !== 'VEHICULE_RECUPERE' && status !== 'TERMINEE' && status !== 'TERMINE'; }
function appointmentLabel(appointment?: Appointment): string { return appointment ? `${formatDateTime(appointment.dateDebut)} - ${appointment.garage?.nom ?? 'Garage'}` : 'Aucun rendez-vous a venir'; }
function interventionLabel(intervention?: Intervention): string { return intervention ? `${intervention.statutActuel?.code ?? intervention.statut ?? 'Suivi en cours'}` : 'Aucune reparation en cours'; }

/** Cet ecran guide le client depuis la decouverte jusqu'a la reservation. */
export function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<HomeCounts>({ appointments: 0, interventions: 0, notifications: 0, vehicles: 0 });
  const [garages, setGarages] = useState<Garage[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | undefined>();
  const [currentIntervention, setCurrentIntervention] = useState<Intervention | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const results = await Promise.allSettled([getVehicles(), getClientAppointments(), getClientInterventions(), getUnreadNotifications(), getGarages()]);
        const vehicles = results[0].status === 'fulfilled' ? results[0].value.length : 0;
        const appointmentsList = results[1].status === 'fulfilled' ? results[1].value : [];
        const interventionsList = results[2].status === 'fulfilled' ? results[2].value : [];
        const notifications = results[3].status === 'fulfilled' ? results[3].value.length : 0;
        const garagesList = results[4].status === 'fulfilled' ? results[4].value : [];
        const upcoming = appointmentsList.filter((item) => isUpcomingAppointment(item.statut));
        const openInterventions = interventionsList.filter((item) => isOpenIntervention(item.statutActuel?.code ?? item.statut));
        setCounts({ appointments: upcoming.length, interventions: openInterventions.length, notifications, vehicles });
        setGarages(garagesList.slice(0, 3));
        setNextAppointment(upcoming[0]);
        setCurrentIntervention(openInterventions[0]);
        if (results.some((result) => result.status === 'rejected')) setError('Certaines donnees du resume ne sont pas disponibles.');
      } finally {
        setLoading(false);
      }
    }
    void loadSummary();
  }, []);

  return (
    <ScreenContainer>
      <MobileHeader title={`Bonjour ${user?.prenom ?? 'client'}`} subtitle="Autour de vous" unreadCount={counts.notifications} onNotifications={() => navigation.navigate('Notifications')} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Prendre rendez-vous</Text>
          <Text style={styles.heroSubtitle}>Trouvez un garage partenaire, choisissez une prestation et suivez votre intervention.</Text>
        </View>
        <AppButton onPress={() => navigation.navigate('Garages')}>Reserver</AppButton>
      </View>
      <SectionHeader title="Categories" />
      <ServiceCategoryStrip />
      <SectionHeader title="Garages recommandes" actionLabel="Tout voir" onAction={() => navigation.navigate('Garages')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedRow}>
        {garages.map((garage) => <GarageMarketplaceCard compact key={garage.id} garage={garage} onViewServices={() => navigation.navigate('Garages')} />)}
      </ScrollView>
      <SectionHeader title="Mes suivis" />
      <QuickActionCard title="Rendez-vous" subtitle={appointmentLabel(nextAppointment)} value={String(counts.appointments)} onPress={() => navigation.navigate('Appointments')} />
      <QuickActionCard title="Reparation" subtitle={interventionLabel(currentIntervention)} value={String(counts.interventions)} onPress={() => navigation.navigate('Interventions')} />
      <QuickActionCard title="Vehicules" subtitle="Gerer les autos utilisees pour reserver" value={String(counts.vehicles)} onPress={() => navigation.navigate('Vehicles')} />
      <QuickActionCard title="Notifications" subtitle="Alertes importantes et rappels" value={String(counts.notifications)} onPress={() => navigation.navigate('Notifications')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { ...shadows.card, backgroundColor: colors.primary, borderRadius: 8, gap: spacing.md, padding: spacing.lg },
  heroCopy: { gap: spacing.xs },
  heroSubtitle: { color: '#e0f2fe', fontSize: typography.body, lineHeight: 20 },
  heroTitle: { color: '#fff', fontSize: 21, fontWeight: '900' },
  recommendedRow: { gap: spacing.md, paddingVertical: spacing.xs },
});
