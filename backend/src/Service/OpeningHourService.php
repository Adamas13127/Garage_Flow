<?php

/*
 * Ce fichier declare le service OpeningHourService du backend GarageFlow.
 * Il existe pour gerer les horaires recurrents du garage connecte.
 * Il communique avec OpeningHourRepository, Garage et Doctrine ORM.
 */

namespace App\Service;

use App\DTO\CreateOpeningHourRequest;
use App\DTO\UpdateOpeningHourRequest;
use App\Entity\Garage;
use App\Entity\OpeningHour;
use App\Repository\OpeningHourRepository;
use App\Security\GarageResourceNotFoundException;
use App\Security\InvalidGarageScheduleException;
use Doctrine\ORM\EntityManagerInterface;

/** Ce service verifie que les horaires appartiennent au bon garage et restent coherents. */
class OpeningHourService
{
    public function __construct(private readonly EntityManagerInterface $entityManager, private readonly OpeningHourRepository $repository)
    {
    }

    /**
     * @return OpeningHour[]
     */
    public function listForGarage(Garage $garage): array
    {
        return $this->repository->findByGarage($garage);
    }

    public function create(Garage $garage, CreateOpeningHourRequest $request): OpeningHour
    {
        $start = $this->parseTime((string) $request->heureDebut);
        $end = $this->parseTime((string) $request->heureFin);
        $this->assertStartBeforeEnd($start, $end);
        $hour = new OpeningHour();
        $hour->setGarage($garage)->setJourSemaine((int) $request->jourSemaine)->setHeureDebut($start)->setHeureFin($end)->setActif($request->actif ?? true);
        $this->entityManager->persist($hour);
        $this->entityManager->flush();

        return $hour;
    }

    public function update(Garage $garage, int $id, UpdateOpeningHourRequest $request): OpeningHour
    {
        $hour = $this->getForGarage($garage, $id);
        $start = $request->hasProvided('heureDebut') ? $this->parseTime((string) $request->heureDebut) : $hour->getHeureDebut();
        $end = $request->hasProvided('heureFin') ? $this->parseTime((string) $request->heureFin) : $hour->getHeureFin();
        $this->assertStartBeforeEnd($start, $end);
        if ($request->hasProvided('jourSemaine')) {
            $hour->setJourSemaine((int) $request->jourSemaine);
        }
        if ($request->hasProvided('heureDebut')) {
            $hour->setHeureDebut($start);
        }
        if ($request->hasProvided('heureFin')) {
            $hour->setHeureFin($end);
        }
        if ($request->hasProvided('actif')) {
            $hour->setActif((bool) $request->actif);
        }
        $this->entityManager->flush();

        return $hour;
    }

    public function disable(Garage $garage, int $id): void
    {
        $hour = $this->getForGarage($garage, $id);
        $hour->setActif(false);
        $this->entityManager->flush();
    }

    private function getForGarage(Garage $garage, int $id): OpeningHour
    {
        $hour = $this->repository->findOneByGarageAndId($garage, $id);
        if (!$hour instanceof OpeningHour) {
            throw new GarageResourceNotFoundException('Horaire introuvable.');
        }

        return $hour;
    }

    private function parseTime(string $value): \DateTimeImmutable
    {
        $time = \DateTimeImmutable::createFromFormat('!H:i', trim($value));
        $errors = \DateTimeImmutable::getLastErrors();

        if (!$time instanceof \DateTimeImmutable || (false !== $errors && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            throw new InvalidGarageScheduleException('Le format de l heure doit etre HH:MM.');
        }

        return $time;
    }

    private function assertStartBeforeEnd(\DateTimeImmutable $start, \DateTimeImmutable $end): void
    {
        if ($start >= $end) {
            throw new InvalidGarageScheduleException('L heure de debut doit etre avant l heure de fin.');
        }
    }
}
