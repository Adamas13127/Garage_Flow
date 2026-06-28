<?php

/*
 * Ce fichier declare le DTO CreateUnavailabilityRequest du backend GarageFlow.
 * Il existe pour valider la creation d'une indisponibilite exceptionnelle.
 * Il communique avec GarageManagementController, le validator Symfony et UnavailabilityService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente les donnees necessaires pour creer une indisponibilite. */
class CreateUnavailabilityRequest
{
    #[Assert\NotBlank(message: 'La date de debut est obligatoire.')]
    public ?string $dateDebut = null;
    #[Assert\NotBlank(message: 'La date de fin est obligatoire.')]
    public ?string $dateFin = null;
    #[Assert\Length(max: 255)]
    public ?string $motif = null;
}