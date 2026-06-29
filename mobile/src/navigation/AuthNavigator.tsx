/*
 * Ce fichier declare la navigation publique de GarageFlow mobile.
 * Il existe pour afficher Login et Register quand le client n'est pas connecte.
 * Il communique avec AppNavigator.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

export type AuthStackParamList = { Login: undefined; Register: undefined };

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Ce navigateur contient uniquement les ecrans accessibles sans session. */
export function AuthNavigator() {
  return <Stack.Navigator><Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} /><Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} /></Stack.Navigator>;
}