/*
 * Ce fichier declare le composant racine de l'application mobile GarageFlow.
 * Il existe pour installer AuthProvider et la navigation principale.
 * Il communique avec src/navigation/AppNavigator.tsx.
 */
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

/** Ce composant assemble les providers necessaires a l'application mobile. */
export default function App() {
  return <SafeAreaProvider><AuthProvider><AppNavigator /></AuthProvider></SafeAreaProvider>;
}