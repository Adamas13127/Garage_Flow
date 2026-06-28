<?php

/*
 * Ce fichier declare l'exception InvalidAppointmentRequestException du backend GarageFlow.
 * Il existe pour signaler une date ou une donnee de rendez-vous invalide apres validation du DTO.
 * Il communique avec les services de rendez-vous et les controleurs pour retourner une erreur HTTP 400.
 */

namespace App\Security;

use RuntimeException;

/** Cette exception indique qu'une donnee de rendez-vous ne peut pas etre interpretee correctement. */
class InvalidAppointmentRequestException extends RuntimeException
{
}