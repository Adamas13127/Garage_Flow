<?php

/*
 * Ce fichier teste la commande de donnees de demonstration GarageFlow.
 * Il existe pour verifier que le scenario jury peut etre cree automatiquement sans erreur.
 * Il communique avec Symfony Console, Doctrine et les entites principales du backend.
 */

namespace App\Tests\DemoData;

use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\Intervention;
use App\Entity\Notification;
use App\Entity\ServicePrestation;
use App\Entity\User;
use App\Entity\Vehicle;
use App\Tests\Shared\BaseApiTestCase;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Tester\CommandTester;

/** Cette classe verifie que la commande demo remplit la base de test avec les objets attendus. */
class CreateDemoDataCommandTest extends BaseApiTestCase
{
    /** Ce test execute la commande et controle les donnees minimales utiles a la demonstration. */
    public function testCreateDemoDataCommandCreatesExpectedObjects(): void
    {
        $application = new Application(self::$kernel);
        $command = $application->find('app:create-demo-data');
        $tester = new CommandTester($command);

        $exitCode = $tester->execute([]);
        $this->entityManager->clear();

        self::assertSame(0, $exitCode, $tester->getDisplay());
        self::assertStringContainsString('Donnees de demonstration GarageFlow pretes', $tester->getDisplay());
        self::assertInstanceOf(User::class, $this->entityManager->getRepository(User::class)->findOneBy(['email' => 'client.demo@garageflow.local']));
        self::assertInstanceOf(User::class, $this->entityManager->getRepository(User::class)->findOneBy(['email' => 'gerant.demo@garageflow.local']));
        self::assertInstanceOf(Garage::class, $this->entityManager->getRepository(Garage::class)->findOneBy(['email' => 'demo.garage@garageflow.local']));
        self::assertGreaterThanOrEqual(1, $this->entityManager->getRepository(Appointment::class)->count([]));
        self::assertGreaterThanOrEqual(1, $this->entityManager->getRepository(Intervention::class)->count([]));
        self::assertGreaterThanOrEqual(1, $this->entityManager->getRepository(Notification::class)->count([]));
    }

    /**
     * Ce test verifie qu'un rendez-vous de demonstration devenu perime (comme s'il n'avait pas ete
     * regenere depuis longtemps) redevient automatiquement futur au prochain lancement de la
     * commande, sans option particuliere. C'est la garantie que la soutenance du 17/09 ne reproduit
     * pas le piege deja rencontre en juillet sur le mobile : une date de demonstration figee qui
     * finit par passer dans le passe.
     */
    public function testRerunningTheCommandRefreshesAStaleAppointmentDate(): void
    {
        $application = new Application(self::$kernel);
        $comment = 'Vidange programmee, a annuler pour la demonstration si besoin.';

        self::assertSame(0, (new CommandTester($application->find('app:create-demo-data')))->execute([]));
        $this->entityManager->clear();

        $appointment = $this->entityManager->getRepository(Appointment::class)->findOneBy(['commentaireClient' => $comment]);
        self::assertInstanceOf(Appointment::class, $appointment);
        self::assertGreaterThan(new \DateTimeImmutable(), $appointment->getDateDebut());

        $staleStart = new \DateTimeImmutable('-30 days');
        $this->entityManager->getConnection()->executeStatement(
            'UPDATE appointment SET date_debut = :start, date_fin = :end WHERE id = :id',
            [
                'start' => $staleStart->format('Y-m-d H:i:s'),
                'end' => $staleStart->modify('+30 minutes')->format('Y-m-d H:i:s'),
                'id' => $appointment->getId(),
            ]
        );
        $this->entityManager->clear();

        self::assertSame(0, (new CommandTester($application->find('app:create-demo-data')))->execute([]));
        $this->entityManager->clear();

        $refreshed = $this->entityManager->getRepository(Appointment::class)->find($appointment->getId());
        self::assertInstanceOf(Appointment::class, $refreshed);
        self::assertGreaterThan(
            new \DateTimeImmutable(),
            $refreshed->getDateDebut(),
            'Le rendez-vous "confirme_annulable" doit redevenir futur des le prochain lancement de la commande, sans option --fresh.'
        );
    }

    /**
     * Ce test verifie que --fresh supprime les rendez-vous de demonstration qui ne font plus partie
     * du scenario actuel (par exemple un rendez-vous cree pendant une repetition la veille de la
     * soutenance), plutot que de les laisser trainer a cote des donnees recalculees.
     */
    public function testFreshOptionRemovesStrayDemoAppointments(): void
    {
        $application = new Application(self::$kernel);
        self::assertSame(0, (new CommandTester($application->find('app:create-demo-data')))->execute([]));
        $this->entityManager->clear();

        $garage = $this->entityManager->getRepository(Garage::class)->findOneBy(['email' => 'demo.garage@garageflow.local']);
        $client = $this->entityManager->getRepository(User::class)->findOneBy(['email' => 'client.demo@garageflow.local']);
        self::assertInstanceOf(Garage::class, $garage);
        self::assertInstanceOf(User::class, $client);
        $vehicle = $this->entityManager->getRepository(Vehicle::class)->findOneBy(['client' => $client]);
        $service = $this->entityManager->getRepository(ServicePrestation::class)->findOneBy(['garage' => $garage]);
        self::assertInstanceOf(Vehicle::class, $vehicle);
        self::assertInstanceOf(ServicePrestation::class, $service);

        $expectedCount = $this->entityManager->getRepository(Appointment::class)->count(['garage' => $garage, 'client' => $client]);

        $stray = (new Appointment())
            ->setGarage($garage)
            ->setClient($client)
            ->setVehicle($vehicle)
            ->setService($service)
            ->setDateDebut(new \DateTimeImmutable('+1 day'))
            ->setDateFin(new \DateTimeImmutable('+1 day +30 minutes'))
            ->setStatut(Appointment::STATUT_CONFIRME)
            ->setCommentaireClient('Rendez-vous de test laisse par une repetition.');
        $this->entityManager->persist($stray);
        $this->entityManager->flush();
        $strayId = $stray->getId();

        self::assertSame(0, (new CommandTester($application->find('app:create-demo-data')))->execute(['--fresh' => true]));
        $this->entityManager->clear();

        self::assertNull(
            $this->entityManager->getRepository(Appointment::class)->find($strayId),
            '--fresh doit supprimer les rendez-vous de demonstration hors scenario, pas seulement recalculer les dates.'
        );
        self::assertSame($expectedCount, $this->entityManager->getRepository(Appointment::class)->count(['garage' => $garage, 'client' => $client]));
    }
}
