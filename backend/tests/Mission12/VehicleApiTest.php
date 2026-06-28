<?php

/*
 * Ce fichier teste les routes de gestion des vehicules client du backend GarageFlow.
 * Il existe pour verifier les validations, les doublons et l'isolation entre clients.
 * Il communique avec VehicleController, VehicleService et les helpers de tests partages.
 */

namespace App\Tests\Mission12;

use App\Tests\Shared\BaseApiTestCase;

/** Cette classe couvre les cas critiques de l'API vehicules client. */
class VehicleApiTest extends BaseApiTestCase
{
    /** Cette methode verifie qu'un token est obligatoire pour lister les vehicules. */
    public function testListVehiclesWithoutTokenReturnsUnauthorized(): void
    {
        $this->requestJson('GET', '/api/client/vehicles');
        $this->assertResponseStatus(401);
    }

    /** Cette methode teste la creation valide, le kilometrage zero et les donnees speciales acceptables. */
    public function testCreateVehicleValidReturnsCreated(): void
    {
        ['client' => $client] = $this->factory->clientWithVehicle();
        $token = $this->jwt->tokenFor((string) $client->getEmail());

        $this->requestJson('POST', '/api/client/vehicles', $this->vehiclePayload(['plaqueImmatriculation' => 'AA-TEST-1', 'kilometrage' => 0, 'marque' => 'Citroen e-C4']), $token);
        $this->assertResponseStatus(201);
        self::assertSame(0, $this->lastJson['kilometrage'] ?? null);
        $this->assertJsonDoesNotExposePassword();
    }

    /** Cette methode verifie les validations principales du formulaire vehicule. */
    public function testCreateVehicleValidationErrors(): void
    {
        ['client' => $client] = $this->factory->clientWithVehicle();
        $token = $this->jwt->tokenFor((string) $client->getEmail());
        $cases = [
            'marque' => ['marque' => ''],
            'modele' => ['modele' => ''],
            'plaqueImmatriculation' => ['plaqueImmatriculation' => ''],
            'kilometrage' => ['kilometrage' => -1],
            'annee ancienne' => ['annee' => 1899],
            'annee future' => ['annee' => ((int) date('Y')) + 2],
            'tres grand kilometrage negatif logique' => ['kilometrage' => -999999999],
        ];

        foreach ($cases as $label => $override) {
            $payload = $this->vehiclePayload(['plaqueImmatriculation' => 'ERR-'.substr(md5($label), 0, 8)] + $override);
            $this->requestJson('POST', '/api/client/vehicles', $payload, $token);
            $this->assertResponseStatus(400);
        }
    }

    /** Cette methode verifie qu'une plaque ne peut pas etre dupliquee pour le meme client. */
    public function testDuplicatePlateForSameClientReturnsConflict(): void
    {
        ['client' => $client] = $this->factory->clientWithVehicle();
        $token = $this->jwt->tokenFor((string) $client->getEmail());
        $payload = $this->vehiclePayload(['plaqueImmatriculation' => 'DUP-123']);

        $this->requestJson('POST', '/api/client/vehicles', $payload, $token);
        $this->assertResponseStatus(201);
        $this->requestJson('POST', '/api/client/vehicles', $payload, $token);
        $this->assertResponseStatus(409);
    }

    /** Cette methode verifie qu'un client ne consulte, modifie ou supprime pas le vehicule d'un autre. */
    public function testClientCannotAccessOtherClientVehicle(): void
    {
        ['client' => $owner, 'vehicle' => $vehicle] = $this->factory->clientWithVehicle('owner.vehicle@garageflow.test');
        ['client' => $other] = $this->factory->clientWithVehicle('other.vehicle@garageflow.test');
        $otherToken = $this->jwt->tokenFor((string) $other->getEmail());

        $this->requestJson('GET', '/api/client/vehicles/'.$vehicle->getId(), null, $otherToken);
        $this->assertResponseStatus(404);
        $this->requestJson('PATCH', '/api/client/vehicles/'.$vehicle->getId(), ['marque' => 'Peugeot'], $otherToken);
        $this->assertResponseStatus(404);
        $this->requestJson('DELETE', '/api/client/vehicles/'.$vehicle->getId(), null, $otherToken);
        $this->assertResponseStatus(404);
        self::assertNotSame($owner->getEmail(), $other->getEmail());
    }

    /** Cette methode construit une demande vehicule complete et surchargeable. */
    private function vehiclePayload(array $override = []): array
    {
        return array_merge(['marque' => 'Renault', 'modele' => 'Clio', 'plaqueImmatriculation' => 'GF-TEST', 'kilometrage' => 12000, 'annee' => 2020, 'carburant' => 'Essence'], $override);
    }
}