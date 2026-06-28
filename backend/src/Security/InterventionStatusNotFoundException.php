<?php

/*
 * Ce fichier declare l'exception InterventionStatusNotFoundException du backend GarageFlow.
 * Il existe pour signaler qu'un code de statut d'intervention n'existe pas en base.
 * Il communique avec GarageInterventionService et le controleur garage pour retourner une erreur HTTP 404.
 */

namespace App\Security;

use RuntimeException;

/** Cette exception indique que le statut d'intervention demande est introuvable. */
class InterventionStatusNotFoundException extends RuntimeException
{
}