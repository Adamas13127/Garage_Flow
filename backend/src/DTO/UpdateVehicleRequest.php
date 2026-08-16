<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

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

    public function markProvided(string $field): void
    {
        $this->providedFields[$field] = true;
    }

    public function hasProvided(string $field): bool
    {
        return isset($this->providedFields[$field]);
    }

    /** Cette methode refuse les champs texte vides quand ils sont fournis dans une modification. */
    #[Assert\Callback]
    public function validateProvidedValues(ExecutionContextInterface $context): void
    {
        foreach (['marque', 'modele', 'plaqueImmatriculation'] as $field) {
            if ($this->hasProvided($field) && '' === trim((string) $this->$field)) {
                $context->buildViolation('Ce champ ne peut pas etre vide.')
                    ->atPath($field)
                    ->addViolation();
            }
        }

        if (null !== $this->annee && $this->annee > ((int) date('Y') + 1)) {
            $context->buildViolation('L annee ne peut pas etre superieure a l annee prochaine.')
                ->atPath('annee')
                ->addViolation();
        }
    }
}
