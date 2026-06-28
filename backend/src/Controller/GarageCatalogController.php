<?php

/*
 * Ce fichier declare le controleur GarageCatalogController du backend GarageFlow.
 * Il existe pour exposer les routes publiques permettant au client de consulter les garages disponibles.
 * Il communique avec GarageCatalogService pour recuperer uniquement les garages actifs.
 */

namespace App\Controller;

use App\Entity\Garage;
use App\Entity\OpeningHour;
use App\Entity\ServicePrestation;
use App\Entity\Unavailability;
use App\Security\GarageNotFoundException;
use App\Service\GarageCatalogService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/** Ce controleur expose le catalogue public des garages actifs. */
#[Route('/api/garages')]
class GarageCatalogController extends AbstractController
{
    public function __construct(private readonly GarageCatalogService $catalogService)
    {
    }

    /** Cette route retourne la liste des garages actifs. */
    #[Route('', name: 'api_garages_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json(array_map(fn (Garage $garage): array => $this->serializeGarage($garage), $this->catalogService->getActiveGarages()));
    }

    /** Cette route retourne le detail public d'un garage actif. */
    #[Route('/{id}', name: 'api_garages_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try { $garage = $this->catalogService->getActiveGarage($id); } catch (GarageNotFoundException $exception) { return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND); }
        return $this->json($this->serializeGarageDetail($garage));
    }

    /** Cette route retourne les prestations actives d'un garage actif. */
    #[Route('/{id}/services', name: 'api_garages_services', methods: ['GET'])]
    public function services(int $id): JsonResponse
    {
        try { $garage = $this->catalogService->getActiveGarage($id); } catch (GarageNotFoundException $exception) { return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND); }
        return $this->json(array_map(fn (ServicePrestation $service): array => $this->serializeService($service), $this->catalogService->getActiveServices($garage)));
    }

    private function serializeGarageDetail(Garage $garage): array
    {
        return $this->serializeGarage($garage) + [
            'services' => array_map(fn (ServicePrestation $service): array => $this->serializeService($service), $this->catalogService->getActiveServices($garage)),
            'openingHours' => array_map(fn (OpeningHour $hour): array => $this->serializeOpeningHour($hour), $this->catalogService->getActiveOpeningHours($garage)),
            'unavailabilities' => array_map(fn (Unavailability $unavailability): array => $this->serializeUnavailability($unavailability), $this->catalogService->getFutureUnavailabilities($garage)),
        ];
    }

    private function serializeGarage(Garage $garage): array
    {
        return ['id' => $garage->getId(), 'nom' => $garage->getNom(), 'adresse' => $garage->getAdresse(), 'ville' => $garage->getVille(), 'codePostal' => $garage->getCodePostal(), 'telephone' => $garage->getTelephone(), 'email' => $garage->getEmail(), 'description' => $garage->getDescription(), 'logoUrl' => $garage->getLogoUrl(), 'actif' => $garage->isActif()];
    }

    private function serializeService(ServicePrestation $service): array
    {
        return ['id' => $service->getId(), 'nom' => $service->getNom(), 'description' => $service->getDescription(), 'dureeMinutes' => $service->getDureeMinutes(), 'actif' => $service->isActif()];
    }

    private function serializeOpeningHour(OpeningHour $hour): array
    {
        return ['id' => $hour->getId(), 'jourSemaine' => $hour->getJourSemaine(), 'heureDebut' => $hour->getHeureDebut()?->format('H:i'), 'heureFin' => $hour->getHeureFin()?->format('H:i'), 'actif' => $hour->isActif()];
    }

    private function serializeUnavailability(Unavailability $unavailability): array
    {
        return ['id' => $unavailability->getId(), 'dateDebut' => $unavailability->getDateDebut()?->format(DATE_ATOM), 'dateFin' => $unavailability->getDateFin()?->format(DATE_ATOM), 'motif' => $unavailability->getMotif()];
    }
}