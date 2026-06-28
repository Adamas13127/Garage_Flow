/*
 * Ce fichier declare la page des rendez-vous garage du frontend GarageFlow.
 * Il existe pour afficher les demandes et rendez-vous rattaches au garage connecte.
 * Il communique avec /api/garage/me/appointments via le client HTTP.
 */
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/httpClient';
import { ErrorMessage } from '../components/feedback/ErrorMessage';
import { LoadingState } from '../components/feedback/LoadingState';
import { Card } from '../components/ui/Card';
import type { Appointment } from '../types/appointment';

/** Cette page liste les rendez-vous garage sous forme simple pour preparer le dashboard metier. */
export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const response = await apiRequest<{ items: Appointment[] }>('/api/garage/me/appointments');
        setAppointments(response.items);
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : 'Impossible de charger les rendez-vous.');
      } finally {
        setLoading(false);
      }
    }

    void loadAppointments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Rendez-vous</h1>
        <p className="text-sm text-slate-500">Demandes et rendez-vous du garage connecte.</p>
      </div>
      {loading ? <LoadingState label="Chargement des rendez-vous" /> : null}
      {error ? <ErrorMessage message={error} /> : null}
      {!loading && !error && appointments.length === 0 ? <Card>Aucun rendez-vous pour le moment.</Card> : null}
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-950">#{appointment.id} - {appointment.client?.prenom} {appointment.client?.nom}</p>
                <p className="text-sm text-slate-500">{appointment.service?.nom} - {new Date(appointment.dateDebut).toLocaleString('fr-FR')}</p>
              </div>
              <span className="w-fit rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{appointment.statut}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}