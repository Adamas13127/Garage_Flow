<?php

/*
 * Ce fichier teste la journalisation applicative dans action_log du backend GarageFlow.
 * Il existe pour verifier qu'une entree est bien creee, avec le bon auteur, pour les actions
 * metier listees dans la matrice des droits (voir docs/technique/TRACABILITE.md).
 * Il communique avec ActionLogService via les services metier reels, pas de mock.
 */

namespace App\Tests\Mission12;

use App\Entity\ActionLog;
use App\Service\ActionLogService;
use App\Tests\Shared\BaseApiTestCase;

class ActionLogApiTest extends BaseApiTestCase
{
    public function testAppointmentCreationIsLoggedWithClientAsAuthor(): void
    {
        $context = $this->appointmentContext();
        $slot = $this->factory->futureSlot();

        $this->requestJson('POST', '/api/client/appointments', [
            'garageId' => $context['garage']->getId(),
            'vehicleId' => $context['vehicle']->getId(),
            'serviceId' => $context['service']->getId(),
            'dateDebut' => $slot->format(DATE_ATOM),
            'commentaireClient' => 'Test journalisation',
        ], $context['clientToken']);
        $this->assertResponseStatus(201);
        $appointmentId = (int) $this->lastJson['id'];

        $entry = $this->findLog(ActionLogService::APPOINTMENT_CREATED, 'Appointment', $appointmentId);
        self::assertNotNull($entry);
        self::assertSame($context['client']->getId(), $entry->getUser()?->getId());
        self::assertSame($context['garage']->getId(), $entry->getGarage()?->getId());
    }

    public function testAppointmentAcceptanceLogsBothAppointmentAndInterventionWithManagerAsAuthor(): void
    {
        $context = $this->appointmentContext();
        $appointmentId = $this->createAppointment($context);

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/accept', null, $context['managerToken']);
        $this->assertResponseStatus(200);
        $interventionId = (int) $this->lastJson['intervention']['id'];

        $acceptedEntry = $this->findLog(ActionLogService::APPOINTMENT_ACCEPTED, 'Appointment', $appointmentId);
        self::assertNotNull($acceptedEntry);
        self::assertSame($context['manager']->getId(), $acceptedEntry->getUser()?->getId());

        $interventionEntry = $this->findLog(ActionLogService::INTERVENTION_CREATED, 'Intervention', $interventionId);
        self::assertNotNull($interventionEntry);
        self::assertSame($context['manager']->getId(), $interventionEntry->getUser()?->getId());
    }

    public function testAppointmentRefusalIsLoggedWithManagerAsAuthor(): void
    {
        $context = $this->appointmentContext();
        $appointmentId = $this->createAppointment($context);

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/refuse', ['motifRefus' => 'Test'], $context['managerToken']);
        $this->assertResponseStatus(200);

        $entry = $this->findLog(ActionLogService::APPOINTMENT_REFUSED, 'Appointment', $appointmentId);
        self::assertNotNull($entry);
        self::assertSame($context['manager']->getId(), $entry->getUser()?->getId());
    }

    public function testAppointmentCancellationIsLoggedWithClientAsAuthor(): void
    {
        $context = $this->appointmentContext();
        $appointmentId = $this->createAppointment($context);

        $this->requestJson('PATCH', '/api/client/appointments/'.$appointmentId.'/cancel', null, $context['clientToken']);
        $this->assertResponseStatus(200);

        $entry = $this->findLog(ActionLogService::APPOINTMENT_CANCELLED, 'Appointment', $appointmentId);
        self::assertNotNull($entry);
        self::assertSame($context['client']->getId(), $entry->getUser()?->getId());
    }

    public function testInterventionStatusChangeIsLoggedWithoutReplacingHistory(): void
    {
        $context = $this->appointmentContext();
        $appointmentId = $this->createAppointment($context);
        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/accept', null, $context['managerToken']);
        $this->assertResponseStatus(200);
        $interventionId = (int) $this->lastJson['intervention']['id'];

        $this->requestJson('PATCH', '/api/garage/me/interventions/'.$interventionId.'/status', ['statusCode' => 'DIAGNOSTIC_EN_COURS'], $context['managerToken']);
        $this->assertResponseStatus(200);

        $entry = $this->findLog(ActionLogService::INTERVENTION_STATUS_CHANGED, 'Intervention', $interventionId);
        self::assertNotNull($entry);
        self::assertSame($context['manager']->getId(), $entry->getUser()?->getId());

        $this->requestJson('GET', '/api/garage/me/interventions/'.$interventionId, null, $context['managerToken']);
        self::assertGreaterThanOrEqual(2, count($this->lastJson['history']), 'intervention_status_history doit rester alimentee independamment de action_log');
    }

    public function testServicePrestationCreationIsLoggedWithManagerAsAuthor(): void
    {
        ['manager' => $manager, 'garage' => $garage] = $this->factory->garageWithManager();
        $token = $this->jwt->tokenFor((string) $manager->getEmail());

        $this->requestJson('POST', '/api/garage/me/services', ['nom' => 'Vidange', 'description' => 'Test', 'dureeMinutes' => 30, 'actif' => true], $token);
        $this->assertResponseStatus(201);
        $serviceId = (int) $this->lastJson['id'];

        $entry = $this->findLog(ActionLogService::SERVICE_CREATED, 'ServicePrestation', $serviceId);
        self::assertNotNull($entry);
        self::assertSame($manager->getId(), $entry->getUser()?->getId());
        self::assertSame($garage->getId(), $entry->getGarage()?->getId());
    }

    public function testGarageUpdateIsLoggedWithManagerAsAuthor(): void
    {
        ['manager' => $manager, 'garage' => $garage] = $this->factory->garageWithManager();
        $token = $this->jwt->tokenFor((string) $manager->getEmail());

        $this->requestJson('PATCH', '/api/garage/me', ['nom' => 'Nouveau nom'], $token);
        $this->assertResponseStatus(200);

        $entry = $this->findLog(ActionLogService::GARAGE_UPDATED, 'Garage', $garage->getId());
        self::assertNotNull($entry);
        self::assertSame($manager->getId(), $entry->getUser()?->getId());
    }

    /**
     * @return array<string, mixed>
     */
    private function appointmentContext(): array
    {
        $garageData = $this->factory->garageWithManager();
        $clientData = $this->factory->clientWithVehicle();

        return $garageData + $clientData + [
            'managerToken' => $this->jwt->tokenFor((string) $garageData['manager']->getEmail()),
            'clientToken' => $this->jwt->tokenFor((string) $clientData['client']->getEmail()),
        ];
    }

    /**
     * @param array<string, mixed> $context
     */
    private function createAppointment(array $context): int
    {
        $this->requestJson('POST', '/api/client/appointments', [
            'garageId' => $context['garage']->getId(),
            'vehicleId' => $context['vehicle']->getId(),
            'serviceId' => $context['service']->getId(),
            'dateDebut' => $this->factory->futureSlot()->format(DATE_ATOM),
            'commentaireClient' => 'Test journalisation',
        ], $context['clientToken']);
        $this->assertResponseStatus(201);

        return (int) $this->lastJson['id'];
    }

    private function findLog(string $action, string $entiteConcernee, int $idEntiteConcernee): ?ActionLog
    {
        return $this->entityManager->getRepository(ActionLog::class)->findOneBy([
            'action' => $action,
            'entiteConcernee' => $entiteConcernee,
            'idEntiteConcernee' => $idEntiteConcernee,
        ]);
    }
}
