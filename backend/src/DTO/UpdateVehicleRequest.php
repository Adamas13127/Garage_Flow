<?php

/*
 * Ce fichier declare le DTO UpdateVehicleRequest du backend GarageFlow.
 * Il existe pour transporter et valider les donnees envoyees lors de la modification d'un vehicule client.
 * Il communique avec VehicleController, le validator Symfony et VehicleService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Ce DTO represente les champs modifiables d'un vehicule, tous optionnels pour une requete PATCH.
 */
class UpdateVehicleRequest
{
    #[Assert\Length(max: 100, maxMessage: 'La marque ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $marque = null;

    #[Assert\Length(max: 100, maxMessage: 'Le modele ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $modele = null;

    #[Assert\Length(max: 20, maxMessage: 'La plaque ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $plaqueImmatriculation = null;

    #[Assert\PositiveOrZero(message: 'Le kilometrage doit etre positif ou egal a zero.')]
    public ?int $kilometrage = null;

    #[Assert\GreaterThanOrEqual(value: 1900, message: 'L annee doit etre superieure ou egale a {{ compared_value }}.')]
    public ?int $annee = null;

    #[Assert\Length(max: 50, maxMessage: 'Le carburant ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $carburant = null;

    /** @var array<string, bool> */
    private array $providedFields = [];

    /** Cette methode memorise quels champs etaient presents dans la requete PATCH. */
    public function markProvided(string $field): void
    {
        $this->providedFields[$field] = true;
    }

    /** Cette methode indique au service si un champ doit vraiment etre modifie. */
    public function hasProvided(string $field): bool
    {
        return isset($this->providedFields[$field]);
    }

    /** Cette methode refuse les champs texte vides quand ils sont fournis dans une modification. */
    #[Assert\Callback]
    public function validateProvidedValues(ExecutionContextInterface $context): void
    {
        foreach (['marque', 'modele', 'plaqueImmatriculation'] as $field) {
            if ($this->hasProvided($field) && trim((string) $this->$field) === '') {
                $context->buildViolation('Ce champ ne peut pas etre vide.')
                    ->atPath($field)
                    ->addViolation();
            }
        }

        if ($this->annee !== null && $this->annee > ((int) date('Y') + 1)) {
            $context->buildViolation('L annee ne peut pas etre superieure a l annee prochaine.')
                ->atPath('annee')
                ->addViolation();
        }
    }
}