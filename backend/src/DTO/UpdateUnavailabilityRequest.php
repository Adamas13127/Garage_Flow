<?php

/*
 * Ce fichier declare le DTO UpdateUnavailabilityRequest du backend GarageFlow.
 * Il existe pour valider la modification d'une indisponibilite exceptionnelle.
 * Il communique avec GarageManagementController, le validator Symfony et UnavailabilityService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente les champs modifiables d'une indisponibilite. */
class UpdateUnavailabilityRequest
{
    public ?string $dateDebut = null;
    public ?string $dateFin = null;
    #[Assert\Length(max: 255)] public ?string $motif = null;
    private array $providedFields = [];
    public function markProvided(string $field): void { $this->providedFields[$field] = true; }
    public function hasProvided(string $field): bool { return isset($this->providedFields[$field]); }
}