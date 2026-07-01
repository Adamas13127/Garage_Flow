<?php

/*
 * Ce fichier declare le service EmailNotificationService du backend GarageFlow.
 * Il existe pour centraliser les emails envoyes aux clients lors des evenements importants du MVP.
 * Il communique avec Symfony Mailer et les entites Appointment, Intervention et User.
 */

namespace App\Service\Email;

use App\Entity\Appointment;
use App\Entity\Intervention;
use App\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

/** Ce service prepare et envoie les emails clients sans mettre de logique email dans les controleurs. */
class EmailNotificationService
{
    private const FROM_ADDRESS = 'no-reply@garageflow.local';

    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly LoggerInterface $logger,
    ) {
    }

    /** Cette methode envoie un email quand le garage confirme un rendez-vous client. */
    public function sendAppointmentAcceptedEmail(Appointment $appointment): void
    {
        $this->sendAppointmentEmail(
            $appointment,
            'Votre rendez-vous GarageFlow est confirme',
            "Votre rendez-vous est confirme.\n\n".$this->appointmentSummary($appointment)
        );
    }

    /** Cette methode envoie un email quand le garage refuse un rendez-vous client. */
    public function sendAppointmentRefusedEmail(Appointment $appointment, ?string $reason = null): void
    {
        $reasonText = $reason !== null && trim($reason) !== '' ? "\n\nMotif indique par le garage : ".trim($reason) : '';

        $this->sendAppointmentEmail(
            $appointment,
            'Votre rendez-vous GarageFlow a ete refuse',
            "Votre demande de rendez-vous a ete refusee.".$reasonText."\n\n".$this->appointmentSummary($appointment)
        );
    }

    /** Cette methode envoie un email quand un rendez-vous est annule. */
    public function sendAppointmentCancelledEmail(Appointment $appointment): void
    {
        $this->sendAppointmentEmail(
            $appointment,
            'Votre rendez-vous GarageFlow a ete annule',
            "Votre rendez-vous a ete annule.\n\n".$this->appointmentSummary($appointment)
        );
    }

    /** Cette methode envoie un email quand le statut de reparation change sans exposer les notes internes. */
    public function sendInterventionStatusChangedEmail(Intervention $intervention, ?string $commentaire = null): void
    {
        $appointment = $intervention->getAppointment();
        if (!$appointment instanceof Appointment) {
            return;
        }

        $status = $intervention->getStatutActuel();
        $commentText = $commentaire !== null && trim($commentaire) !== '' ? "\n\nMessage du garage : ".trim($commentaire) : '';

        $this->sendAppointmentEmail(
            $appointment,
            'Mise a jour de votre reparation',
            "Le statut de votre intervention a ete mis a jour : ".($status?->getLibelle() ?? $status?->getCode() ?? 'Statut en cours').'.'.$commentText."\n\n".$this->appointmentSummary($appointment)
        );
    }

    /** Cette methode envoie un email specifique quand le vehicule est pret a etre recupere. */
    public function sendVehicleReadyEmail(Intervention $intervention): void
    {
        $appointment = $intervention->getAppointment();
        if (!$appointment instanceof Appointment) {
            return;
        }

        $this->sendAppointmentEmail(
            $appointment,
            'Votre vehicule est pret',
            "Votre vehicule est pret a etre recupere aupres du garage.\n\n".$this->appointmentSummary($appointment)
        );
    }

    /** Cette methode evite de dupliquer la construction d'un email lie a un rendez-vous. */
    private function sendAppointmentEmail(Appointment $appointment, string $subject, string $text): void
    {
        $client = $appointment->getClient();
        if (!$client instanceof User || $client->getEmail() === null || trim($client->getEmail()) === '') {
            return;
        }

        $this->sendToClient($client, $subject, $text);
    }

    /** Cette methode utilise Symfony Mailer et journalise les erreurs SMTP sans bloquer le parcours metier. */
    private function sendToClient(User $client, string $subject, string $text): void
    {
        try {
            $this->mailer->send(
                (new Email())
                    ->from(self::FROM_ADDRESS)
                    ->to((string) $client->getEmail())
                    ->subject($subject)
                    ->text($text)
                    ->html('<p>'.nl2br(htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')).'</p>')
            );
        } catch (TransportExceptionInterface $exception) {
            $this->logger->warning('Email GarageFlow non envoye.', [
                'recipient' => $client->getEmail(),
                'subject' => $subject,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    /** Cette methode resume les informations utiles au client sans inclure les notes internes du garage. */
    private function appointmentSummary(Appointment $appointment): string
    {
        $garage = $appointment->getGarage();
        $vehicle = $appointment->getVehicle();
        $service = $appointment->getService();
        $date = $appointment->getDateDebut();
        $vehicleLabel = trim(($vehicle?->getMarque() ?? '').' '.($vehicle?->getModele() ?? '').' '.($vehicle?->getPlaqueImmatriculation() ?? ''));

        return implode("\n", [
            'Garage : '.($garage?->getNom() ?? 'GarageFlow'),
            'Prestation : '.($service?->getNom() ?? 'Prestation GarageFlow'),
            'Vehicule : '.($vehicleLabel !== '' ? $vehicleLabel : 'Vehicule client'),
            'Date : '.($date instanceof \DateTimeImmutable ? $date->format('d/m/Y H:i') : 'Date a confirmer'),
        ]);
    }
}
