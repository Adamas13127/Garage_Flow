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
use App\Entity\User;
use App\Tests\Shared\BaseApiTestCase;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Tester\CommandTester;

/** Cette classe verifie que la commande demo remplit la base de test avec les objets attendus. */
class CreateDemoDataCommandTest extends BaseApiTestCase
{
    /** Ce test execute la commande et controle les donnees minimales utiles a la demonstration. */
    public function testCreateDemoDataCommandCreatesExpectedObjects(): void
    {
        $application = new Application(static::bootKernel());
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
}