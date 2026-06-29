/*
 * Ce fichier declare les statuts atelier partages par la page Interventions.
 * Il existe pour garder les libelles, les filtres et la timeline coherents dans l'interface web garage.
 * Il communique avec InterventionsPage, InterventionListCard et InterventionTimeline.
 */
export const interventionSteps = [
  { code: 'VEHICULE_DEPOSE', label: 'Vehicule depose' },
  { code: 'DIAGNOSTIC_EN_COURS', label: 'Diagnostic en cours' },
  { code: 'ATTENTE_VALIDATION_CLIENT', label: 'Attente validation client' },
  { code: 'REPARATION_EN_COURS', label: 'Reparation en cours' },
  { code: 'VEHICULE_PRET', label: 'Vehicule pret' },
  { code: 'VEHICULE_RECUPERE', label: 'Vehicule recupere' },
];

/** Cette fonction retrouve l'ordre d'un statut dans le parcours atelier. */
export function getStepIndex(status?: string | null): number {
  const index = interventionSteps.findIndex((step) => step.code === status);
  return index >= 0 ? index : 0;
}
