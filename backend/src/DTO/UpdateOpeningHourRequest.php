<?php

/*
 * Ce fichier declare le DTO UpdateOpeningHourRequest du backend GarageFlow.
 * Il existe pour valider la modification d'une plage horaire recurrente.
 * Il communique avec GarageManagementController, le validator Symfony et OpeningHourService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente les champs modifiables d'une plage horaire. */
class UpdateOpeningHourRequest
{
    #[Assert\Range(min: 1, max: 7, notInRangeMessage: 'Le jour doit etre entre {{ min }} et {{ max }}.')]
    public ?int $jourSemaine = null;
    public ?string $heureDebut = null;
    public ?string $heureFin = null;
    public ?bool $actif = null;
    private array $providedFields = [];
    public function markProvided(string $field): void { $this->providedFields[$field] = true; }
    public function hasProvided(string $field): bool { return isset($this->providedFields[$field]); }
}