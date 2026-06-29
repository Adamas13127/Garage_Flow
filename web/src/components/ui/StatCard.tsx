/*
 * Ce fichier declare le composant StatCard du frontend GarageFlow.
 * Il existe pour afficher les indicateurs chiffres du tableau de bord garage.
 * Il communique avec DashboardPage.
 */
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  helper?: string;
  icon?: ReactNode;
}

/** Cette carte met en avant un indicateur important pour le garage connecte. */
export function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        {icon ? <div className="rounded-md bg-sky-50 p-2 text-sky-700">{icon}</div> : null}
      </div>
      {helper ? <p className="mt-3 text-sm text-slate-500">{helper}</p> : null}
    </section>
  );
}