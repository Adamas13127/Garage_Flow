<?php

/*
 * Ce fichier declare le DTO AvailableSlotsRequest du backend GarageFlow.
 * Il existe pour valider les parametres de recherche de creneaux disponibles d'un garage.
 * Il communique avec AvailabilityController, Symfony Validator et AvailabilityService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente les criteres permettant de calculer les creneaux disponibles. */
class AvailableSlotsRequest
{
    #[Assert\NotNull(message: 'La prestation est obligatoire.')]
    #[Assert\Positive(message: 'La prestation doit etre valide.')]
    public ?int $serviceId = null;

    #[Assert\NotBlank(message: 'La date est obligatoire.')]
    public ?string $date = null;
}