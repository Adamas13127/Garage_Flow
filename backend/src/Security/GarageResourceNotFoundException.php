<?php

/*
 * Ce fichier declare l'exception GarageResourceNotFoundException du backend GarageFlow.
 * Il existe pour masquer les ressources qui n'appartiennent pas au garage connecte.
 * Il communique avec les services de gestion garage et les controleurs pour retourner une erreur HTTP 404.
 */

namespace App\Security;

use RuntimeException;

/** Cette exception indique qu'une ressource de garage est introuvable pour ce garage. */
class GarageResourceNotFoundException extends RuntimeException
{
}