<?php

/*
 * Ce fichier declare le service GarageInterventionService du backend GarageFlow.
 * Il existe pour gerer le suivi des interventions par le garage connecte.
 * Il communique avec InterventionRepository, InterventionStatusRepository, InterventionStatusHistoryRepository et Doctrine ORM.
 */

namespace App\Service;

use App\DTO\InterventionFilterRequest;
use App\DTO\UpdateInterventionStatusRequest;
use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\Intervention;
use App\Entity\InterventionStatus;
use App\Entity\InterventionStatusHistory;
use App\Entity\User;
use App\Repository\InterventionRepository;
use App\Repository\InterventionStatusHistoryRepository;
use App\Repository\InterventionStatusRepository;
use App\Security\InterventionNotFoundException;
use App\Security\InterventionStatusNotFoundException;
use App\Security\InvalidAppointmentRequestException;
use Doctrine\ORM\EntityManagerInterface;

/** Ce service verifie qu'un garage ne peut consulter ou modifier que ses propres interventions. */
class GarageInterventionService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly InterventionRepository $interventionRepository,
        private readonly InterventionStatusRepository $statusRepository,
        private readonly InterventionStatusHistoryRepository $historyRepository,
    ) {
    }

    /** Cette methode liste les interventions du garage connecte avec des filtres optionnels. */
    public function listForGarage(Garage $garage, InterventionFilterRequest $request): array
    {
        return $this->interventionRepository->findByGarageWithFilters($garage, $request->statusCode, $this->parseOptionalDate($request->date));
    }

    /** Cette methode recupere une intervention seulement si elle appartient au garage connecte. */
    public function getForGarage(Garage $garage, int $id): Intervention
    {
        $intervention = $this->interventionRepository->findOneByGarageAndId($garage, $id);
        if (!$intervention instanceof Intervention) {
            throw new InterventionNotFoundException('Intervention introuvable.');
        }

        return $intervention;
    }

    /** Cette methode retourne l'historique complet visible par le garage. */
    public function getHistory(Intervention $intervention): array
    {
        return $this->historyRepository->findHistoryByIntervention($intervention);
    }

    /** Cette methode change le statut actuel et ajoute une ligne d'historique. */
    public function updateStatus(Garage $garage, int $id, User $changedBy, UpdateInterventionStatusRequest $request): Intervention
    {
        $intervention = $this->getForGarage($garage, $id);
        $status = $this->statusRepository->findOneByCode(trim((string) $request->statusCode));
        if (!$status instanceof InterventionStatus) {
            throw new InterventionStatusNotFoundException('Statut d intervention introuvable.');
        }

        $intervention->setStatutActuel($status);
        $history = new InterventionStatusHistory();
        $history
            ->setIntervention($intervention)
            ->setStatus($status)
            ->setChangedBy($changedBy)
            ->setCommentaire($this->nullableTrim($request->commentaire))
            ->setChangedAt(new \DateTimeImmutable());

        if ($status->getCode() === 'VEHICULE_RECUPERE') {
            if ($intervention->getClosedAt() === null) {
                $intervention->setClosedAt(new \DateTimeImmutable());
            }
            $appointment = $intervention->getAppointment();
            if ($appointment instanceof Appointment) {
                $appointment->setStatut(Appointment::STATUT_TERMINE);
                $appointment->setUpdatedAt(new \DateTimeImmutable());
            }
        }

        $this->entityManager->persist($history);
        $this->entityManager->flush();

        return $intervention;
    }

    /** Cette methode convertit le filtre date YYYY-MM-DD en objet utilisable par Doctrine. */
    private function parseOptionalDate(?string $date): ?\DateTimeImmutable
    {
        if ($date === null || trim($date) === '') {
            return null;
        }

        $parsedDate = \DateTimeImmutable::createFromFormat('!Y-m-d', trim($date));
        $errors = \DateTimeImmutable::getLastErrors();
        if (!$parsedDate instanceof \DateTimeImmutable || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            throw new InvalidAppointmentRequestException('La date doit etre au format YYYY-MM-DD.');
        }

        return $parsedDate;
    }

    /** Cette methode transforme une chaine vide en null pour les commentaires optionnels. */
    private function nullableTrim(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}