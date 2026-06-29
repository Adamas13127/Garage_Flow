/*
 * Ce fichier declare l'ecran d'inscription client mobile GarageFlow.
 * Il existe pour creer un compte client depuis l'application mobile.
 * Il communique avec AuthContext et AuthNavigator.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Text } from 'react-native';
import { ErrorState } from '../components/feedback/ErrorState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import { AppInput } from '../components/ui/AppInput';
import { useAuth } from '../hooks/useAuth';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { colors } from '../utils/theme';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

/** Cet ecran gere l'inscription minimale d'un client. */
export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { registerClient } = useAuth();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRegister() {
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    try { setLoading(true); setError(null); await registerClient({ nom, prenom, email, password }); setSuccess('Compte cree. Vous pouvez vous connecter.'); }
    catch (exception) { setError(exception instanceof Error ? exception.message : 'Inscription impossible.'); }
    finally { setLoading(false); }
  }

  return (
    <ScreenContainer>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>Creer un compte</Text>
      {error ? <ErrorState message={error} /> : null}
      {success ? <Text style={{ color: colors.success, fontWeight: '700' }}>{success}</Text> : null}
      <AppInput label="Nom" value={nom} onChangeText={setNom} />
      <AppInput label="Prenom" value={prenom} onChangeText={setPrenom} />
      <AppInput label="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <AppInput label="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />
      <AppInput label="Confirmation" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      <AppButton loading={loading} onPress={() => void handleRegister()}>S'inscrire</AppButton>
      <AppButton variant="secondary" onPress={() => navigation.navigate('Login')}>Aller a la connexion</AppButton>
    </ScreenContainer>
  );
}