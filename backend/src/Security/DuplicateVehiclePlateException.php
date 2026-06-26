<?php

/*
 * Ce fichier declare l'exception DuplicateVehiclePlateException du backend GarageFlow.
 * Il existe pour signaler qu'un client possede deja un vehicule avec la meme plaque.
 * Il communique avec VehicleService et VehicleController afin de retourner une erreur HTTP 409.
 */

namespace App\Security;

use RuntimeException;

/**
 * Cette exception indique que la plaque existe deja pour le client connecte.
 */
class DuplicateVehiclePlateException extends RuntimeException
{
}