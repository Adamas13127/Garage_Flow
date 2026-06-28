<?php

/*
 * Ce fichier declare un helper de connexion JWT pour les tests GarageFlow.
 * Il existe pour eviter de recopier les appels login dans chaque classe de test.
 * Il communique avec BaseApiTestCase et la route /api/auth/login du backend.
 */

namespace App\Tests\Shared;

/** Ce helper demande un token JWT reel a l'API pour tester les routes protegees. */
class JwtTestHelper
{
    public function __construct(private readonly BaseApiTestCase $testCase)
    {
    }

    /** Cette methode connecte un utilisateur de test et retourne son token JWT. */
    public function tokenFor(string $email, string $password = TestDataFactory::DEFAULT_PASSWORD): string
    {
        $json = $this->testCase->requestJson('POST', '/api/auth/login', ['email' => $email, 'password' => $password]);
        $this->testCase->assertResponseStatus(200);
        $this->testCase::assertArrayHasKey('token', $json);

        return (string) $json['token'];
    }
}