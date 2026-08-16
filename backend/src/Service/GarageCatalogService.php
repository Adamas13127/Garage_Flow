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

class GarageCatalogService
{
    public function __construct(
        private readonly GarageRepository $garageRepository,
        private readonly ServicePrestationRepository $servicePrestationRepository,
        private readonly OpeningHourRepository $openingHourRepository,
        private readonly UnavailabilityRepository $unavailabilityRepository,
    ) {
    }

    /**
     * @return Garage[]
     */
    public function getActiveGarages(): array
    {
        return $this->garageRepository->findActiveGarages();
    }

    public function getActiveGarage(int $id): Garage
    {
        $garage = $this->garageRepository->findActiveGarageById($id);
        if (!$garage instanceof Garage) {
            throw new GarageNotFoundException('Garage introuvable.');
        }

        return $garage;
    }

    /**
     * @return \App\Entity\ServicePrestation[]
     */
    public function getActiveServices(Garage $garage): array
    {
        return $this->servicePrestationRepository->findActiveServicesByGarage($garage);
    }

    /**
     * @return \App\Entity\OpeningHour[]
     */
    public function getActiveOpeningHours(Garage $garage): array
    {
        return $this->openingHourRepository->findActiveByGarage($garage);
    }

    /**
     * @return \App\Entity\Unavailability[]
     */
    public function getFutureUnavailabilities(Garage $garage): array
    {
        return $this->unavailabilityRepository->findFutureByGarage($garage);
    }
}
