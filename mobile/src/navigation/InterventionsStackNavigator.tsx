/*
 * Ce fichier declare la pile de navigation des interventions GarageFlow mobile.
 * Il existe pour passer de la liste au detail du suivi de reparation.
 * Il communique avec MainTabs, InterventionsScreen et InterventionDetailScreen.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InterventionDetailScreen } from '../screens/InterventionDetailScreen';
import { InterventionsScreen } from '../screens/InterventionsScreen';

export type InterventionsStackParamList = { InterventionsList: undefined; InterventionDetail: { interventionId: number } };

const Stack = createNativeStackNavigator<InterventionsStackParamList>();

/** Cette pile garde le parcours suivi reparation dans l'onglet interventions. */
export function InterventionsStackNavigator() {
  return <Stack.Navigator><Stack.Screen name="InterventionsList" component={InterventionsScreen} options={{ title: 'Reparations' }} /><Stack.Screen name="InterventionDetail" component={InterventionDetailScreen} options={{ title: 'Suivi reparation' }} /></Stack.Navigator>;
}