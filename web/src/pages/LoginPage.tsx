/*
 * Ce fichier declare la page de connexion du frontend web GarageFlow.
 * Il existe pour permettre aux gerants et employes de se connecter au dashboard garage.
 * Il communique avec AuthContext, React Router et l'API /api/auth/login.
 */
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../components/feedback/ErrorMessage';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

/** Cette page affiche le formulaire email/mot de passe et redirige apres connexion. */
export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Connexion impossible pour le moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md" title="Connexion garage" description="Accedez au tableau de bord GarageFlow.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? <ErrorMessage message={error} /> : null}
          <Input label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Mot de passe" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </Card>
    </main>
  );
}