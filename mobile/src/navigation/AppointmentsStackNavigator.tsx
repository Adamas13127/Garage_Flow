/*
 * Ce fichier declare la pile de navigation des rendez-vous GarageFlow mobile.
 * Il existe pour passer de la liste au detail d'un rendez-vous client.
 * Il communique avec MainTabs, AppointmentsScreen et AppointmentDetailScreen.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppointmentDetailScreen } from '../screens/AppointmentDetailScreen';
import { AppointmentsScreen } from '../screens/AppointmentsScreen';

export type AppointmentsStackParamList = { AppointmentsList: undefined; AppointmentDetail: { appointmentId: number } };

const Stack = createNativeStackNavigator<AppointmentsStackParamList>();

/** Cette pile garde le parcours rendez-vous dans l'onglet rendez-vous. */
export function AppointmentsStackNavigator() {
  return <Stack.Navigator><Stack.Screen name="AppointmentsList" component={AppointmentsScreen} options={{ headerShown: false, title: 'Rendez-vous' }} /><Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Detail rendez-vous' }} /></Stack.Navigator>;
}
