<?php

/*
 * Ce fichier declare le controleur ClientAppointmentController du backend GarageFlow.
 * Il existe pour exposer les routes utilisees par l'application mobile client pour prendre rendez-vous.
 * Il communique avec CreateAppointmentRequest, AppointmentService, Symfony Security et Symfony Validator.
 */

namespace App\Controller;

use App\DTO\CreateAppointmentRequest;
use App\Entity\Appointment;
use App\Entity\User;
use App\Security\AppointmentConflictException;
use App\Security\AppointmentNotFoundException;
use App\Security\GarageNotFoundException;
use App\Security\GarageResourceNotFoundException;
use App\Security\InvalidAppointmentRequestException;
use App\Security\VehicleNotFoundException;
use App\Service\AppointmentService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/client/appointments')]
#[IsGranted('ROLE_CLIENT')]
class ClientAppointmentController extends AbstractController
{
    public function __construct(
        private readonly AppointmentService $appointmentService,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'api_client_appointments_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $appointments = array_map(
            fn (Appointment $appointment): array => $this->serializeAppointment($appointment),
            $this->appointmentService->getAppointmentsForClient($this->getClientUser())
        );

        return $this->json(['items' => $appointments]);
    }

    #[Route('', name: 'api_client_appointments_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $payload = $this->decodeJsonPayload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new CreateAppointmentRequest();
        $dto->garageId = array_key_exists('garageId', $payload) ? (int) $payload['garageId'] : null;
        $dto->vehicleId = array_key_exists('vehicleId', $payload) ? (int) $payload['vehicleId'] : null;
        $dto->serviceId = array_key_exists('serviceId', $payload) ? (int) $payload['serviceId'] : null;
        $dto->dateDebut = array_key_exists('dateDebut', $payload) && null !== $payload['dateDebut'] ? (string) $payload['dateDebut'] : null;
        $dto->commentaireClient = array_key_exists('commentaireClient', $payload) && null !== $payload['commentaireClient'] ? (string) $payload['commentaireClient'] : null;

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            return $this->json($this->serializeAppointment($this->appointmentService->createAppointment($this->getClientUser(), $dto)), Response::HTTP_CREATED);
        } catch (InvalidAppointmentRequestException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (GarageNotFoundException|GarageResourceNotFoundException|VehicleNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (AppointmentConflictException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }
    }

    #[Route('/{id}', name: 'api_client_appointments_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try {
            return $this->json($this->serializeAppointment($this->appointmentService->getAppointmentForClient($this->getClientUser(), $id)));
        } catch (AppointmentNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    #[Route('/{id}/cancel', name: 'api_client_appointments_cancel', methods: ['PATCH'])]
    public function cancel(int $id): JsonResponse
    {
        try {
            return $this->json($this->serializeAppointment($this->appointmentService->cancelAppointment($this->getClientUser(), $id)));
        } catch (AppointmentNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (AppointmentConflictException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }
    }

    private function getClientUser(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw $this->createAccessDeniedException('Authentification requise.');
        }

        if ('ROLE_CLIENT' !== $user->getRole()?->getCode()) {
            throw new AccessDeniedException('Seul un client peut utiliser ces routes.');
        }

        return $user;
    }

    /**
     * @return array<string, mixed>|JsonResponse
     */
    private function decodeJsonPayload(Request $request): array|JsonResponse
    {
        try {
            $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return $this->json(['message' => 'Le JSON envoye est invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if (!is_array($payload)) {
            return $this->json(['message' => 'Les donnees envoyees sont invalides.'], Response::HTTP_BAD_REQUEST);
        }

        return $payload;
    }

    private function validateDto(object $dto): ?JsonResponse
    {
        $errors = $this->validator->validate($dto);
        if (0 === count($errors)) {
            return null;
        }

        $details = [];
        foreach ($errors as $error) {
            $details[$error->getPropertyPath()][] = $error->getMessage();
        }

        return $this->json(['message' => 'Les donnees envoyees sont invalides.', 'errors' => $details], Response::HTTP_BAD_REQUEST);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeAppointment(Appointment $appointment): array
    {
        return [
            'id' => $appointment->getId(),
            'garage' => [
                'id' => $appointment->getGarage()?->getId(),
                'nom' => $appointment->getGarage()?->getNom(),
            ],
            'vehicle' => [
                'id' => $appointment->getVehicle()?->getId(),
                'marque' => $appointment->getVehicle()?->getMarque(),
                'modele' => $appointment->getVehicle()?->getModele(),
                'plaqueImmatriculation' => $appointment->getVehicle()?->getPlaqueImmatriculation(),
            ],
            'service' => [
                'id' => $appointment->getService()?->getId(),
                'nom' => $appointment->getService()?->getNom(),
                'dureeMinutes' => $appointment->getService()?->getDureeMinutes(),
            ],
            'dateDebut' => $appointment->getDateDebut()?->format(DATE_ATOM),
            'dateFin' => $appointment->getDateFin()?->format(DATE_ATOM),
            'statut' => $appointment->getStatut(),
            'commentaireClient' => $appointment->getCommentaireClient(),
            'createdAt' => $appointment->getCreatedAt()?->format(DATE_ATOM),
            'updatedAt' => $appointment->getUpdatedAt()?->format(DATE_ATOM),
        ];
    }
}
