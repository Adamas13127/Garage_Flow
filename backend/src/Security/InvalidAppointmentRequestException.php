<?php

/*
 * Ce fichier declare l'exception InvalidAppointmentRequestException du backend GarageFlow.
 * Il existe pour signaler une date ou une donnee de rendez-vous invalide apres validation du DTO.
 * Il communique avec les services de rendez-vous et les controleurs pour retourner une erreur HTTP 400.
 */

namespace App\Security;

class InvalidAppointmentRequestException extends \RuntimeException
{
}
