/*
 * Ce fichier regroupe les petites fonctions utiles pour lire les reponses API GarageFlow.
 * Il existe pour accepter les listes renvoyees directement ou enveloppees dans une cle items.
 * Il communique avec les modules API des rendez-vous, interventions et notifications.
 */

/** Cette fonction transforme une reponse API en tableau utilisable par les pages React. */
export function unwrapItems<T>(response: T[] | { items?: T[] }): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? [];
}