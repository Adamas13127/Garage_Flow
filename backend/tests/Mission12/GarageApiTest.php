<?php

/*
 * Ce fichier teste les routes publiques et de gestion garage du backend GarageFlow.
 * Il existe pour verifier les droits, prestations, horaires et indisponibilites.
 * Il communique avec GarageCatalogController, GarageManagementController et les services metier garage.
 */

namespace App\Tests\Mission12;

use App\Tests\Shared\BaseApiTestCase;

/** Cette classe couvre les controles essentiels du catalogue et de la gestion garage. */
class GarageApiTest extends BaseApiTestCase
{
    /** Cette methode verifie le catalogue public et les droits d'acces au garage connecte. */
    public function testGarageCatalogAndAccessRights(): void
    {
        ['manager' => $manager] = $this->factory->garageWithManager();
        ['client' => $client] = $this->factory->clientWithVehicle();
        $clientToken = $this->jwt->tokenFor((string) $client->getEmail());
        $managerToken = $this->jwt->tokenFor((string) $manager->getEmail());

        $this->requestJson('GET', '/api/garages');
        $this->assertResponseStatus(200);

        $this->requestJson('GET', '/api/garage/me', null, $clientToken);
        $this->assertResponseStatus(403);

        $this->requestJson('GET', '/api/garage/me', null, $managerToken);
        $this->assertResponseStatus(200);
    }

    /** Cette methode teste la creation de prestations et ses validations de duree. */
    public function testServiceCreationAndValidation(): void
    {
        ['manager' => $manager] = $this->factory->garageWithManager();
        $token = $this->jwt->tokenFor((string) $manager->getEmail());

        $this->requestJson('POST', '/api/garage/me/services', ['nom' => 'Vidange', 'description' => 'Test', 'dureeMinutes' => 45, 'actif' => true], $token);
        $this->assertResponseStatus(201);

        foreach ([0, -10] as $duration) {
            $this->requestJson('POST', '/api/garage/me/services', ['nom' => 'Invalide', 'dureeMinutes' => $duration], $token);
            $this->assertResponseStatus(400);
        }
    }

    /** Cette methode teste les validations d'horaires de garage. */
    public function testOpeningHourValidation(): void
    {
        ['manager' => $manager] = $this->factory->garageWithManager();
        $token = $this->jwt->tokenFor((string) $manager->getEmail());

        $this->requestJson('POST', '/api/garage/me/opening-hours', ['jourSemaine' => 8, 'heureDebut' => '09:00', 'heureFin' => '18:00', 'actif' => true], $token);
        $this->assertResponseStatus(400);

        $this->requestJson('POST', '/api/garage/me/opening-hours', ['jourSemaine' => 1, 'heureDebut' => '18:00', 'heureFin' => '09:00', 'actif' => true], $token);
        $this->assertResponseStatus(400);
    }

    /** Cette methode teste qu'une indisponibilite doit avoir une date de fin apres la date de debut. */
    public function testUnavailabilityValidation(): void
    {
        ['manager' => $manager] = $this->factory->garageWithManager();
        $token = $this->jwt->tokenFor((string) $manager->getEmail());

        $this->requestJson('POST', '/api/garage/me/unavailabilities', ['dateDebut' => '2030-01-10T12:00:00+01:00', 'dateFin' => '2030-01-10T10:00:00+01:00', 'motif' => 'Formation'], $token);
        $this->assertResponseStatus(400);
    }

    /** Cette methode verifie quelques entrees robustes sur les textes acceptes par le garage. */
    public function testSpecialStringsStayHandled(): void
    {
        ['manager' => $manager] = $this->factory->garageWithManager();
        $token = $this->jwt->tokenFor((string) $manager->getEmail());

        $this->requestJson('POST', '/api/garage/me/services', ['nom' => 'Révision <script>alert(1)</script>', 'description' => "Test ' OR 1=1 --", 'dureeMinutes' => 30], $token);
        $this->assertResponseStatus(201);
        self::assertStringContainsString('script', (string) ($this->lastJson['nom'] ?? ''));
    }
}