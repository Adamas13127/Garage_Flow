<?php

/*
 * Ce fichier declare le DTO RefuseAppointmentRequest du backend GarageFlow.
 * Il existe pour valider le motif optionnel envoye quand le garage refuse un rendez-vous.
 * Il communique avec GarageAppointmentController, Symfony Validator et GarageAppointmentService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente les donnees optionnelles de refus d'un rendez-vous. */
class RefuseAppointmentRequest
{
    #[Assert\Length(max: 1000, maxMessage: 'Le motif de refus est trop long.')]
    public ?string $motifRefus = null;
}