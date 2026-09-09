/*
 * Ce fichier declare l'ecran detail garage mobile GarageFlow.
 * Il existe pour afficher les informations d'un garage et ses prestations actives.
 * Il communique avec garageApi.ts et la navigation de reservation.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getGarage, getGarageServices } from '../api/garageApi';
import { getServiceCategoryLabel } from '../components/common/ServiceCategoryStrip';
import { MobileHeader } from '../components/common/MobileHeader';
import { SectionHeader } from '../components/common/SectionHeader';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { GarageCover } from '../components/garages/GarageCover';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import type { GaragesStackParamList } from '../navigation/GaragesStackNavigator';
import type { Garage, OpeningHour, ServicePrestation } from '../types/garage';
import { colors, shadows, spacing, typography } from '../utils/theme';

type GarageDetailScreenProps = NativeStackScreenProps<GaragesStackParamList, 'GarageDetail'>;

const DAY_LABELS: Record<number, string> = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi', 7: 'Dimanche' };
const CLOSED_LABEL = 'Ferme';

interface DaySchedule { day: number; schedule: string; }
interface OpeningHoursGroup { label: string; schedule: string; }

function garageAddress(garage: Garage): string {
  return [garage.adresse, garage.codePostal, garage.ville].filter(Boolean).join(' ');
}

/** Cette fonction associe a chaque jour de la semaine son horaire, ou "Ferme" si absent. */
function buildDaySchedules(openingHours?: OpeningHour[] | null): DaySchedule[] {
  const scheduleByDay = new Map<number, string>();
  (openingHours ?? []).forEach((hour) => {
    if (hour.actif === false || !hour.heureDebut || !hour.heureFin) return;
    scheduleByDay.set(hour.jourSemaine, `${hour.heureDebut} - ${hour.heureFin}`);
  });
  return Array.from({ length: 7 }, (_, index) => ({ day: index + 1, schedule: scheduleByDay.get(index + 1) ?? CLOSED_LABEL }));
}

/** Cette fonction regroupe les jours consecutifs qui partagent le meme horaire (ex. "Lundi - Vendredi"). */
function groupDaySchedules(days: DaySchedule[]): OpeningHoursGroup[] {
  const groups: { firstDay: number; lastDay: number; schedule: string }[] = [];
  days.forEach(({ day, schedule }) => {
    const current = groups[groups.length - 1];
    if (current && current.schedule === schedule && current.lastDay === day - 1) {
      current.lastDay = day;
    } else {
      groups.push({ firstDay: day, lastDay: day, schedule });
    }
  });
  return groups.map(({ firstDay, lastDay, schedule }) => ({
    label: firstDay === lastDay ? DAY_LABELS[firstDay] : `${DAY_LABELS[firstDay]} - ${DAY_LABELS[lastDay]}`,
    schedule,
  }));
}

interface ServiceMarketplaceCardProps {
  service: ServicePrestation;
  onBook: () => void;
}

/** Cette petite carte presente une prestation avant de passer a la reservation. */
function ServiceMarketplaceCard({ onBook, service }: ServiceMarketplaceCardProps) {
  const category = getServiceCategoryLabel(service.nom);
  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIcon}><Text style={styles.serviceIconText}>{category.slice(0, 2).toUpperCase()}</Text></View>
        <View style={styles.serviceCopy}>
          <Text style={styles.serviceTitle}>{service.nom}</Text>
          <Text style={styles.serviceMeta}>{category}{service.dureeMinutes ? ` - ${service.dureeMinutes} min` : ''}</Text>
        </View>
      </View>
      {service.description ? <Text style={styles.description}>{service.description}</Text> : null}
      <AppButton onPress={onBook}>Reserver</AppButton>
    </View>
  );
}

/** Cet ecran affiche les prestations d'un garage pour demarrer une reservation. */
export function GarageDetailScreen({ navigation, route }: GarageDetailScreenProps) {
  const { garageId } = route.params;
  const [garage, setGarage] = useState<Garage | null>(null);
  const [services, setServices] = useState<ServicePrestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { Promise.all([getGarage(garageId), getGarageServices(garageId)]).then(([loadedGarage, loadedServices]) => { setGarage(loadedGarage); setServices(loadedServices.filter((service) => service.actif !== false)); }).catch((exception: Error) => setError(exception.message)).finally(() => setLoading(false)); }, [garageId]);

  return (
    <ScreenContainer>
      <MobileHeader showBack title={garage?.nom ?? 'Detail garage'} subtitle="Garage partenaire" onBack={() => navigation.goBack()} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {garage ? (
        <View style={styles.identityCard}>
          <GarageCover large name={garage.nom} />
          <View style={styles.identityCopy}>
            <Text style={styles.title}>{garage.nom}</Text>
            <Text style={styles.meta}>{garageAddress(garage) || 'Adresse non renseignee'}</Text>
            <Text style={styles.meta}>{garage.telephone ?? 'Telephone non renseigne'}</Text>
            <Text style={styles.description}>{garage.description ?? 'Ce garage pourra completer sa description depuis le dashboard.'}</Text>
          </View>
        </View>
      ) : null}
      {garage ? (
        <View style={styles.hoursCard}>
          <Text style={styles.hoursTitle}>Horaires d'ouverture</Text>
          {groupDaySchedules(buildDaySchedules(garage.openingHours)).map((group) => (
            <View key={group.label} style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{group.label}</Text>
              <Text style={[styles.hoursSchedule, group.schedule === CLOSED_LABEL && styles.hoursClosed]}>{group.schedule}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <SectionHeader title="Prestations disponibles" />
      {!loading && !error && services.length === 0 ? <EmptyState title="Aucune prestation" message="Ce garage n'a pas encore de prestation active." /> : null}
      {services.map((service) => <ServiceMarketplaceCard key={service.id} service={service} onBook={() => navigation.navigate('Booking', { garageId, serviceId: service.id, serviceName: service.nom })} />)}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  description: { color: colors.muted, fontSize: typography.secondary, lineHeight: 18 },
  hoursCard: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.xs, padding: spacing.md },
  hoursClosed: { color: colors.danger, fontWeight: '800' },
  hoursDay: { color: colors.text, fontSize: typography.secondary, fontWeight: '700' },
  hoursRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  hoursSchedule: { color: colors.muted, fontSize: typography.secondary },
  hoursTitle: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900', marginBottom: spacing.xs },
  identityCard: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  identityCopy: { gap: spacing.xs },
  meta: { color: colors.muted, fontSize: typography.secondary },
  serviceCard: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  serviceCopy: { flex: 1, gap: spacing.xs },
  serviceHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  serviceIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 8, height: 42, justifyContent: 'center', width: 42 },
  serviceIconText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  serviceMeta: { color: colors.muted, fontSize: typography.secondary },
  serviceTitle: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
  title: { color: colors.text, fontSize: 19, fontWeight: '900' },
});
