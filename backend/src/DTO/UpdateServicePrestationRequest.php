<?php

/*
 * Ce fichier declare le DTO UpdateServicePrestationRequest du backend GarageFlow.
 * Il existe pour valider la modification d'une prestation de garage.
 * Il communique avec GarageManagementController, le validator Symfony et ServicePrestationService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/** Ce DTO represente les champs modifiables d'une prestation. */
class UpdateServicePrestationRequest
{
    #[Assert\Length(max: 150)] public ?string $nom = null;
    public ?string $description = null;
    #[Assert\Positive(message: 'La duree doit etre positive.')] public ?int $dureeMinutes = null;
    public ?bool $actif = null;
    private array $providedFields = [];
    public function markProvided(string $field): void { $this->providedFields[$field] = true; }
    public function hasProvided(string $field): bool { return isset($this->providedFields[$field]); }
    /** Cette methode refuse un nom vide quand il est fourni dans la modification. */
    #[Assert\Callback]
    public function validateProvidedName(ExecutionContextInterface $context): void
    {
        if ($this->hasProvided('nom') && trim((string) $this->nom) === '') {
            $context->buildViolation('Le nom ne peut pas etre vide.')->atPath('nom')->addViolation();
        }
    }
}