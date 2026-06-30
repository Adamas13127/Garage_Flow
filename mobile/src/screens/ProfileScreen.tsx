/*
 * Ce fichier declare l'ecran profil client mobile GarageFlow.
 * Il existe pour afficher les informations utilisateur et les acces de compte.
 * Il communique avec AuthContext et MainTabs.
 */
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { MobileHeader } from '../components/common/MobileHeader';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { useAuth } from '../hooks/useAuth';
import type { MainTabsParamList } from '../navigation/MainTabs';
import { colors, spacing, typography } from '../utils/theme';

type ProfileScreenProps = BottomTabScreenProps<MainTabsParamList, 'Profile'>;

/** Cet ecran affiche le compte client connecte et les raccourcis personnels. */
export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { logout, user } = useAuth();
  const fullName = `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim() || 'Client GarageFlow';
  return (
    <ScreenContainer>
      <MobileHeader title="Profil" subtitle="Compte client" onNotifications={() => navigation.navigate('Notifications')} />
      <AppCard title={fullName} subtitle={user?.email}>
        <Text style={styles.text}>{user?.telephone ?? 'Telephone non renseigne'}</Text>
      </AppCard>
      <View style={styles.actions}>
        <AppButton variant="secondary" onPress={() => navigation.navigate('Vehicles')}>Mes vehicules</AppButton>
        <AppButton variant="secondary" onPress={() => navigation.navigate('Notifications')}>Notifications</AppButton>
        <AppButton variant="ghost" onPress={() => void logout()}>Se deconnecter</AppButton>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  text: { color: colors.muted, fontSize: typography.body },
});
