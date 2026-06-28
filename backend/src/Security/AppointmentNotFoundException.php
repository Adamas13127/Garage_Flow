<?php

/*
 * Ce fichier declare l'exception AppointmentNotFoundException du backend GarageFlow.
 * Il existe pour masquer les rendez-vous qui n'appartiennent pas au client connecte.
 * Il communique avec AppointmentService et le controleur client pour retourner une erreur HTTP 404.
 */

namespace App\Security;

use RuntimeException;

/** Cette exception indique que le rendez-vous demande est introuvable pour ce client. */
class AppointmentNotFoundException extends RuntimeException
{
}