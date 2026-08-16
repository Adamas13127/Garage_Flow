<?php

/*
 * Ce fichier declare le service NotificationService du backend GarageFlow.
 * Il existe pour centraliser la creation et la lecture des notifications in-app du MVP.
 * Il communique avec NotificationRepository, UserRepository, Appointment, Intervention et Doctrine ORM.
 */

namespace App\Service;

use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\Intervention;
use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use App\Repository\UserRepository;
use App\Security\NotificationNotFoundException;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly NotificationRepository $notificationRepository,
        private readonly UserRepository $userRepository,
    ) {
    }

    public function createForUser(User $recipient, string $type, string $contenu, ?Appointment $appointment = null, ?Intervention $intervention = null, string $canal = Notification::CANAL_APP): Notification
    {
        $notification = new Notification();
        $notification
            ->setRecipient($recipient)
            ->setType($type)
            ->setCanal($canal)
            ->setContenu($contenu)
            ->setLu(false)
            ->setCreatedAt(new \DateTimeImmutable())
            ->setReadAt(null)
            ->setAppointment($appointment)
            ->setIntervention($intervention);

        $this->entityManager->persist($notification);

        return $notification;
    }

    public function createForAppointment(User $recipient, Appointment $appointment, string $type, string $contenu): Notification
    {
        return $this->createForUser($recipient, $type, $contenu, $appointment);
    }

    public function createForIntervention(User $recipient, Intervention $intervention, string $type, string $contenu): Notification
    {
        return $this->createForUser($recipient, $type, $contenu, $intervention->getAppointment(), $intervention);
    }

    public function notifyAppointmentRequested(Appointment $appointment): void
    {
        $garage = $appointment->getGarage();
        if (!$garage instanceof Garage) {
            return;
        }

        foreach ($this->userRepository->findActiveManagersByGarage($garage) as $manager) {
            $this->createForAppointment($manager, $appointment, Notification::TYPE_RDV_DEMANDE, 'Nouvelle demande de rendez-vous recue.');
        }
    }

    public function notifyAppointmentAccepted(Appointment $appointment): void
    {
        $client = $appointment->getClient();
        if ($client instanceof User) {
            $this->createForAppointment($client, $appointment, Notification::TYPE_RDV_ACCEPTE, 'Votre rendez-vous a ete accepte par le garage.');
        }
    }

    public function notifyAppointmentRefused(Appointment $appointment): void
    {
        $client = $appointment->getClient();
        if ($client instanceof User) {
            $this->createForAppointment($client, $appointment, Notification::TYPE_RDV_REFUSE, 'Votre rendez-vous a ete refuse par le garage.');
        }
    }

    public function notifyAppointmentCancelled(Appointment $appointment): void
    {
        $garage = $appointment->getGarage();
        if (!$garage instanceof Garage) {
            return;
        }

        foreach ($this->userRepository->findActiveManagersByGarage($garage) as $manager) {
            $this->createForAppointment($manager, $appointment, Notification::TYPE_RDV_ANNULE, 'Un client a annule son rendez-vous.');
        }
    }

    public function notifyInterventionStatusChanged(Intervention $intervention): void
    {
        $client = $intervention->getAppointment()?->getClient();
        if (!$client instanceof User) {
            return;
        }

        if ('VEHICULE_PRET' === $intervention->getStatutActuel()?->getCode()) {
            $this->createForIntervention($client, $intervention, Notification::TYPE_VEHICULE_PRET, 'Votre vehicule est pret.');

            return;
        }

        $this->createForIntervention($client, $intervention, Notification::TYPE_STATUT_INTERVENTION_CHANGE, 'Le statut de votre intervention a ete mis a jour.');
    }

    /**
     * @return Notification[]
     */
    public function listForUser(User $recipient, bool $unreadOnly = false): array
    {
        return $unreadOnly ? $this->notificationRepository->findUnreadByRecipient($recipient) : $this->notificationRepository->findByRecipient($recipient);
    }

    public function markAsRead(User $recipient, int $id): Notification
    {
        $notification = $this->notificationRepository->findOneByRecipientAndId($recipient, $id);
        if (!$notification instanceof Notification) {
            throw new NotificationNotFoundException('Notification introuvable.');
        }

        if (!$notification->isLu()) {
            $notification->setLu(true);
            $notification->setReadAt(new \DateTimeImmutable());
            $this->entityManager->flush();
        }

        return $notification;
    }

    public function markAllAsRead(User $recipient): int
    {
        $count = 0;
        foreach ($this->notificationRepository->findUnreadByRecipient($recipient) as $notification) {
            $notification->setLu(true);
            $notification->setReadAt(new \DateTimeImmutable());
            ++$count;
        }

        $this->entityManager->flush();

        return $count;
    }
}
