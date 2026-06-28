<?php

/*
 * Ce fichier declare l'exception NotificationNotFoundException du backend GarageFlow.
 * Il existe pour masquer les notifications qui n'appartiennent pas a l'utilisateur connecte.
 * Il communique avec NotificationService et NotificationController pour retourner une erreur HTTP 404.
 */

namespace App\Security;

use RuntimeException;

/** Cette exception indique qu'une notification est introuvable pour l'utilisateur connecte. */
class NotificationNotFoundException extends RuntimeException
{
}