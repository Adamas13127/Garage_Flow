<?php

/*
 * Ce fichier declare le service ServicePrestationService du backend GarageFlow.
 * Il existe pour gerer les prestations appartenant au garage du gerant connecte.
 * Il communique avec ServicePrestationRepository, Garage et Doctrine ORM.
 */

namespace App\Service;

use App\DTO\CreateServicePrestationRequest;
use App\DTO\UpdateServicePrestationRequest;
use App\Entity\Garage;
use App\Entity\ServicePrestation;
use App\Repository\ServicePrestationRepository;
use App\Security\GarageResourceNotFoundException;
use Doctrine\ORM\EntityManagerInterface;

/** Ce service garantit qu'une prestation manipulee appartient au bon garage. */
class ServicePrestationService
{
    public function __construct(private readonly EntityManagerInterface $entityManager, private readonly ServicePrestationRepository $repository)
    {
    }

    /** Cette methode liste toutes les prestations du garage connecte. */
    public function listForGarage(Garage $garage): array { return $this->repository->findByGarage($garage); }

    /** Cette methode cree une prestation pour le garage connecte. */
    public function create(Garage $garage, CreateServicePrestationRequest $request): ServicePrestation
    {
        $service = new ServicePrestation();
        $service->setGarage($garage)->setNom(trim((string) $request->nom))->setDescription($this->nullableTrim($request->description))->setDureeMinutes((int) $request->dureeMinutes)->setActif($request->actif ?? true);
        $this->entityManager->persist($service);
        $this->entityManager->flush();
        return $service;
    }

    /** Cette methode modifie une prestation seulement si elle appartient au garage connecte. */
    public function update(Garage $garage, int $id, UpdateServicePrestationRequest $request): ServicePrestation
    {
        $service = $this->getForGarage($garage, $id);
        if ($request->hasProvided('nom')) { $service->setNom(trim((string) $request->nom)); }
        if ($request->hasProvided('description')) { $service->setDescription($this->nullableTrim($request->description)); }
        if ($request->hasProvided('dureeMinutes')) { $service->setDureeMinutes((int) $request->dureeMinutes); }
        if ($request->hasProvided('actif')) { $service->setActif((bool) $request->actif); }
        $service->setUpdatedAt(new \DateTimeImmutable());
        $this->entityManager->flush();
        return $service;
    }

    /** Cette methode desactive une prestation au lieu de la supprimer physiquement. */
    public function disable(Garage $garage, int $id): void
    {
        $service = $this->getForGarage($garage, $id);
        $service->setActif(false)->setUpdatedAt(new \DateTimeImmutable());
        $this->entityManager->flush();
    }

    /** Cette methode retrouve une prestation du garage ou retourne une erreur 404. */
    private function getForGarage(Garage $garage, int $id): ServicePrestation
    {
        $service = $this->repository->findOneByGarageAndId($garage, $id);
        if (!$service instanceof ServicePrestation) { throw new GarageResourceNotFoundException('Prestation introuvable.'); }
        return $service;
    }

    /** Cette methode transforme une chaine vide en valeur nulle. */
    private function nullableTrim(?string $value): ?string
    {
        if ($value === null) { return null; }
        $trimmed = trim($value);
        return $trimmed === '' ? null : $trimmed;
    }
}