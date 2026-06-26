<?php

/*
 * Ce fichier declare le DTO CreateVehicleRequest du backend GarageFlow.
 * Il existe pour transporter et valider les donnees envoyees lors de la creation d'un vehicule client.
 * Il communique avec VehicleController, le validator Symfony et VehicleService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Ce DTO represente les informations obligatoires et optionnelles pour creer un vehicule.
 */
class CreateVehicleRequest
{
    #[Assert\NotBlank(message: 'La marque est obligatoire.')]
    #[Assert\Length(max: 100, maxMessage: 'La marque ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $marque = null;

    #[Assert\NotBlank(message: 'Le modele est obligatoire.')]
    #[Assert\Length(max: 100, maxMessage: 'Le modele ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $modele = null;

    #[Assert\NotBlank(message: 'La plaque d immatriculation est obligatoire.')]
    #[Assert\Length(max: 20, maxMessage: 'La plaque ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $plaqueImmatriculation = null;

    #[Assert\PositiveOrZero(message: 'Le kilometrage doit etre positif ou egal a zero.')]
    public ?int $kilometrage = null;

    #[Assert\GreaterThanOrEqual(value: 1900, message: 'L annee doit etre superieure ou egale a {{ compared_value }}.')]
    public ?int $annee = null;

    #[Assert\Length(max: 50, maxMessage: 'Le carburant ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $carburant = null;

    /** Cette methode verifie que l'annee du vehicule reste coherente pour le jury et la base de donnees. */
    #[Assert\Callback]
    public function validateYear(ExecutionContextInterface $context): void
    {
        if ($this->annee !== null && $this->annee > ((int) date('Y') + 1)) {
            $context->buildViolation('L annee ne peut pas etre superieure a l annee prochaine.')
                ->atPath('annee')
                ->addViolation();
        }
    }
}