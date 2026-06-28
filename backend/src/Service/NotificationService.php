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

/** Ce service centralise la creation des notifications de l'application. */
class NotificationService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly NotificationRepository $notificationRepository,
        private readonly UserRepository $userRepository,
    ) {
    }

    /** Cette methode cree une notification APP simple pour un utilisateur. */
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

    /** Cette methode cree une notification liee a un rendez-vous. */
    public function createForAppointment(User $recipient, Appointment $appointment, string $type, string $contenu): Notification
    {
        return $this->createForUser($recipient, $type, $contenu, $appointment);
    }

    /** Cette methode cree une notification liee a une intervention. */
    public function createForIntervention(User $recipient, Intervention $intervention, string $type, string $contenu): Notification
    {
        return $this->createForUser($recipient, $type, $contenu, $intervention->getAppointment(), $intervention);
    }

    /** Cette methode notifie les gerants actifs du garage pour une nouvelle demande de rendez-vous. */
    public function notifyAppointmentRequested(Appointment $appointment): void
    {
        $garage = $appointment->getGarage();
        if (!$garage instanceof Garage) {
            return;
        }

        foreach ($this->userRepository->findActiveManagersByGarage($garage) as $manager) {
            if ($manager instanceof User) {
                $this->createForAppointment($manager, $appointment, Notification::TYPE_RDV_DEMANDE, 'Nouvelle demande de rendez-vous recue.');
            }
        }
    }

    /** Cette methode notifie le client que son rendez-vous a ete accepte. */
    public function notifyAppointmentAccepted(Appointment $appointment): void
    {
        $client = $appointment->getClient();
        if ($client instanceof User) {
            $this->createForAppointment($client, $appointment, Notification::TYPE_RDV_ACCEPTE, 'Votre rendez-vous a ete accepte par le garage.');
        }
    }

    /** Cette methode notifie le client que son rendez-vous a ete refuse. */
    public function notifyAppointmentRefused(Appointment $appointment): void
    {
        $client = $appointment->getClient();
        if ($client instanceof User) {
            $this->createForAppointment($client, $appointment, Notification::TYPE_RDV_REFUSE, 'Votre rendez-vous a ete refuse par le garage.');
        }
    }

    /** Cette methode notifie les gerants actifs du garage qu'un rendez-vous a ete annule. */
    public function notifyAppointmentCancelled(Appointment $appointment): void
    {
        $garage = $appointment->getGarage();
        if (!$garage instanceof Garage) {
            return;
        }

        foreach ($this->userRepository->findActiveManagersByGarage($garage) as $manager) {
            if ($manager instanceof User) {
                $this->createForAppointment($manager, $appointment, Notification::TYPE_RDV_ANNULE, 'Un client a annule son rendez-vous.');
            }
        }
    }

    /** Cette methode notifie le client quand le statut de son intervention change. */
    public function notifyInterventionStatusChanged(Intervention $intervention): void
    {
        $client = $intervention->getAppointment()?->getClient();
        if (!$client instanceof User) {
            return;
        }

        if ($intervention->getStatutActuel()?->getCode() === 'VEHICULE_PRET') {
            $this->createForIntervention($client, $intervention, Notification::TYPE_VEHICULE_PRET, 'Votre vehicule est pret.');
            return;
        }

        $this->createForIntervention($client, $intervention, Notification::TYPE_STATUT_INTERVENTION_CHANGE, 'Le statut de votre intervention a ete mis a jour.');
    }

    /** Cette methode liste les notifications de l'utilisateur connecte. */
    public function listForUser(User $recipient, bool $unreadOnly = false): array
    {
        return $unreadOnly ? $this->notificationRepository->findUnreadByRecipient($recipient) : $this->notificationRepository->findByRecipient($recipient);
    }

    /** Cette methode marque comme lue une notification appartenant a l'utilisateur connecte. */
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

    /** Cette methode marque toutes les notifications non lues d'un utilisateur comme lues. */
    public function markAllAsRead(User $recipient): int
    {
        $count = 0;
        foreach ($this->notificationRepository->findUnreadByRecipient($recipient) as $notification) {
            if ($notification instanceof Notification) {
                $notification->setLu(true);
                $notification->setReadAt(new \DateTimeImmutable());
                ++$count;
            }
        }

        $this->entityManager->flush();

        return $count;
    }
}