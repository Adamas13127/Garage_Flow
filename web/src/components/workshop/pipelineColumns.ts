/*
 * Ce fichier centralise les colonnes du pipeline atelier GarageFlow.
 * Il existe pour partager les statuts entre la vue pipeline et les cartes sans melanger constantes et composants.
 * Il communique avec WorkshopPipeline et InterventionPipelineCard.
 */
export const pipelineColumns = [
  { code: 'VEHICULE_DEPOSE', title: 'Depose' },
  { code: 'DIAGNOSTIC_EN_COURS', title: 'Diagnostic' },
  { code: 'ATTENTE_VALIDATION_CLIENT', title: 'Validation client' },
  { code: 'REPARATION_EN_COURS', title: 'Reparation' },
  { code: 'VEHICULE_PRET', title: 'Pret' },
  { code: 'VEHICULE_RECUPERE', title: 'Recupere' },
];
