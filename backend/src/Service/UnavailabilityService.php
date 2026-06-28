<?php

/*
 * Ce fichier declare le service UnavailabilityService du backend GarageFlow.
 * Il existe pour gerer les indisponibilites exceptionnelles du garage connecte.
 * Il communique avec UnavailabilityRepository, Garage, User et Doctrine ORM.
 */

namespace App\Service;

use App\DTO\CreateUnavailabilityRequest;
use App\DTO\UpdateUnavailabilityRequest;
use App\Entity\Garage;
use App\Entity\Unavailability;
use App\Entity\User;
use App\Repository\UnavailabilityRepository;
use App\Security\GarageResourceNotFoundException;
use App\Security\InvalidGarageScheduleException;
use Doctrine\ORM\EntityManagerInterface;

/** Ce service verifie que les indisponibilites appartiennent au bon garage et gardent des dates coherentes. */
class UnavailabilityService
{
    public function __construct(private readonly EntityManagerInterface $entityManager, private readonly UnavailabilityRepository $repository)
    {
    }

    /** Cette methode liste les indisponibilites du garage connecte. */
    public function listForGarage(Garage $garage): array { return $this->repository->findByGarage($garage); }

    /** Cette methode cree une indisponibilite pour le garage connecte. */
    public function create(Garage $garage, User $user, CreateUnavailabilityRequest $request): Unavailability
    {
        $start = $this->parseDate((string) $request->dateDebut);
        $end = $this->parseDate((string) $request->dateFin);
        $this->assertStartBeforeEnd($start, $end);
        $unavailability = new Unavailability();
        $unavailability->setGarage($garage)->setCreatedBy($user)->setDateDebut($start)->setDateFin($end)->setMotif($this->nullableTrim($request->motif));
        $this->entityManager->persist($unavailability);
        $this->entityManager->flush();
        return $unavailability;
    }

    /** Cette methode modifie une indisponibilite appartenant au garage connecte. */
    public function update(Garage $garage, int $id, UpdateUnavailabilityRequest $request): Unavailability
    {
        $unavailability = $this->getForGarage($garage, $id);
        $start = $request->hasProvided('dateDebut') ? $this->parseDate((string) $request->dateDebut) : $unavailability->getDateDebut();
        $end = $request->hasProvided('dateFin') ? $this->parseDate((string) $request->dateFin) : $unavailability->getDateFin();
        $this->assertStartBeforeEnd($start, $end);
        if ($request->hasProvided('dateDebut')) { $unavailability->setDateDebut($start); }
        if ($request->hasProvided('dateFin')) { $unavailability->setDateFin($end); }
        if ($request->hasProvided('motif')) { $unavailability->setMotif($this->nullableTrim($request->motif)); }
        $this->entityManager->flush();
        return $unavailability;
    }

    /** Cette methode supprime physiquement une indisponibilite car l'entite ne possede pas de champ actif. */
    public function delete(Garage $garage, int $id): void
    {
        $unavailability = $this->getForGarage($garage, $id);
        $this->entityManager->remove($unavailability);
        $this->entityManager->flush();
    }

    private function getForGarage(Garage $garage, int $id): Unavailability
    {
        $unavailability = $this->repository->findOneByGarageAndId($garage, $id);
        if (!$unavailability instanceof Unavailability) { throw new GarageResourceNotFoundException('Indisponibilite introuvable.'); }
        return $unavailability;
    }

    /** Cette methode convertit une date ISO ou lisible par PHP en DateTimeImmutable. */
    private function parseDate(string $value): \DateTimeImmutable
    {
        try { return new \DateTimeImmutable(trim($value)); } catch (\Exception) { throw new InvalidGarageScheduleException('Le format de date est invalide.'); }
    }

    /** Cette methode verifie que la date de debut est bien avant la date de fin. */
    private function assertStartBeforeEnd(\DateTimeImmutable $start, \DateTimeImmutable $end): void
    {
        if ($start >= $end) { throw new InvalidGarageScheduleException('La date de debut doit etre avant la date de fin.'); }
    }

    private function nullableTrim(?string $value): ?string
    {
        if ($value === null) { return null; }
        $trimmed = trim($value);
        return $trimmed === '' ? null : $trimmed;
    }
}