<?php

/*
 * Ce fichier declare le service GarageManagementService du backend GarageFlow.
 * Il existe pour garantir qu'un utilisateur gere uniquement son garage rattache.
 * Il communique avec User, Garage et Doctrine ORM.
 */

namespace App\Service;

use App\DTO\UpdateGarageRequest;
use App\Entity\Garage;
use App\Entity\User;
use App\Security\GarageNotFoundException;
use Doctrine\ORM\EntityManagerInterface;

class GarageManagementService
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function getGarageForUser(User $user): Garage
    {
        $garage = $user->getGarage();
        if (!$garage instanceof Garage) {
            throw new GarageNotFoundException('Aucun garage n est rattache a cet utilisateur.');
        }

        return $garage;
    }

    public function updateGarage(Garage $garage, UpdateGarageRequest $request): Garage
    {
        foreach (['nom', 'adresse', 'ville', 'codePostal', 'telephone', 'email', 'description', 'logoUrl', 'actif'] as $field) {
            if (!$request->hasProvided($field)) {
                continue;
            }

            $setter = 'set'.ucfirst($field);
            $value = $request->$field;
            if (is_string($value)) {
                $value = trim($value);
            }
            if (in_array($field, ['telephone', 'email', 'description', 'logoUrl'], true) && '' === $value) {
                $value = null;
            }
            $garage->$setter($value);
        }

        $garage->setUpdatedAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $garage;
    }
}
