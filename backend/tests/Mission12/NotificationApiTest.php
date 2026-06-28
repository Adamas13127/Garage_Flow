<?php

/*
 * Ce fichier teste les notifications in-app du backend GarageFlow.
 * Il existe pour verifier que les evenements MVP creent les notifications attendues.
 * Il communique avec NotificationController et les parcours rendez-vous/intervention.
 */

namespace App\Tests\Mission12;

use App\Tests\Shared\BaseApiTestCase;

/** Cette classe couvre les notifications applicatives et leur lecture. */
class NotificationApiTest extends BaseApiTestCase
{
    /** Cette methode verifie qu'un token est obligatoire pour consulter les notifications. */
    public function testNotificationsWithoutTokenReturnUnauthorized(): void
    {
        $this->requestJson('GET', '/api/notifications');
        $this->assertResponseStatus(401);
    }

    /** Cette methode teste RDV_DEMANDE, RDV_ACCEPTE, statut, VEHICULE_PRET et les actions de lecture. */
    public function testNotificationLifecycleForAcceptedAppointmentAndIntervention(): void
    {
        $context = $this->notificationContext();
        $appointmentId = $this->createAppointment($context, 0);

        $this->requestJson('GET', '/api/notifications', null, $context['managerToken']);
        $this->assertResponseStatus(200);
        self::assertNotNull($this->findNotification($this->lastJson['items'] ?? [], 'RDV_DEMANDE', $appointmentId));

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/accept', null, $context['managerToken']);
        $this->assertResponseStatus(200);
        $interventionId = (int) $this->lastJson['intervention']['id'];

        $this->requestJson('GET', '/api/notifications', null, $context['clientToken']);
        $this->assertResponseStatus(200);
        self::assertNotNull($this->findNotification($this->lastJson['items'] ?? [], 'RDV_ACCEPTE', $appointmentId));

        $this->requestJson('PATCH', '/api/garage/me/interventions/'.$interventionId.'/status', ['statusCode' => 'DIAGNOSTIC_EN_COURS'], $context['managerToken']);
        $this->assertResponseStatus(200);

        $this->requestJson('GET', '/api/notifications', null, $context['clientToken']);
        $statusCountBeforeReady = $this->countNotifications($this->lastJson['items'] ?? [], 'STATUT_INTERVENTION_CHANGE', $interventionId);
        self::assertSame(1, $statusCountBeforeReady);

        $this->requestJson('PATCH', '/api/garage/me/interventions/'.$interventionId.'/status', ['statusCode' => 'VEHICULE_PRET'], $context['managerToken']);
        $this->assertResponseStatus(200);
        $this->requestJson('GET', '/api/notifications', null, $context['clientToken']);
        $items = $this->lastJson['items'] ?? [];
        self::assertSame(1, $this->countNotifications($items, 'VEHICULE_PRET', $interventionId));
        self::assertSame($statusCountBeforeReady, $this->countNotifications($items, 'STATUT_INTERVENTION_CHANGE', $interventionId));

        $this->requestJson('GET', '/api/notifications?unreadOnly=true', null, $context['clientToken']);
        $this->assertResponseStatus(200);
        self::assertNotEmpty($this->lastJson['items'] ?? []);
        self::assertSame([], array_filter($this->lastJson['items'] ?? [], fn (array $item): bool => ($item['lu'] ?? true) !== false));
        $notificationId = (int) $this->lastJson['items'][0]['id'];

        $this->requestJson('PATCH', '/api/notifications/'.$notificationId.'/read', null, $context['clientToken']);
        $this->assertResponseStatus(200);
        self::assertTrue((bool) ($this->lastJson['lu'] ?? false));
        self::assertNotNull($this->lastJson['readAt'] ?? null);

        $this->requestJson('PATCH', '/api/notifications/'.$notificationId.'/read', null, $context['managerToken']);
        $this->assertResponseStatus(404);
    }

    /** Cette methode teste RDV_REFUSE cote client. */
    public function testRefusedAppointmentCreatesClientNotification(): void
    {
        $context = $this->notificationContext();
        $appointmentId = $this->createAppointment($context, 1);

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/refuse', ['motifRefus' => 'Indisponible'], $context['managerToken']);
        $this->assertResponseStatus(200);
        $this->requestJson('GET', '/api/notifications', null, $context['clientToken']);
        self::assertNotNull($this->findNotification($this->lastJson['items'] ?? [], 'RDV_REFUSE', $appointmentId));
    }

    /** Cette methode teste RDV_ANNULE cote garage et la lecture globale. */
    public function testCancelledAppointmentCreatesGarageNotificationAndReadAllWorks(): void
    {
        $context = $this->notificationContext();
        $appointmentId = $this->createAppointment($context, 2);

        $this->requestJson('PATCH', '/api/client/appointments/'.$appointmentId.'/cancel', null, $context['clientToken']);
        $this->assertResponseStatus(200);
        $this->requestJson('GET', '/api/notifications', null, $context['managerToken']);
        self::assertNotNull($this->findNotification($this->lastJson['items'] ?? [], 'RDV_ANNULE', $appointmentId));

        $this->requestJson('PATCH', '/api/notifications/read-all', null, $context['managerToken']);
        $this->assertResponseStatus(200);
        self::assertGreaterThanOrEqual(1, (int) ($this->lastJson['updatedCount'] ?? 0));
    }

    /** Cette methode construit les donnees communes aux tests notifications. */
    private function notificationContext(): array
    {
        $garageData = $this->factory->garageWithManager();
        $clientData = $this->factory->clientWithVehicle();

        return $garageData + $clientData + [
            'managerToken' => $this->jwt->tokenFor((string) $garageData['manager']->getEmail()),
            'clientToken' => $this->jwt->tokenFor((string) $clientData['client']->getEmail()),
        ];
    }

    /** Cette methode cree un rendez-vous et retourne son id. */
    private function createAppointment(array $context, int $offsetHours): int
    {
        $this->requestJson('POST', '/api/client/appointments', ['garageId' => $context['garage']->getId(), 'vehicleId' => $context['vehicle']->getId(), 'serviceId' => $context['service']->getId(), 'dateDebut' => $this->factory->futureSlot($offsetHours)->format(DATE_ATOM)], $context['clientToken']);
        $this->assertResponseStatus(201);

        return (int) $this->lastJson['id'];
    }

    /** Cette methode compte les notifications d'un type pour une intervention. */
    private function countNotifications(array $items, string $type, int $interventionId): int
    {
        return count(array_filter($items, fn (array $item): bool => ($item['type'] ?? null) === $type && (int) ($item['interventionId'] ?? 0) === $interventionId));
    }
}