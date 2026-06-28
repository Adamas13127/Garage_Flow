<?php

/*
 * Ce fichier declare la classe de base des tests API GarageFlow.
 * Il existe pour centraliser les appels JSON, le nettoyage de la base de test et les assertions communes.
 * Il communique avec Symfony WebTestCase, Doctrine ORM, TestDataFactory et les controleurs HTTP.
 */

namespace App\Tests\Shared;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/** Cette classe donne aux tests un client HTTP et une base nettoyee avant chaque scenario. */
abstract class BaseApiTestCase extends WebTestCase
{
    protected KernelBrowser $client;
    protected EntityManagerInterface $entityManager;
    protected TestDataFactory $factory;
    protected JwtTestHelper $jwt;
    protected ?array $lastJson = null;

    /** Cette methode prepare un kernel propre et des donnees de reference pour chaque test. */
    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get('doctrine')->getManager();
        $this->resetDatabase();
        $this->factory = new TestDataFactory($this->entityManager);
        $this->factory->ensureReferenceData();
        $this->jwt = new JwtTestHelper($this);
    }

    /** Cette methode ferme proprement le gestionnaire Doctrine apres chaque test. */
    protected function tearDown(): void
    {
        parent::tearDown();
        unset($this->factory, $this->jwt);
    }

    /** Cette methode envoie une requete JSON comme le ferait le web ou le mobile. */
    public function requestJson(string $method, string $uri, ?array $payload = null, ?string $token = null): array
    {
        $server = ['HTTP_ACCEPT' => 'application/json'];
        $content = '';

        if ($payload !== null) {
            $server['CONTENT_TYPE'] = 'application/json';
            $content = json_encode($payload, JSON_THROW_ON_ERROR);
        }

        if ($token !== null) {
            $server['HTTP_AUTHORIZATION'] = 'Bearer '.$token;
        }

        $this->client->request($method, $uri, [], [], $server, $content);
        $body = $this->client->getResponse()->getContent();
        $this->lastJson = is_string($body) && $body !== '' ? json_decode($body, true) : null;

        return is_array($this->lastJson) ? $this->lastJson : [];
    }

    /** Cette methode verifie le code HTTP de la derniere reponse. */
    public function assertResponseStatus(int $expected): void
    {
        self::assertSame($expected, $this->client->getResponse()->getStatusCode(), (string) $this->client->getResponse()->getContent());
    }

    /** Cette methode verifie qu'une reponse JSON ne contient jamais de mot de passe. */
    protected function assertJsonDoesNotExposePassword(): void
    {
        self::assertStringNotContainsString('password', (string) $this->client->getResponse()->getContent());
    }

    /** Cette methode retrouve une notification precise dans une liste API. */
    protected function findNotification(array $items, string $type, ?int $appointmentId = null, ?int $interventionId = null): ?array
    {
        foreach ($items as $item) {
            if (($item['type'] ?? null) !== $type) {
                continue;
            }
            if ($appointmentId !== null && (int) ($item['appointmentId'] ?? 0) !== $appointmentId) {
                continue;
            }
            if ($interventionId !== null && (int) ($item['interventionId'] ?? 0) !== $interventionId) {
                continue;
            }

            return $item;
        }

        return null;
    }

    /** Cette methode nettoie uniquement la base de test pour eviter de toucher a la base de developpement. */
    private function resetDatabase(): void
    {
        $databaseName = (string) $this->entityManager->getConnection()->getDatabase();
        if (!str_ends_with($databaseName, '_test')) {
            self::fail('La base de tests doit se terminer par _test pour eviter de supprimer des donnees de developpement. Base actuelle: '.$databaseName);
        }

        $connection = $this->entityManager->getConnection();
        $connection->executeStatement('SET FOREIGN_KEY_CHECKS=0');
        foreach (['action_log', 'notification', 'internal_note', 'intervention_status_history', 'intervention', 'appointment', 'vehicle', 'unavailability', 'opening_hour', 'service_prestation', 'user', 'garage', 'intervention_status', 'role'] as $table) {
            $connection->executeStatement('DELETE FROM `'.$table.'`');
        }
        $connection->executeStatement('SET FOREIGN_KEY_CHECKS=1');
        $this->entityManager->clear();
    }
}