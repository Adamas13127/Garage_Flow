<?php

/*
 * Ce fichier declare le DTO CreateServicePrestationRequest du backend GarageFlow.
 * Il existe pour valider la creation d'une prestation de garage.
 * Il communique avec GarageManagementController, le validator Symfony et ServicePrestationService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente les donnees necessaires pour creer une prestation. */
class CreateServicePrestationRequest
{
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(max: 150)]
    public ?string $nom = null;
    public ?string $description = null;
    #[Assert\NotNull(message: 'La duree est obligatoire.')]
    #[Assert\Positive(message: 'La duree doit etre positive.')]
    public ?int $dureeMinutes = null;
    public ?bool $actif = true;
}