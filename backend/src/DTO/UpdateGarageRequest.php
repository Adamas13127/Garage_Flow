<?php

/*
 * Ce fichier declare le DTO UpdateGarageRequest du backend GarageFlow.
 * Il existe pour valider les donnees envoyees lors de la modification du garage du gerant.
 * Il communique avec GarageManagementController, le validator Symfony et GarageManagementService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class UpdateGarageRequest
{
    #[Assert\Length(max: 150)] public ?string $nom = null;
    #[Assert\Length(max: 255)] public ?string $adresse = null;
    #[Assert\Length(max: 100)] public ?string $ville = null;
    #[Assert\Length(max: 20)] public ?string $codePostal = null;
    #[Assert\Length(max: 30)] public ?string $telephone = null;
    #[Assert\Email] #[Assert\Length(max: 180)] public ?string $email = null;
    public ?string $description = null;
    #[Assert\Length(max: 255)] public ?string $logoUrl = null;
    public ?bool $actif = null;
    /** @var array<string, bool> */
    private array $providedFields = [];

    public function markProvided(string $field): void
    {
        $this->providedFields[$field] = true;
    }

    public function hasProvided(string $field): bool
    {
        return isset($this->providedFields[$field]);
    }

    #[Assert\Callback]
    public function validateRequiredStrings(ExecutionContextInterface $context): void
    {
        foreach (['nom', 'adresse', 'ville', 'codePostal'] as $field) {
            if ($this->hasProvided($field) && '' === trim((string) $this->$field)) {
                $context->buildViolation('Ce champ ne peut pas etre vide.')->atPath($field)->addViolation();
            }
        }
    }
}
