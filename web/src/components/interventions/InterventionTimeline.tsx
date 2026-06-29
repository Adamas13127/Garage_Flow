/*
 * Ce fichier declare la timeline de suivi atelier pour une intervention.
 * Il existe pour expliquer visuellement les etapes passees, actuelle et futures dans le detail intervention.
 * Il communique avec InterventionDetailPanel et les statuts de reference de l'atelier.
 */
import { getStepIndex, interventionSteps } from './interventionSteps';

interface InterventionTimelineProps {
  currentStatus?: string | null;
}

/** Cette timeline transforme le statut actuel en progression lisible pour le jury et le gerant. */
export function InterventionTimeline({ currentStatus }: InterventionTimelineProps) {
  const currentIndex = getStepIndex(currentStatus);

  return (
    <ol className="space-y-2">
      {interventionSteps.map((step, index) => {
        const state = index < currentIndex ? 'Passe' : index === currentIndex ? 'Actuel' : 'A venir';
        const style = index < currentIndex
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : index === currentIndex
            ? 'border-sky-200 bg-sky-50 text-sky-800'
            : 'border-slate-200 bg-white text-slate-500';

        return (
          <li className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${style}`} key={step.code}>
            <span className="font-medium">{step.label}</span>
            <span className="text-xs font-semibold">{state}</span>
          </li>
        );
      })}
    </ol>
  );
}
