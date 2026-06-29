/*
 * Ce fichier declare la page des rendez-vous garage du frontend GarageFlow.
 * Il existe pour afficher les demandes et rendez-vous rattaches au garage connecte.
 * Il communique avec appointmentApi.ts et le layout garage.
 */
import { useEffect, useState } from 'react';
import { getGarageAppointments } from '../api/appointmentApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Appointment } from '../types/appointment';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../utils/format';

/** Cette page charge les rendez-vous du garage et les affiche dans un tableau lisible. */
export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);
        setError(null);
        setAppointments(await getGarageAppointments());
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
      <PageHeader title="Rendez-vous" description="Demandes et rendez-vous du garage connecte." />
      {loading ? <LoadingState label="Chargement des rendez-vous" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && appointments.length === 0 ? <EmptyState title="Aucun rendez-vous" description="Les demandes clients apparaitront ici des qu'elles seront creees." /> : null}
      {!loading && !error && appointments.length > 0 ? (
        <DataTable
          columns={[
            { key: 'client', header: 'Client', render: (appointment) => <span className="font-medium text-slate-950">{formatUserName(appointment.client)}</span> },
            { key: 'vehicle', header: 'Vehicule', render: (appointment) => formatVehicle(appointment.vehicle ?? appointment.vehicule) },
            { key: 'service', header: 'Prestation', render: (appointment) => formatService(appointment.service ?? appointment.prestation) },
            { key: 'date', header: 'Date debut', render: (appointment) => formatDateTime(appointment.dateDebut) },
            { key: 'status', header: 'Statut', render: (appointment) => <StatusBadge status={appointment.statut} /> },
            { key: 'comment', header: 'Commentaire', render: (appointment) => appointment.commentaireClient ?? <span className="text-slate-400">Aucun</span> },
          ]}
          getKey={(appointment) => appointment.id}
          items={appointments}
        />
      ) : null}
    </div>
  );
}