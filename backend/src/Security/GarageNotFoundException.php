<?php

/*
 * Ce fichier declare l'exception GarageNotFoundException du backend GarageFlow.
 * Il existe pour signaler qu'un garage public ou rattache a un utilisateur est introuvable.
 * Il communique avec les services garage et les controleurs pour retourner une erreur HTTP 404.
 */

namespace App\Security;

use RuntimeException;

/** Cette exception indique que le garage demande est introuvable ou inaccessible. */
class GarageNotFoundException extends RuntimeException
{
}