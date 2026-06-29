/*
 * Ce fichier declare les onglets principaux de GarageFlow mobile.
 * Il existe pour organiser les ecrans client une fois connecte.
 * Il communique avec AppNavigator et les navigateurs de parcours client.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppointmentsStackNavigator } from './AppointmentsStackNavigator';
import { GaragesStackNavigator } from './GaragesStackNavigator';
import { HomeScreen } from '../screens/HomeScreen';
import { InterventionsStackNavigator } from './InterventionsStackNavigator';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { VehiclesScreen } from '../screens/VehiclesScreen';
import { colors } from '../utils/theme';

export type MainTabsParamList = { Home: undefined; Garages: undefined; Vehicles: undefined; Appointments: undefined; Interventions: undefined; Notifications: undefined; Profile: undefined };

const Tab = createBottomTabNavigator<MainTabsParamList>();

/** Ce navigateur donne acces aux principales zones client du MVP. */
export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' }, tabBarStyle: { minHeight: 58, paddingBottom: 4, paddingTop: 4 }, headerTitleStyle: { color: colors.text, fontSize: 17 } }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil', tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Garages" component={GaragesStackNavigator} options={{ title: 'Garages', tabBarLabel: 'Garages', headerShown: false }} />
      <Tab.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Autos', tabBarLabel: 'Autos' }} />
      <Tab.Screen name="Appointments" component={AppointmentsStackNavigator} options={{ title: 'RDV', tabBarLabel: 'RDV', headerShown: false }} />
      <Tab.Screen name="Interventions" component={InterventionsStackNavigator} options={{ title: 'Suivi', tabBarLabel: 'Suivi', headerShown: false }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Alertes', tabBarLabel: 'Alertes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil', tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}