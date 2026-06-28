<?php

/*
 * Ce fichier declare le service InterventionCreationService du backend GarageFlow.
 * Il existe pour creer automatiquement une intervention quand un garage accepte un rendez-vous.
 * Il communique avec InterventionRepository, InterventionStatusRepository, InterventionStatusHistory et Doctrine ORM.
 */

namespace App\Service;

use App\Entity\Appointment;
use App\Entity\Intervention;
use App\Entity\InterventionStatus;
use App\Entity\InterventionStatusHistory;
use App\Entity\User;
use App\Repository\InterventionRepository;
use App\Repository\InterventionStatusRepository;
use App\Security\AppointmentConflictException;
use Doctrine\ORM\EntityManagerInterface;

/** Ce service contient la logique de creation automatique du suivi atelier. */
class InterventionCreationService
{
    private const INITIAL_HISTORY_COMMENT = 'Intervention creee automatiquement apres confirmation du rendez-vous.';

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly InterventionRepository $interventionRepository,
        private readonly InterventionStatusRepository $statusRepository,
    ) {
    }

    /** Cette methode cree une intervention si le rendez-vous confirme n'en possede pas encore. */
    public function createForAcceptedAppointment(Appointment $appointment, User $changedBy): Intervention
    {
        $existingIntervention = $this->interventionRepository->findOneByAppointment($appointment);
        if ($existingIntervention instanceof Intervention) {
            return $existingIntervention;
        }

        $initialStatus = $this->getInitialStatus();
        $intervention = new Intervention();
        $intervention
            ->setAppointment($appointment)
            ->setStatutActuel($initialStatus)
            ->setCreatedAt(new \DateTimeImmutable());

        $history = new InterventionStatusHistory();
        $history
            ->setIntervention($intervention)
            ->setStatus($initialStatus)
            ->setChangedBy($changedBy)
            ->setCommentaire(self::INITIAL_HISTORY_COMMENT)
            ->setChangedAt(new \DateTimeImmutable());

        $appointment->setIntervention($intervention);
        $this->entityManager->persist($intervention);
        $this->entityManager->persist($history);

        return $intervention;
    }

    /** Cette methode choisit VEHICULE_DEPOSE ou, a defaut, le premier statut selon l'ordre d'affichage. */
    private function getInitialStatus(): InterventionStatus
    {
        $status = $this->statusRepository->findOneByCode('VEHICULE_DEPOSE') ?? $this->statusRepository->findFirstByOrder();
        if (!$status instanceof InterventionStatus) {
            throw new AppointmentConflictException('Aucun statut initial d intervention n est disponible.');
        }

        return $status;
    }
}