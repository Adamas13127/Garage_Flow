<?php

/*
 * Ce fichier declare l'exception InvalidGarageScheduleException du backend GarageFlow.
 * Il existe pour signaler une erreur metier sur les horaires ou indisponibilites.
 * Il communique avec OpeningHourService, UnavailabilityService et les controleurs pour retourner une erreur HTTP 400.
 */

namespace App\Security;

class InvalidGarageScheduleException extends \RuntimeException
{
}
