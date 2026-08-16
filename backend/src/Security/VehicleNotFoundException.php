<?php

/*
 * Ce fichier declare l'exception VehicleNotFoundException du backend GarageFlow.
 * Il existe pour masquer les vehicules qui n'appartiennent pas au client connecte.
 * Il communique avec VehicleService et VehicleController afin de retourner une erreur HTTP 404.
 */

namespace App\Security;

class VehicleNotFoundException extends \RuntimeException
{
}
