<?php

/*
 * Ce fichier declare l'exception InterventionNotFoundException du backend GarageFlow.
 * Il existe pour masquer les interventions qui n'appartiennent pas au garage ou au client connecte.
 * Il communique avec les services intervention et les controleurs pour retourner une erreur HTTP 404.
 */

namespace App\Security;

use RuntimeException;

/** Cette exception indique qu'une intervention est introuvable dans le perimetre autorise. */
class InterventionNotFoundException extends RuntimeException
{
}