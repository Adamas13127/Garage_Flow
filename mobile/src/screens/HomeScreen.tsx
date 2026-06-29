/*
 * Ce fichier declare l'ecran d'accueil client mobile GarageFlow.
 * Il existe pour presenter les raccourcis principaux du client connecte.
 * Il communique avec useAuth et MainTabs.
 */
import { Text } from 'react-native';
import { AppCard } from '../components/ui/AppCard';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../utils/theme';

/** Cet ecran affiche un message de bienvenue et les grandes zones de l'application. */
export function HomeScreen() {
  const { user } = useAuth();
  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Bonjour {user?.prenom} {user?.nom}</Text><AppCard title="Mes vehicules" subtitle="Retrouvez les vehicules rattaches a votre compte." /><AppCard title="Mes rendez-vous" subtitle="Suivez vos demandes et rendez-vous garage." /><AppCard title="Mes reparations" subtitle="Consultez l'avancement des interventions." /><AppCard title="Notifications" subtitle="Gardez un oeil sur les alertes importantes." /></ScreenContainer>;
}