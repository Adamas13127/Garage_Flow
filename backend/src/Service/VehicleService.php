<?php

/*
 * Ce fichier declare le service VehicleService du backend GarageFlow.
 * Il existe pour regrouper la logique metier de gestion des vehicules d'un client connecte.
 * Il communique avec VehicleRepository, Doctrine ORM et l'entite User pour garantir l'isolation des donnees.
 */

namespace App\Service;

use App\DTO\CreateVehicleRequest;
use App\DTO\UpdateVehicleRequest;
use App\Entity\User;
use App\Entity\Vehicle;
use App\Repository\VehicleRepository;
use App\Security\DuplicateVehiclePlateException;
use App\Security\VehicleNotFoundException;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Ce service contient la logique metier qui garantit qu'un client ne peut gerer que ses propres vehicules.
 */
class VehicleService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly VehicleRepository $vehicleRepository,
    ) {
    }

    public function createVehicle(User $client, CreateVehicleRequest $request): Vehicle
    {
        $plate = $this->normalizePlate((string) $request->plaqueImmatriculation);
        $this->assertPlateIsUniqueForClient($client, $plate);

        $vehicle = new Vehicle();
        $vehicle->setClient($client);
        $vehicle->setMarque(trim((string) $request->marque));
        $vehicle->setModele(trim((string) $request->modele));
        $vehicle->setPlaqueImmatriculation($plate);
        $vehicle->setKilometrage($request->kilometrage);
        $vehicle->setAnnee($request->annee);
        $vehicle->setCarburant($this->nullableTrim($request->carburant));

        $this->entityManager->persist($vehicle);
        $this->entityManager->flush();

        return $vehicle;
    }

    /**
     * @return list<Vehicle>
     */
    public function getVehiclesForClient(User $client): array
    {
        return $this->vehicleRepository->findByClient($client);
    }

    public function getVehicleForClient(User $client, int $id): Vehicle
    {
        $vehicle = $this->vehicleRepository->findOneByClientAndId($client, $id);

        if (!$vehicle instanceof Vehicle) {
            throw new VehicleNotFoundException('Vehicule introuvable.');
        }

        return $vehicle;
    }

    /**
     * Cette methode modifie un vehicule du client connecte sans casser l'unicite de la plaque.
     */
    public function updateVehicle(User $client, int $id, UpdateVehicleRequest $request): Vehicle
    {
        $vehicle = $this->getVehicleForClient($client, $id);

        if ($request->hasProvided('plaqueImmatriculation')) {
            $plate = $this->normalizePlate((string) $request->plaqueImmatriculation);
            $this->assertPlateIsUniqueForClient($client, $plate, $vehicle);
            $vehicle->setPlaqueImmatriculation($plate);
        }

        if ($request->hasProvided('marque')) {
            $vehicle->setMarque(trim((string) $request->marque));
        }

        if ($request->hasProvided('modele')) {
            $vehicle->setModele(trim((string) $request->modele));
        }

        if ($request->hasProvided('kilometrage')) {
            $vehicle->setKilometrage($request->kilometrage);
        }

        if ($request->hasProvided('annee')) {
            $vehicle->setAnnee($request->annee);
        }

        if ($request->hasProvided('carburant')) {
            $vehicle->setCarburant($this->nullableTrim($request->carburant));
        }

        $vehicle->setUpdatedAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $vehicle;
    }

    public function deleteVehicle(User $client, int $id): void
    {
        $vehicle = $this->getVehicleForClient($client, $id);
        $this->entityManager->remove($vehicle);
        $this->entityManager->flush();
    }

    private function assertPlateIsUniqueForClient(User $client, string $plate, ?Vehicle $excludedVehicle = null): void
    {
        if ($this->vehicleRepository->existsByClientAndPlate($client, $plate, $excludedVehicle)) {
            throw new DuplicateVehiclePlateException('Un vehicule avec cette plaque existe deja pour ce client.');
        }
    }

    /** Cette methode normalise une plaque pour eviter les doublons dus aux espaces ou minuscules. */
    private function normalizePlate(string $plate): string
    {
        return mb_strtoupper(trim($plate));
    }

    /** Cette methode transforme une chaine vide en valeur nulle pour les champs optionnels. */
    private function nullableTrim(?string $value): ?string
    {
        if (null === $value) {
            return null;
        }

        $trimmed = trim($value);

        return '' === $trimmed ? null : $trimmed;
    }
}
