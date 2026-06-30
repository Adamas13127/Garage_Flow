/*
 * Ce fichier declare les onglets principaux de GarageFlow mobile.
 * Il existe pour organiser les ecrans client une fois connecte.
 * Il communique avec AppNavigator et les navigateurs de parcours client.
 */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { AppointmentsStackNavigator } from './AppointmentsStackNavigator';
import { GaragesStackNavigator } from './GaragesStackNavigator';
import { HomeScreen } from '../screens/HomeScreen';
import { InterventionsStackNavigator } from './InterventionsStackNavigator';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { VehiclesScreen } from '../screens/VehiclesScreen';
import { colors } from '../utils/theme';

export type MainTabsParamList = { Home: undefined; Garages: undefined; Vehicles: undefined; Appointments: undefined; Interventions: undefined; Notifications: undefined; Profile: undefined };
type IoniconName = ComponentProps<typeof Ionicons>['name'];
type VisibleTabName = 'Home' | 'Garages' | 'Appointments' | 'Interventions' | 'Profile';

export const visibleMainTabs: { name: VisibleTabName; label: string; icon: IoniconName }[] = [
  { name: 'Home', label: 'Accueil', icon: 'home-outline' },
  { name: 'Garages', label: 'Garages', icon: 'car-sport-outline' },
  { name: 'Appointments', label: 'RDV', icon: 'calendar-outline' },
  { name: 'Interventions', label: 'Suivi', icon: 'construct-outline' },
  { name: 'Profile', label: 'Profil', icon: 'person-outline' },
];

const Tab = createBottomTabNavigator<MainTabsParamList>();

/** Cette fonction choisit une icone claire pour eviter les triangles par defaut du navigateur. */
export function tabIconFor(routeName: string): IoniconName {
  return visibleMainTabs.find((tab) => tab.name === routeName)?.icon ?? 'ellipse-outline';
}

/** Ce navigateur garde cinq onglets visibles pour simplifier le parcours client. */
export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({ tabBarActiveTintColor: colors.primary, tabBarIcon: ({ color, size }) => <Ionicons color={color} name={tabIconFor(route.name)} size={size} />, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' }, tabBarStyle: { minHeight: 62, paddingBottom: 5, paddingTop: 5 }, headerTitleStyle: { color: colors.text, fontSize: 17 } })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil', tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Garages" component={GaragesStackNavigator} options={{ title: 'Garages', tabBarLabel: 'Garages', headerShown: false }} />
      <Tab.Screen name="Appointments" component={AppointmentsStackNavigator} options={{ title: 'RDV', tabBarLabel: 'RDV', headerShown: false }} />
      <Tab.Screen name="Interventions" component={InterventionsStackNavigator} options={{ title: 'Suivi', tabBarLabel: 'Suivi', headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil', tabBarLabel: 'Profil' }} />
      <Tab.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Autos', tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Alertes', tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
    </Tab.Navigator>
  );
}
