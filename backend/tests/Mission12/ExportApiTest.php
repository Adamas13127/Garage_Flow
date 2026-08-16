<?php

/*
 * Ce fichier teste l'export CSV/JSON des rendez-vous et interventions du backend GarageFlow.
 * Il existe pour verifier le filtrage par periode, le filtrage par garage et les deux formats.
 * Il communique avec GarageExportController et GarageExportService.
 */

namespace App\Tests\Mission12;

use App\Tests\Shared\BaseApiTestCase;

class ExportApiTest extends BaseApiTestCase
{
    public function testExportAppointmentsAsJsonWithinPeriod(): void
    {
        $context = $this->appointmentContext();
        $slot = $this->factory->futureSlot();
        $this->createAppointment($context, $slot);

        $from = $slot->modify('-1 day')->format('Y-m-d');
        $to = $slot->modify('+1 day')->format('Y-m-d');

        $this->requestJson('GET', '/api/garage/me/export/appointments?from='.$from.'&to='.$to, null, $context['managerToken']);
        $this->assertResponseStatus(200);
        self::assertCount(1, $this->lastJson['items']);
        self::assertSame('Test rendez-vous export', $this->lastJson['items'][0]['commentaireClient']);
    }

    public function testExportAppointmentsExcludesOutsidePeriod(): void
    {
        $context = $this->appointmentContext();
        $slot = $this->factory->futureSlot();
        $this->createAppointment($context, $slot);

        $from = $slot->modify('+10 days')->format('Y-m-d');
        $to = $slot->modify('+20 days')->format('Y-m-d');

        $this->requestJson('GET', '/api/garage/me/export/appointments?from='.$from.'&to='.$to, null, $context['managerToken']);
        $this->assertResponseStatus(200);
        self::assertSame([], $this->lastJson['items']);
    }

    public function testExportAppointmentsAsCsv(): void
    {
        $context = $this->appointmentContext();
        $slot = $this->factory->futureSlot();
        $this->createAppointment($context, $slot);

        $from = $slot->modify('-1 day')->format('Y-m-d');
        $to = $slot->modify('+1 day')->format('Y-m-d');

        $this->client->request('GET', '/api/garage/me/export/appointments?from='.$from.'&to='.$to.'&format=csv', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$context['managerToken'],
        ]);
        $this->assertResponseStatus(200);
        self::assertStringContainsString('text/csv', (string) $this->client->getResponse()->headers->get('Content-Type'));
        self::assertStringContainsString('attachment', (string) $this->client->getResponse()->headers->get('Content-Disposition'));
        $body = (string) $this->client->getResponse()->getContent();
        self::assertStringContainsString('commentaireClient', $body);
        self::assertStringContainsString('Test rendez-vous export', $body);
    }

    public function testExportInterventionsReturnsAcceptedAppointment(): void
    {
        $context = $this->appointmentContext();
        $slot = $this->factory->futureSlot();
        $appointmentId = $this->createAppointment($context, $slot);

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/accept', null, $context['managerToken']);
        $this->assertResponseStatus(200);

        $from = $slot->modify('-1 day')->format('Y-m-d');
        $to = $slot->modify('+1 day')->format('Y-m-d');

        $this->requestJson('GET', '/api/garage/me/export/interventions?from='.$from.'&to='.$to, null, $context['managerToken']);
        $this->assertResponseStatus(200);
        self::assertCount(1, $this->lastJson['items']);
        self::assertSame('VEHICULE_DEPOSE', $this->lastJson['items'][0]['statutCode'] ?? null);
    }

    public function testExportRequiresGarageRole(): void
    {
        $context = $this->appointmentContext();

        $this->requestJson('GET', '/api/garage/me/export/appointments?from=2030-01-01&to=2030-01-31', null, $context['clientToken']);
        $this->assertResponseStatus(403);
    }

    public function testExportRejectsMissingPeriod(): void
    {
        $context = $this->appointmentContext();

        $this->requestJson('GET', '/api/garage/me/export/appointments', null, $context['managerToken']);
        $this->assertResponseStatus(400);
    }

    public function testExportRejectsInvertedPeriod(): void
    {
        $context = $this->appointmentContext();

        $this->requestJson('GET', '/api/garage/me/export/appointments?from=2030-02-01&to=2030-01-01', null, $context['managerToken']);
        $this->assertResponseStatus(400);
    }

    public function testExportRejectsInvalidFormat(): void
    {
        $context = $this->appointmentContext();

        $this->requestJson('GET', '/api/garage/me/export/appointments?from=2030-01-01&to=2030-01-31&format=xml', null, $context['managerToken']);
        $this->assertResponseStatus(400);
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
    private function createAppointment(array $context, \DateTimeImmutable $slot): int
    {
        $this->requestJson('POST', '/api/client/appointments', [
            'garageId' => $context['garage']->getId(),
            'vehicleId' => $context['vehicle']->getId(),
            'serviceId' => $context['service']->getId(),
            'dateDebut' => $slot->format(DATE_ATOM),
            'commentaireClient' => 'Test rendez-vous export',
        ], $context['clientToken']);
        $this->assertResponseStatus(201);

        return (int) $this->lastJson['id'];
    }
}
