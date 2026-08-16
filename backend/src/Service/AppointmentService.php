<?php

/*
 * Ce fichier declare le service AppointmentService du backend GarageFlow.
 * Il existe pour gerer les demandes de rendez-vous creees par les clients connectes.
 * Il communique avec AvailabilityService, NotificationService, EmailNotificationService, les repositories, Doctrine ORM et les entites Appointment, User et Vehicle.
 */

namespace App\Service;

use App\DTO\CreateAppointmentRequest;
use App\Entity\Appointment;
use App\Entity\User;
use App\Entity\Vehicle;
use App\Repository\AppointmentRepository;
use App\Repository\VehicleRepository;
use App\Security\AppointmentConflictException;
use App\Security\AppointmentNotFoundException;
use App\Security\VehicleNotFoundException;
use App\Service\Email\EmailNotificationService;
use Doctrine\ORM\EntityManagerInterface;

class AppointmentService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly AppointmentRepository $appointmentRepository,
        private readonly VehicleRepository $vehicleRepository,
        private readonly AvailabilityService $availabilityService,
        private readonly NotificationService $notificationService,
        private readonly EmailNotificationService $emailNotificationService,
        private readonly ActionLogService $actionLogService,
    ) {
    }

    public function createAppointment(User $client, CreateAppointmentRequest $request): Appointment
    {
        $garage = $this->availabilityService->getActiveGarage((int) $request->garageId);
        $service = $this->availabilityService->getActiveServiceForGarage($garage, (int) $request->serviceId);
        $vehicle = $this->getVehicleForClient($client, (int) $request->vehicleId);
        $start = $this->availabilityService->parseDateTime((string) $request->dateDebut);
        $end = $start->modify('+'.$service->getDureeMinutes().' minutes');

        if (!$this->availabilityService->isSlotAvailable($garage, $service, $start)) {
            throw new AppointmentConflictException('Ce creneau n est plus disponible.');
        }

        $appointment = new Appointment();
        $appointment
            ->setGarage($garage)
            ->setClient($client)
            ->setVehicle($vehicle)
            ->setService($service)
            ->setDateDebut($start)
            ->setDateFin($end)
            ->setStatut(Appointment::STATUT_EN_ATTENTE)
            ->setCommentaireClient($this->nullableTrim($request->commentaireClient))
            ->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($appointment);
        $this->entityManager->flush();

        $this->notificationService->notifyAppointmentRequested($appointment);
        $this->actionLogService->log($client, $garage, ActionLogService::APPOINTMENT_CREATED, 'Appointment', (int) $appointment->getId());
        $this->entityManager->flush();

        return $appointment;
    }

    /**
     * @return Appointment[]
     */
    public function getAppointmentsForClient(User $client): array
    {
        return $this->appointmentRepository->findByClient($client);
    }

    public function getAppointmentForClient(User $client, int $id): Appointment
    {
        $appointment = $this->appointmentRepository->findOneByClientAndId($client, $id);
        if (!$appointment instanceof Appointment) {
            throw new AppointmentNotFoundException('Rendez-vous introuvable.');
        }

        return $appointment;
    }

    public function cancelAppointment(User $client, int $id): Appointment
    {
        $appointment = $this->getAppointmentForClient($client, $id);
        if (in_array($appointment->getStatut(), [Appointment::STATUT_REFUSE, Appointment::STATUT_ANNULE, Appointment::STATUT_TERMINE], true)) {
            throw new AppointmentConflictException('Ce rendez-vous ne peut plus etre annule.');
        }

        $appointment->setStatut(Appointment::STATUT_ANNULE);
        $appointment->setUpdatedAt(new \DateTimeImmutable());
        $this->notificationService->notifyAppointmentCancelled($appointment);
        $this->emailNotificationService->sendAppointmentCancelledEmail($appointment);
        $this->actionLogService->log($client, $appointment->getGarage(), ActionLogService::APPOINTMENT_CANCELLED, 'Appointment', $id);
        $this->entityManager->flush();

        return $appointment;
    }

    private function getVehicleForClient(User $client, int $vehicleId): Vehicle
    {
        $vehicle = $this->vehicleRepository->findOneByClientAndId($client, $vehicleId);
        if (!$vehicle instanceof Vehicle) {
            throw new VehicleNotFoundException('Vehicule introuvable.');
        }

        return $vehicle;
    }

    /** Cette methode transforme une chaine vide en null pour stocker proprement le commentaire optionnel. */
    private function nullableTrim(?string $value): ?string
    {
        if (null === $value) {
            return null;
        }

        $trimmed = trim($value);

        return '' === $trimmed ? null : $trimmed;
    }
}
