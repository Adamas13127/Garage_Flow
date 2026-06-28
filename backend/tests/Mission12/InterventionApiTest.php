<?php

/*
 * Ce fichier teste les routes d'intervention et de notes internes du backend GarageFlow.
 * Il existe pour verifier le suivi atelier, l'historique et la confidentialite des notes internes.
 * Il communique avec GarageInterventionController et ClientInterventionController.
 */

namespace App\Tests\Mission12;

use App\Tests\Shared\BaseApiTestCase;

/** Cette classe couvre les statuts d'intervention et les notes internes garage. */
class InterventionApiTest extends BaseApiTestCase
{
    /** Cette methode teste les droits, la liste garage et un changement de statut valide. */
    public function testGarageInterventionStatusChangeCreatesHistory(): void
    {
        $context = $this->acceptedAppointmentContext();

        $this->requestJson('GET', '/api/garage/me/interventions', null, $context['clientToken']);
        $this->assertResponseStatus(403);

        $this->requestJson('GET', '/api/garage/me/interventions', null, $context['managerToken']);
        $this->assertResponseStatus(200);

        $this->requestJson('PATCH', '/api/garage/me/interventions/'.$context['interventionId'].'/status', ['statusCode' => 'DIAGNOSTIC_EN_COURS', 'commentaire' => 'Diagnostic'], $context['managerToken']);
        $this->assertResponseStatus(200);
        self::assertCount(2, $this->lastJson['history'] ?? []);
    }

    /** Cette methode verifie le comportement sur statut inexistant. */
    public function testUnknownInterventionStatusReturnsNotFound(): void
    {
        $context = $this->acceptedAppointmentContext();

        $this->requestJson('PATCH', '/api/garage/me/interventions/'.$context['interventionId'].'/status', ['statusCode' => 'STATUT_INCONNU'], $context['managerToken']);
        $this->assertResponseStatus(404);
    }

    /** Cette methode verifie que VEHICULE_RECUPERE ferme l'intervention et termine le rendez-vous. */
    public function testVehicleRecoveredClosesInterventionAndTerminatesAppointment(): void
    {
        $context = $this->acceptedAppointmentContext();

        $this->requestJson('PATCH', '/api/garage/me/interventions/'.$context['interventionId'].'/status', ['statusCode' => 'VEHICULE_RECUPERE', 'commentaire' => 'Recupere'], $context['managerToken']);
        $this->assertResponseStatus(200);
        self::assertNotNull($this->lastJson['closedAt'] ?? null);
        self::assertSame('TERMINE', $this->lastJson['appointment']['statut'] ?? null);
    }

    /** Cette methode teste la creation d'une note interne et son absence cote client. */
    public function testInternalNoteIsCreatedByGarageAndHiddenFromClient(): void
    {
        $context = $this->acceptedAppointmentContext();

        $this->requestJson('POST', '/api/garage/me/interventions/'.$context['interventionId'].'/notes', ['contenu' => 'Note interne confidentielle'], $context['managerToken']);
        $this->assertResponseStatus(201);

        $this->requestJson('GET', '/api/client/interventions/'.$context['interventionId'], null, $context['clientToken']);
        $this->assertResponseStatus(200);
        self::assertStringNotContainsString('Note interne confidentielle', (string) $this->client->getResponse()->getContent());
        self::assertArrayNotHasKey('internalNotes', $this->lastJson ?? []);
    }

    /** Cette methode cree un rendez-vous accepte et retourne les ids utiles. */
    private function acceptedAppointmentContext(): array
    {
        $garageData = $this->factory->garageWithManager();
        $clientData = $this->factory->clientWithVehicle();
        $managerToken = $this->jwt->tokenFor((string) $garageData['manager']->getEmail());
        $clientToken = $this->jwt->tokenFor((string) $clientData['client']->getEmail());
        $slot = $this->factory->futureSlot();

        $this->requestJson('POST', '/api/client/appointments', ['garageId' => $garageData['garage']->getId(), 'vehicleId' => $clientData['vehicle']->getId(), 'serviceId' => $garageData['service']->getId(), 'dateDebut' => $slot->format(DATE_ATOM)], $clientToken);
        $this->assertResponseStatus(201);
        $appointmentId = (int) $this->lastJson['id'];

        $this->requestJson('PATCH', '/api/garage/me/appointments/'.$appointmentId.'/accept', null, $managerToken);
        $this->assertResponseStatus(200);

        return $garageData + $clientData + ['managerToken' => $managerToken, 'clientToken' => $clientToken, 'appointmentId' => $appointmentId, 'interventionId' => (int) $this->lastJson['intervention']['id']];
    }
}