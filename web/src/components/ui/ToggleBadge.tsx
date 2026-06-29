/*
 * Ce fichier declare le composant ToggleBadge du frontend GarageFlow.
 * Il existe pour afficher clairement si un element de configuration est actif ou inactif.
 * Il communique avec GarageSettingsPage.
 */
interface ToggleBadgeProps {
  active?: boolean;
}

/** Ce badge traduit un booleen technique en etat lisible pour le garage. */
export function ToggleBadge({ active }: ToggleBadgeProps) {
  return <span className={`rounded-md px-2 py-1 text-xs font-semibold ${active === false ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-800'}`}>{active === false ? 'Inactif' : 'Actif'}</span>;
}