/*
 * Ce fichier declare la pile de navigation des garages mobile GarageFlow.
 * Il existe pour organiser le parcours Garages -> Detail -> Reservation.
 * Il communique avec MainTabs, GaragesScreen, GarageDetailScreen et BookingScreen.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookingScreen } from '../screens/BookingScreen';
import { GarageDetailScreen } from '../screens/GarageDetailScreen';
import { GaragesScreen } from '../screens/GaragesScreen';

export type GaragesStackParamList = {
  GaragesList: undefined;
  GarageDetail: { garageId: number };
  Booking: { garageId: number; serviceId: number; serviceName: string };
};

const Stack = createNativeStackNavigator<GaragesStackParamList>();

/** Cette stack garde le parcours de reservation clair et demonstrable. */
export function GaragesStackNavigator() {
  return <Stack.Navigator><Stack.Screen name="GaragesList" component={GaragesScreen} options={{ headerShown: false, title: 'Garages' }} /><Stack.Screen name="GarageDetail" component={GarageDetailScreen} options={{ headerShown: false, title: 'Detail garage' }} /><Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Reservation' }} /></Stack.Navigator>;
}
