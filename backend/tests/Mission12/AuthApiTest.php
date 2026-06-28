<?php

/*
 * Ce fichier teste les routes d'authentification du backend GarageFlow.
 * Il existe pour verifier l'inscription client, le login JWT et la route /api/me.
 * Il communique avec les routes AuthController et la base de test via BaseApiTestCase.
 */

namespace App\Tests\Mission12;

use App\Tests\Shared\BaseApiTestCase;
use App\Tests\Shared\TestDataFactory;

/** Cette classe verifie les comportements essentiels de l'authentification API. */
class AuthApiTest extends BaseApiTestCase
{
    /** Cette methode teste une inscription client valide et controle l'absence du mot de passe dans la reponse. */
    public function testRegisterClientValidReturnsCreated(): void
    {
        $this->requestJson('POST', '/api/auth/register/client', $this->registrationPayload('client.auth@garageflow.test'));

        $this->assertResponseStatus(201);
        $this->assertJsonDoesNotExposePassword();
        self::assertSame('client.auth@garageflow.test', $this->lastJson['email'] ?? null);
    }

    /** Cette methode verifie les erreurs de validation principales de l'inscription. */
    public function testRegisterClientValidationErrors(): void
    {
        $cases = [
            'email invalide' => ['email' => 'email-invalide', 'expectedField' => 'email'],
            'mot de passe court' => ['password' => 'short', 'expectedField' => 'password'],
            'nom trop long' => ['nom' => str_repeat('A', 101), 'expectedField' => 'nom'],
            'caracteres speciaux acceptes' => ['prenom' => 'Yannis <script>alert(1)</script>', 'expectedField' => null],
        ];

        foreach ($cases as $label => $case) {
            $payload = $this->registrationPayload('client.'.md5($label).'@garageflow.test');
            $field = $case['expectedField'];
            unset($case['expectedField']);
            $payload = array_merge($payload, $case);
            $this->requestJson('POST', '/api/auth/register/client', $payload);
            $field === null ? $this->assertResponseStatus(201) : $this->assertResponseStatus(400);
            if ($field !== null) {
                self::assertArrayHasKey($field, $this->lastJson['errors'] ?? []);
            }
        }
    }

    /** Cette methode verifie qu'un email deja inscrit provoque un conflit clair. */
    public function testRegisterClientDuplicateEmailReturnsConflict(): void
    {
        $payload = $this->registrationPayload('duplicate@garageflow.test');
        $this->requestJson('POST', '/api/auth/register/client', $payload);
        $this->assertResponseStatus(201);

        $this->requestJson('POST', '/api/auth/register/client', $payload);
        $this->assertResponseStatus(409);
    }

    /** Cette methode teste le login valide, le mauvais mot de passe et /api/me. */
    public function testLoginAndMe(): void
    {
        ['client' => $client] = $this->factory->clientWithVehicle('login.client@garageflow.test');

        $login = $this->requestJson('POST', '/api/auth/login', ['email' => $client->getEmail(), 'password' => TestDataFactory::DEFAULT_PASSWORD]);
        $this->assertResponseStatus(200);
        self::assertArrayHasKey('token', $login);
        $this->assertJsonDoesNotExposePassword();

        $this->requestJson('POST', '/api/auth/login', ['email' => $client->getEmail(), 'password' => 'MauvaisPassword']);
        $this->assertResponseStatus(401);

        $this->requestJson('GET', '/api/me');
        $this->assertResponseStatus(401);

        $this->requestJson('GET', '/api/me', null, (string) $login['token']);
        $this->assertResponseStatus(200);
        self::assertSame($client->getEmail(), $this->lastJson['email'] ?? null);
        $this->assertJsonDoesNotExposePassword();
    }

    /** Cette methode construit un body d'inscription reutilisable par les tests. */
    private function registrationPayload(string $email): array
    {
        return ['nom' => 'Client', 'prenom' => 'Test', 'email' => $email, 'password' => TestDataFactory::DEFAULT_PASSWORD, 'telephone' => '0601020304'];
    }
}