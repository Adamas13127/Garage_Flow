/*
 * Ce fichier declare l'ecran profil client mobile GarageFlow.
 * Il existe pour afficher les informations utilisateur et proposer la deconnexion.
 * Il communique avec AuthContext.
 */
import { Text } from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { useAuth } from '../hooks/useAuth';

/** Cet ecran affiche le compte client connecte. */
export function ProfileScreen() {
  const { logout, user } = useAuth();
  return <ScreenContainer><AppCard title={`${user?.prenom ?? ''} ${user?.nom ?? ''}`} subtitle={user?.email}><Text>{user?.telephone ?? 'Telephone non renseigne'}</Text></AppCard><AppButton variant="secondary" onPress={() => void logout()}>Se deconnecter</AppButton></ScreenContainer>;
}