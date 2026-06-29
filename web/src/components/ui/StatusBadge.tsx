/*
 * Ce fichier declare le composant StatusBadge du frontend GarageFlow.
 * Il existe pour rendre les statuts rendez-vous et intervention plus lisibles.
 * Il communique avec les pages Dashboard, AppointmentsPage et InterventionsPage.
 */
interface StatusBadgeProps {
  status?: string | null;
}

const statusStyles: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-50 text-amber-800 ring-amber-200',
  CONFIRME: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  REFUSE: 'bg-rose-50 text-rose-800 ring-rose-200',
  ANNULE: 'bg-slate-100 text-slate-700 ring-slate-200',
  TERMINE: 'bg-blue-50 text-blue-800 ring-blue-200',
  VEHICULE_DEPOSE: 'bg-sky-50 text-sky-800 ring-sky-200',
  DIAGNOSTIC_EN_COURS: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  ATTENTE_VALIDATION_CLIENT: 'bg-amber-50 text-amber-800 ring-amber-200',
  REPARATION_EN_COURS: 'bg-purple-50 text-purple-800 ring-purple-200',
  VEHICULE_PRET: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  VEHICULE_RECUPERE: 'bg-slate-100 text-slate-700 ring-slate-200',
};

/** Cette fonction transforme un code technique en libelle lisible pour le jury et l'utilisateur. */
function formatStatus(status?: string | null): string {
  if (!status) {
    return 'Non renseigne';
  }

  return status.toLowerCase().replace(/_/g, ' ').replace(/^\p{L}/u, (letter) => letter.toUpperCase());
}

/** Ce composant affiche un badge colore pour comprendre rapidement l'etat d'un element. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const style = status ? statusStyles[status] : undefined;

  return (
    <span className={`inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style ?? 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {formatStatus(status)}
    </span>
  );
}