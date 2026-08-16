<?php

/*
 * Ce fichier declare le service GarageAppointmentService du backend GarageFlow.
 * Il existe pour gerer les rendez-vous recus par le garage connecte.
 * Il communique avec AppointmentRepository, AvailabilityService, InterventionCreationService, NotificationService, EmailNotificationService et Doctrine ORM.
 */

namespace App\Service;

use App\DTO\GarageAppointmentFilterRequest;
use App\DTO\RefuseAppointmentRequest;
use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\Intervention;
use App\Entity\User;
use App\Repository\AppointmentRepository;
use App\Security\AppointmentConflictException;
use App\Security\AppointmentNotFoundException;
use App\Security\InvalidAppointmentRequestException;
use App\Service\Email\EmailNotificationService;
use Doctrine\ORM\EntityManagerInterface;

/** Ce service contient la logique metier qui verifie qu'un rendez-vous appartient bien au garage connecte. */
class GarageAppointmentService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly AppointmentRepository $appointmentRepository,
        private readonly AvailabilityService $availabilityService,
        private readonly InterventionCreationService $interventionCreationService,
        private readonly NotificationService $notificationService,
        private readonly EmailNotificationService $emailNotificationService,
        private readonly ActionLogService $actionLogService,
    ) {
    }

    /**
     * @return Appointment[]
     */
    public function listForGarage(Garage $garage, GarageAppointmentFilterRequest $request): array
    {
        return $this->appointmentRepository->findByGarageWithFilters($garage, $request->statut, $this->parseOptionalDate($request->date));
    }

    public function getForGarage(Garage $garage, int $id): Appointment
    {
        $appointment = $this->appointmentRepository->findOneByGarageAndId($garage, $id);
        if (!$appointment instanceof Appointment) {
            throw new AppointmentNotFoundException('Rendez-vous introuvable.');
        }

        return $appointment;
    }

    /**
     * @return array{appointment: Appointment, intervention: Intervention}
     */
    public function accept(Garage $garage, int $id, User $changedBy): array
    {
        $appointment = $this->getForGarage($garage, $id);
        $this->assertPending($appointment);
        $service = $appointment->getService();
        if (null === $service || !$this->availabilityService->isSlotAvailableExcludingAppointment($garage, $service, $appointment->getDateDebut(), $appointment)) {
            throw new AppointmentConflictException('Ce creneau n est plus disponible.');
        }

        $appointment->setStatut(Appointment::STATUT_CONFIRME);
        $appointment->setUpdatedAt(new \DateTimeImmutable());
        $intervention = $this->interventionCreationService->createForAcceptedAppointment($appointment, $changedBy);
        $this->entityManager->flush();

        $this->notificationService->notifyAppointmentAccepted($appointment);
        $this->emailNotificationService->sendAppointmentAcceptedEmail($appointment);
        $this->actionLogService->log($changedBy, $garage, ActionLogService::APPOINTMENT_ACCEPTED, 'Appointment', $id);
        $this->actionLogService->log($changedBy, $garage, ActionLogService::INTERVENTION_CREATED, 'Intervention', (int) $intervention->getId());
        $this->entityManager->flush();

        return ['appointment' => $appointment, 'intervention' => $intervention];
    }

    /** Cette methode refuse un rendez-vous en attente sans creer d'intervention. */
    public function refuse(Garage $garage, int $id, RefuseAppointmentRequest $request, User $changedBy): Appointment
    {
        $appointment = $this->getForGarage($garage, $id);
        $this->assertPending($appointment);
        $appointment->setStatut(Appointment::STATUT_REFUSE);
        $appointment->setUpdatedAt(new \DateTimeImmutable());
        $this->notificationService->notifyAppointmentRefused($appointment);
        $this->emailNotificationService->sendAppointmentRefusedEmail($appointment, $request->motifRefus);
        $this->actionLogService->log($changedBy, $garage, ActionLogService::APPOINTMENT_REFUSED, 'Appointment', $id);
        $this->entityManager->flush();

        return $appointment;
    }

    private function assertPending(Appointment $appointment): void
    {
        if (Appointment::STATUT_EN_ATTENTE !== $appointment->getStatut()) {
            throw new AppointmentConflictException('Ce rendez-vous ne peut plus etre traite.');
        }
    }

    private function parseOptionalDate(?string $date): ?\DateTimeImmutable
    {
        if (null === $date || '' === trim($date)) {
            return null;
        }

        $parsedDate = \DateTimeImmutable::createFromFormat('!Y-m-d', trim($date));
        $errors = \DateTimeImmutable::getLastErrors();
        if (!$parsedDate instanceof \DateTimeImmutable || (false !== $errors && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            throw new InvalidAppointmentRequestException('La date doit etre au format YYYY-MM-DD.');
        }

        return $parsedDate;
    }
}
