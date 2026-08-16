<?php

/*
 * Ce fichier teste les declencheurs SQL ajoutes par Version20260816200000.
 * Il existe pour prouver que le controle et l'audit fonctionnent au niveau base de donnees,
 * independamment du chemin d'acces (pas seulement via le code applicatif Symfony).
 * Il communique directement avec la connexion Doctrine DBAL, hors ORM.
 */

namespace App\Tests\Mission12;

use App\Tests\Shared\BaseApiTestCase;
use Doctrine\DBAL\Exception as DbalException;

class DatabaseTriggersTest extends BaseApiTestCase
{
    public function testNotificationTriggerRejectsInsertWithoutAppointmentOrIntervention(): void
    {
        ['client' => $client] = $this->factory->clientWithVehicle();

        $this->expectException(DbalException::class);
        $this->expectExceptionMessageMatches('/intervention_id doit etre renseigne/');

        $this->entityManager->getConnection()->executeStatement(
            'INSERT INTO notification (recipient_id, appointment_id, intervention_id, type, canal, contenu, lu, created_at) VALUES (?, NULL, NULL, ?, ?, ?, 0, NOW())',
            [$client->getId(), 'TEST', 'APP', 'insertion invalide de test']
        );
    }

    public function testNotificationTriggerAcceptsInsertWithAppointmentOnly(): void
    {
        $context = $this->factory->garageWithManager() + $this->factory->clientWithVehicle();
        $this->requestJson('POST', '/api/client/appointments', [
            'garageId' => $context['garage']->getId(),
            'vehicleId' => $context['vehicle']->getId(),
            'serviceId' => $context['service']->getId(),
            'dateDebut' => $this->factory->futureSlot()->format(DATE_ATOM),
            'commentaireClient' => 'Test declencheur',
        ], $this->jwt->tokenFor((string) $context['client']->getEmail()));
        $this->assertResponseStatus(201);

        $affected = $this->entityManager->getConnection()->executeStatement(
            'INSERT INTO notification (recipient_id, appointment_id, intervention_id, type, canal, contenu, lu, created_at) VALUES (?, ?, NULL, ?, ?, ?, 0, NOW())',
            [$context['client']->getId(), $this->lastJson['id'], 'TEST', 'APP', 'insertion valide de test']
        );

        self::assertSame(1, $affected);
    }

    public function testUserAuditTriggerLogsRoleOrStatusChange(): void
    {
        ['manager' => $manager] = $this->factory->garageWithManager();
        $this->entityManager->flush();
        $connection = $this->entityManager->getConnection();

        $before = (int) $connection->fetchOne('SELECT COUNT(*) FROM action_log WHERE id_entite_concernee = ?', [$manager->getId()]);
        self::assertSame(0, $before);

        $connection->executeStatement('UPDATE `user` SET actif = NOT actif WHERE id = ?', [$manager->getId()]);

        $row = $connection->fetchAssociative(
            'SELECT action, entite_concernee, description FROM action_log WHERE id_entite_concernee = ? ORDER BY id DESC LIMIT 1',
            [$manager->getId()]
        );

        self::assertIsArray($row);
        self::assertSame('USER_SENSITIVE_UPDATE', $row['action']);
        self::assertSame('User', $row['entite_concernee']);
        self::assertStringContainsString('actif:', $row['description']);
    }

    public function testUserAuditTriggerDoesNotLogUnrelatedFieldChange(): void
    {
        ['manager' => $manager] = $this->factory->garageWithManager();
        $this->entityManager->flush();
        $connection = $this->entityManager->getConnection();

        $connection->executeStatement('UPDATE `user` SET telephone = ? WHERE id = ?', ['0699999999', $manager->getId()]);

        $count = (int) $connection->fetchOne('SELECT COUNT(*) FROM action_log WHERE id_entite_concernee = ?', [$manager->getId()]);
        self::assertSame(0, $count);
    }
}
