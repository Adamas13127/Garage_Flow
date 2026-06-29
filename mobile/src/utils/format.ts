/*
 * Ce fichier contient les fonctions de formatage de l'application mobile GarageFlow.
 * Il existe pour afficher simplement les dates et libelles dans les ecrans.
 * Il communique avec les ecrans de listes.
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return 'Non renseigne';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}