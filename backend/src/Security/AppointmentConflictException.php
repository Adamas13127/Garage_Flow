<?php

/*
 * Ce fichier declare l'exception AppointmentConflictException du backend GarageFlow.
 * Il existe pour signaler qu'une demande de rendez-vous contredit les regles metier de disponibilite.
 * Il communique avec AppointmentService et les controleurs pour retourner une erreur HTTP 409.
 */

namespace App\Security;

use RuntimeException;

/** Cette exception indique qu'un creneau est indisponible ou qu'une annulation est impossible. */
class AppointmentConflictException extends RuntimeException
{
}