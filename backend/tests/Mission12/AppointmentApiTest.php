<?php

/*
 * Ce fichier teste les rendez-vous client et les decisions garage du backend GarageFlow.
 * Il existe pour verifier les creneaux, conflits, annulations, acceptations et refus.
 * Il communique avec les controleurs de rendez-vous client et garage.
 */

namespace App\Tests\Mission12;

use App\Tests\Shared\BaseApiTestCase;

/** Cette classe couvre le cycle principal d'un rendez-vous du MVP. */
class AppointmentApiTest extends BaseApiTestCase
{
    /** Cette methode teste les creneaux disponibles, la creation et les conflits de rendez-vous. */
    public function testAppointmentCreationConflictsAndCancellation(): void
    {
        $context = $this->appointmentContext();
        $slot = $this->factory->futureSlot();

        $this->requestJson('GET', '/api/garages/'.$context['garage']->getId().'/available-slots?serviceId='.$context['service']->getId().'&date='.$slot->format('Y-m-d'));
        $this->assertResponseStatus(200);
        self::assertNotEmpty($this->lastJson);

        $this->requestJson('POST', '/api/client/appointments', $this->appointmentPayload($context, $slot));
        $this->assertResponseStatus(401);

        $this->requestJson('POST', '/api/client/appointments', $this->appointmentPayload($context, $slot), $context['clientToken']);
        $this->assertResponseStatus(201);
        $appointmentId = (int) $this->lastJson['id'];

        $this->requestJson('POST', '/api/client/appointments', $this->appointmentPayload($context, $slot), $context['clientToken']);
        $this->assertResponseStatus(409);

        $this->requestJson('PATCH', '/api/client/appointments/'.$appointmentId.'/cancel', null, $context['clientToken']);
        $this->assertResponseStatus(200);

        $this->requestJson('POST', '/api/client/appointments', $this->appointmentPayload($context, $slot), $context['clientToken']);
        $this->assertResponseStatus(201);
    }

    /** Cette methode verifie qu'un client ne peut pas utiliser le vehicule d'un autre client. */
    public function testCreateAppointmentWithOtherClientVehicleReturnsNotFound(): void
    {
        $context = $this->appointmentContext();
        ['vehicle' => $otherVehicle] = $this->factory->clientWithVehicle('other.appointment@garageflow.test');
        $payload = $this->appointmentPayload($context, $this->factory->futureSlot(), ['vehicleId' => $otherVehicle->getId()]);

        $this->requestJson('POST', '/api/client/appointments', $payload, $context['clientToken']);
        $this->assertResponseStatus(404);
    }

    /** Cette methode teste les droits garage, l'acceptation et l'intervention creee automatiquement. */
    public function testGarageAcceptAppointmentCreatesInterventionAndRejectsSecondAccept(): void
    {
        $context = $this->appointmentContext();
        $appointmentId = $this->createAppointment($context, 1);

        $this->requestJson('GET', '/api/garage/me/appointments', null, $context['clientToken']);
        $this->assertResponseStatus(403);

        $this->requestJson('GET', '/api/garage/me/appointments', null, $context['managerToken']);
        $this->assertResponseStatus(200);

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/accept', null, $context['managerToken']);
        $this->assertResponseStatus(200);
        self::assertArrayHasKey('intervention', $this->lastJson);
        self::assertGreaterThan(0, (int) ($this->lastJson['intervention']['id'] ?? 0));

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/accept', null, $context['managerToken']);
        $this->assertResponseStatus(409);

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/refuse', ['motifRefus' => 'Trop tard'], $context['managerToken']);
        $this->assertResponseStatus(409);
    }

    /** Cette methode teste le refus d'un rendez-vous en attente sans creation d'intervention. */
    public function testGarageRefusePendingAppointmentDoesNotCreateIntervention(): void
    {
        $context = $this->appointmentContext();
        $appointmentId = $this->createAppointment($context, 2);

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/refuse', ['motifRefus' => 'Indisponible'], $context['managerToken']);
        $this->assertResponseStatus(200);
        self::assertSame('REFUSE', $this->lastJson['statut'] ?? null);
        self::assertNull($this->lastJson['interventionId'] ?? null);
    }

    /** Cette methode construit les donnees communes aux tests de rendez-vous. */
    private function appointmentContext(): array
    {
        $garageData = $this->factory->garageWithManager();
        $clientData = $this->factory->clientWithVehicle();

        return $garageData + $clientData + [
            'managerToken' => $this->jwt->tokenFor((string) $garageData['manager']->getEmail()),
            'clientToken' => $this->jwt->tokenFor((string) $clientData['client']->getEmail()),
        ];
    }

    /** Cette methode cree un rendez-vous valide par l'API et retourne son id. */
    private function createAppointment(array $context, int $offsetHours): int
    {
        $this->requestJson('POST', '/api/client/appointments', $this->appointmentPayload($context, $this->factory->futureSlot($offsetHours)), $context['clientToken']);
        $this->assertResponseStatus(201);

        return (int) $this->lastJson['id'];
    }

    /** Cette methode construit le body de creation de rendez-vous. */
    private function appointmentPayload(array $context, \DateTimeImmutable $slot, array $override = []): array
    {
        return array_merge(['garageId' => $context['garage']->getId(), 'vehicleId' => $context['vehicle']->getId(), 'serviceId' => $context['service']->getId(), 'dateDebut' => $slot->format(DATE_ATOM), 'commentaireClient' => 'Test rendez-vous'], $override);
    }
}