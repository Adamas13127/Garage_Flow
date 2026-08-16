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
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UnavailabilityRepository $repository,
        private readonly ActionLogService $actionLogService,
    ) {
    }

    /**
     * @return Unavailability[]
     */
    public function listForGarage(Garage $garage): array
    {
        return $this->repository->findByGarage($garage);
    }

    public function create(Garage $garage, User $user, CreateUnavailabilityRequest $request): Unavailability
    {
        $start = $this->parseDate((string) $request->dateDebut);
        $end = $this->parseDate((string) $request->dateFin);
        $this->assertStartBeforeEnd($start, $end);
        $unavailability = new Unavailability();
        $unavailability->setGarage($garage)->setCreatedBy($user)->setDateDebut($start)->setDateFin($end)->setMotif($this->nullableTrim($request->motif));
        $this->entityManager->persist($unavailability);
        $this->entityManager->flush();
        $this->actionLogService->log($user, $garage, ActionLogService::UNAVAILABILITY_CREATED, 'Unavailability', (int) $unavailability->getId());
        $this->entityManager->flush();

        return $unavailability;
    }

    public function update(Garage $garage, int $id, User $user, UpdateUnavailabilityRequest $request): Unavailability
    {
        $unavailability = $this->getForGarage($garage, $id);
        $start = $request->hasProvided('dateDebut') ? $this->parseDate((string) $request->dateDebut) : $unavailability->getDateDebut();
        $end = $request->hasProvided('dateFin') ? $this->parseDate((string) $request->dateFin) : $unavailability->getDateFin();
        $this->assertStartBeforeEnd($start, $end);
        if ($request->hasProvided('dateDebut')) {
            $unavailability->setDateDebut($start);
        }
        if ($request->hasProvided('dateFin')) {
            $unavailability->setDateFin($end);
        }
        if ($request->hasProvided('motif')) {
            $unavailability->setMotif($this->nullableTrim($request->motif));
        }
        $this->actionLogService->log($user, $garage, ActionLogService::UNAVAILABILITY_UPDATED, 'Unavailability', $id);
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
        if (!$unavailability instanceof Unavailability) {
            throw new GarageResourceNotFoundException('Indisponibilite introuvable.');
        }

        return $unavailability;
    }

    private function parseDate(string $value): \DateTimeImmutable
    {
        try {
            return new \DateTimeImmutable(trim($value));
        } catch (\Exception) {
            throw new InvalidGarageScheduleException('Le format de date est invalide.');
        }
    }

    private function assertStartBeforeEnd(\DateTimeImmutable $start, \DateTimeImmutable $end): void
    {
        if ($start >= $end) {
            throw new InvalidGarageScheduleException('La date de debut doit etre avant la date de fin.');
        }
    }

    private function nullableTrim(?string $value): ?string
    {
        if (null === $value) {
            return null;
        }
        $trimmed = trim($value);

        return '' === $trimmed ? null : $trimmed;
    }
}
