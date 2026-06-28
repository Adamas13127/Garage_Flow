<?php

/*
 * Ce fichier declare le service GarageCatalogService du backend GarageFlow.
 * Il existe pour gerer la consultation publique des garages actifs.
 * Il communique avec les repositories Garage, ServicePrestation, OpeningHour et Unavailability.
 */

namespace App\Service;

use App\Entity\Garage;
use App\Repository\GarageRepository;
use App\Repository\OpeningHourRepository;
use App\Repository\ServicePrestationRepository;
use App\Repository\UnavailabilityRepository;
use App\Security\GarageNotFoundException;

/** Ce service contient la logique de consultation publique des garages actifs. */
class GarageCatalogService
{
    public function __construct(
        private readonly GarageRepository $garageRepository,
        private readonly ServicePrestationRepository $servicePrestationRepository,
        private readonly OpeningHourRepository $openingHourRepository,
        private readonly UnavailabilityRepository $unavailabilityRepository,
    ) {
    }

    /** Cette methode retourne tous les garages actifs visibles par les clients. */
    public function getActiveGarages(): array
    {
        return $this->garageRepository->findActiveGarages();
    }

    /** Cette methode retourne un garage actif ou une erreur 404 s'il n'est pas public. */
    public function getActiveGarage(int $id): Garage
    {
        $garage = $this->garageRepository->findActiveGarageById($id);
        if (!$garage instanceof Garage) {
            throw new GarageNotFoundException('Garage introuvable.');
        }

        return $garage;
    }

    /** Cette methode retourne les prestations actives d'un garage public. */
    public function getActiveServices(Garage $garage): array
    {
        return $this->servicePrestationRepository->findActiveServicesByGarage($garage);
    }

    /** Cette methode retourne les horaires actifs d'un garage public. */
    public function getActiveOpeningHours(Garage $garage): array
    {
        return $this->openingHourRepository->findActiveByGarage($garage);
    }

    /** Cette methode retourne les futures indisponibilites utiles au detail public. */
    public function getFutureUnavailabilities(Garage $garage): array
    {
        return $this->unavailabilityRepository->findFutureByGarage($garage);
    }
}