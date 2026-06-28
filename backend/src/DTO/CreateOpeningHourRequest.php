<?php

/*
 * Ce fichier declare le DTO CreateOpeningHourRequest du backend GarageFlow.
 * Il existe pour valider la creation d'une plage horaire recurrente.
 * Il communique avec GarageManagementController, le validator Symfony et OpeningHourService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente les donnees necessaires pour creer une plage horaire. */
class CreateOpeningHourRequest
{
    #[Assert\NotNull(message: 'Le jour est obligatoire.')]
    #[Assert\Range(min: 1, max: 7, notInRangeMessage: 'Le jour doit etre entre {{ min }} et {{ max }}.')]
    public ?int $jourSemaine = null;
    #[Assert\NotBlank(message: 'L heure de debut est obligatoire.')]
    public ?string $heureDebut = null;
    #[Assert\NotBlank(message: 'L heure de fin est obligatoire.')]
    public ?string $heureFin = null;
    public ?bool $actif = true;
}