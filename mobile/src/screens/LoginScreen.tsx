/*
 * Ce fichier declare l'ecran de connexion mobile GarageFlow.
 * Il existe pour permettre au client de se connecter avec son email et mot de passe.
 * Il communique avec AuthContext et AuthNavigator.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ErrorState } from '../components/feedback/ErrorState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import { AppInput } from '../components/ui/AppInput';
import { useAuth } from '../hooks/useAuth';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { colors } from '../utils/theme';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

/** Cet ecran gere le formulaire de connexion client. */
export function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    try { setLoading(true); setError(null); await login(email, password); }
    catch (exception) { setError(exception instanceof Error ? exception.message : 'Connexion impossible.'); }
    finally { setLoading(false); }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}><Text style={styles.title}>GarageFlow</Text><Text style={styles.subtitle}>Connexion client</Text></View>
      {error ? <ErrorState message={error} /> : null}
      <AppInput label="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <AppInput label="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />
      <AppButton loading={loading} onPress={() => void handleLogin()}>Se connecter</AppButton>
      <AppButton variant="secondary" onPress={() => navigation.navigate('Register')}>Creer un compte</AppButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ header: { gap: 4, marginBottom: 8 }, title: { color: colors.primary, fontSize: 30, fontWeight: '800' }, subtitle: { color: colors.muted, fontSize: 16 } });