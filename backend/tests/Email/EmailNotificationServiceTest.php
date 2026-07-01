<?php

/*
 * Ce fichier teste le service EmailNotificationService du backend GarageFlow.
 * Il existe pour verifier les emails clients sans envoyer de vrais messages SMTP.
 * Il communique avec Symfony Mailer, les entites metier et PHPUnit.
 */

namespace App\Tests\Email;

use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\Intervention;
use App\Entity\InterventionStatus;
use App\Entity\ServicePrestation;
use App\Entity\User;
use App\Entity\Vehicle;
use App\Service\Email\EmailNotificationService;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Symfony\Component\Mailer\Envelope;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\RawMessage;

/** Cette classe controle que les emails attendus sont construits sans divulguer de donnees internes. */
class EmailNotificationServiceTest extends TestCase
{
    /** Cette methode verifie qu'une acceptation de rendez-vous cree un email client. */
    public function testAcceptedAppointmentSendsEmailToClient(): void
    {
        $mailer = new CollectingMailer();
        $service = new EmailNotificationService($mailer, new NullLogger());

        $service->sendAppointmentAcceptedEmail($this->appointmentWithClientEmail());

        self::assertCount(1, $mailer->messages);
        self::assertSame('Votre rendez-vous GarageFlow est confirme', $mailer->messages[0]->getSubject());
        self::assertStringContainsString('Votre rendez-vous est confirme.', (string) $mailer->messages[0]->getTextBody());
        self::assertSame('client.email@garageflow.test', $mailer->messages[0]->getTo()[0]->getAddress());
    }

    /** Cette methode verifie que le refus de rendez-vous ajoute le motif fourni par le garage. */
    public function testRefusedAppointmentSendsEmailWithReason(): void
    {
        $mailer = new CollectingMailer();
        $service = new EmailNotificationService($mailer, new NullLogger());

        $service->sendAppointmentRefusedEmail($this->appointmentWithClientEmail(), 'Creneau indisponible');

        self::assertCount(1, $mailer->messages);
        self::assertSame('Votre rendez-vous GarageFlow a ete refuse', $mailer->messages[0]->getSubject());
        self::assertStringContainsString('Creneau indisponible', (string) $mailer->messages[0]->getTextBody());
    }

    /** Cette methode verifie que le statut VEHICULE_PRET envoie un email specifique au client. */
    public function testVehicleReadyInterventionSendsDedicatedEmail(): void
    {
        $mailer = new CollectingMailer();
        $service = new EmailNotificationService($mailer, new NullLogger());

        $service->sendVehicleReadyEmail($this->interventionWithStatus('VEHICULE_PRET', 'Vehicule pret'));

        self::assertCount(1, $mailer->messages);
        self::assertSame('Votre vehicule est pret', $mailer->messages[0]->getSubject());
        self::assertStringContainsString('Votre vehicule est pret a etre recupere aupres du garage.', (string) $mailer->messages[0]->getTextBody());
    }

    /** Cette methode verifie qu'une note interne garage ne se retrouve jamais dans l'email client. */
    public function testInternalNotesAreNotIncludedInClientEmail(): void
    {
        $mailer = new CollectingMailer();
        $service = new EmailNotificationService($mailer, new NullLogger());
        $intervention = $this->interventionWithStatus('DIAGNOSTIC_EN_COURS', 'Diagnostic en cours');
        $intervention->setNotesResume('Note interne confidentielle');

        $service->sendInterventionStatusChangedEmail($intervention, 'Message visible');

        self::assertCount(1, $mailer->messages);
        self::assertStringNotContainsString('Note interne confidentielle', (string) $mailer->messages[0]->getTextBody());
        self::assertStringContainsString('Message visible', (string) $mailer->messages[0]->getTextBody());
    }

    /** Cette methode verifie qu'un client sans email ne bloque pas l'action metier. */
    public function testClientWithoutEmailDoesNotCrashAndSendsNothing(): void
    {
        $mailer = new CollectingMailer();
        $service = new EmailNotificationService($mailer, new NullLogger());
        $appointment = $this->appointmentWithClientEmail();
        $appointment->setClient(new User());

        $service->sendAppointmentAcceptedEmail($appointment);

        self::assertCount(0, $mailer->messages);
    }

    /** Cette methode verifie qu'une erreur SMTP est ignoree pour ne pas annuler l'action principale. */
    public function testSmtpFailureDoesNotCrashBusinessAction(): void
    {
        $service = new EmailNotificationService(new FailingMailer(), new NullLogger());

        $service->sendAppointmentAcceptedEmail($this->appointmentWithClientEmail());

        self::assertTrue(true);
    }

    /** Cette methode construit un rendez-vous complet pour les emails de test. */
    private function appointmentWithClientEmail(): Appointment
    {
        $client = (new User())->setEmail('client.email@garageflow.test')->setNom('Client')->setPrenom('Email');
        $garage = (new Garage())->setNom('Garage Email')->setAdresse('1 rue Test')->setVille('Paris')->setCodePostal('75000');
        $vehicle = (new Vehicle())->setClient($client)->setMarque('Renault')->setModele('Clio')->setPlaqueImmatriculation('AA-123-AA')->setKilometrage(1000)->setAnnee(2020)->setCarburant('Essence');
        $service = (new ServicePrestation())->setGarage($garage)->setNom('Diagnostic')->setDureeMinutes(30)->setActif(true);

        return (new Appointment())
            ->setClient($client)
            ->setGarage($garage)
            ->setVehicle($vehicle)
            ->setService($service)
            ->setDateDebut(new \DateTimeImmutable('2030-01-10 09:00:00'))
            ->setDateFin(new \DateTimeImmutable('2030-01-10 09:30:00'));
    }

    /** Cette methode construit une intervention rattachee a un rendez-vous pour tester les statuts. */
    private function interventionWithStatus(string $code, string $label): Intervention
    {
        $status = (new InterventionStatus())->setCode($code)->setLibelle($label)->setOrdreAffichage(1)->setVisibleClient(true);

        return (new Intervention())
            ->setAppointment($this->appointmentWithClientEmail())
            ->setStatutActuel($status);
    }
}

/** Ce faux mailer garde les emails en memoire pour que le test puisse les inspecter. */
class CollectingMailer implements MailerInterface
{
    /** @var list<Email> */
    public array $messages = [];

    /** Cette methode remplace l'envoi SMTP par un stockage local dans le test. */
    public function send(RawMessage $message, ?Envelope $envelope = null): void
    {
        if ($message instanceof Email) {
            $this->messages[] = $message;
        }
    }
}

/** Ce faux mailer simule une panne SMTP afin de verifier que le service ne plante pas. */
class FailingMailer implements MailerInterface
{
    /** Cette methode lance une erreur comme le ferait un transport SMTP indisponible. */
    public function send(RawMessage $message, ?Envelope $envelope = null): void
    {
        throw new TransportException('SMTP indisponible pendant le test.');
    }
}