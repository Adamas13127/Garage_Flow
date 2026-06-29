/*
 * Ce fichier declare les onglets principaux de GarageFlow mobile.
 * Il existe pour organiser les ecrans client une fois connecte.
 * Il communique avec AppNavigator et les screens client.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';
import { GaragesScreen } from '../screens/GaragesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InterventionsScreen } from '../screens/InterventionsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { VehiclesScreen } from '../screens/VehiclesScreen';
import { colors } from '../utils/theme';

export type MainTabsParamList = { Home: undefined; Garages: undefined; Vehicles: undefined; Appointments: undefined; Interventions: undefined; Notifications: undefined; Profile: undefined };

const Tab = createBottomTabNavigator<MainTabsParamList>();

/** Ce navigateur donne acces aux principales zones client du MVP. */
export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary, tabBarLabelStyle: { fontSize: 11 }, headerTitleStyle: { color: colors.text } }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Garages" component={GaragesScreen} options={{ title: 'Garages' }} />
      <Tab.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Vehicules' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Rendez-vous' }} />
      <Tab.Screen name="Interventions" component={InterventionsScreen} options={{ title: 'Reparations' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}