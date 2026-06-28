<?php

/*
 * Ce fichier declare le controleur GarageAppointmentController du backend GarageFlow.
 * Il existe pour exposer les routes utilisees par le garage pour gerer les demandes de rendez-vous.
 * Il communique avec les DTO, GarageAppointmentService, GarageManagementService et Symfony Security.
 */

namespace App\Controller;

use App\DTO\GarageAppointmentFilterRequest;
use App\DTO\RefuseAppointmentRequest;
use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\Intervention;
use App\Entity\User;
use App\Security\AppointmentConflictException;
use App\Security\AppointmentNotFoundException;
use App\Security\GarageNotFoundException;
use App\Security\InvalidAppointmentRequestException;
use App\Service\GarageAppointmentService;
use App\Service\GarageManagementService;
use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/** Ce controleur recoit les requetes HTTP des gerants et employes pour traiter les rendez-vous du garage. */
#[Route('/api/garage/me/appointments')]
#[IsGranted('ROLE_EMPLOYE')]
class GarageAppointmentController extends AbstractController
{
    public function __construct(
        private readonly GarageAppointmentService $appointmentService,
        private readonly GarageManagementService $garageManagementService,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /** Cette route liste les rendez-vous du garage rattache a l'utilisateur connecte. */
    #[Route('', name: 'api_garage_me_appointments_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $dto = new GarageAppointmentFilterRequest();
        $dto->statut = $request->query->get('statut');
        $dto->date = $request->query->get('date');

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            $appointments = array_map(
                fn (Appointment $appointment): array => $this->serializeAppointment($appointment),
                $this->appointmentService->listForGarage($this->garage(), $dto)
            );

            return $this->json(['items' => $appointments]);
        } catch (InvalidAppointmentRequestException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (GarageNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route retourne le detail d'un rendez-vous du garage connecte. */
    #[Route('/{id}', name: 'api_garage_me_appointments_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try {
            return $this->json($this->serializeAppointment($this->appointmentService->getForGarage($this->garage(), $id)));
        } catch (GarageNotFoundException|AppointmentNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route confirme un rendez-vous et cree l'intervention si elle n'existe pas deja. */
    #[Route('/{id}/accept', name: 'api_garage_me_appointments_accept', methods: ['PATCH'])]
    public function accept(int $id): JsonResponse
    {
        try {
            $result = $this->appointmentService->accept($this->garage(), $id, $this->user());

            return $this->json([
                'appointment' => $this->serializeAppointment($result['appointment']),
                'intervention' => $this->serializeIntervention($result['intervention']),
            ]);
        } catch (GarageNotFoundException|AppointmentNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (AppointmentConflictException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }
    }

    /** Cette route refuse un rendez-vous en attente sans creer d'intervention. */
    #[Route('/{id}/refuse', name: 'api_garage_me_appointments_refuse', methods: ['PATCH'])]
    public function refuse(int $id, Request $request): JsonResponse
    {
        $payload = $this->optionalPayload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new RefuseAppointmentRequest();
        $dto->motifRefus = array_key_exists('motifRefus', $payload) && $payload['motifRefus'] !== null ? (string) $payload['motifRefus'] : null;

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            return $this->json($this->serializeAppointment($this->appointmentService->refuse($this->garage(), $id, $dto)));
        } catch (GarageNotFoundException|AppointmentNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (AppointmentConflictException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }
    }

    /** Cette methode recupere l'utilisateur connecte sous forme d'entite User. */
    private function user(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw $this->createAccessDeniedException('Authentification requise.');
        }

        return $user;
    }

    /** Cette methode recupere le garage rattache au gerant ou employe connecte. */
    private function garage(): Garage
    {
        return $this->garageManagementService->getGarageForUser($this->user());
    }

    /** Cette methode accepte un body JSON vide pour les actions simples comme refuser sans motif. */
    private function optionalPayload(Request $request): array|JsonResponse
    {
        if (trim($request->getContent()) === '') {
            return [];
        }

        try {
            $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return $this->json(['message' => 'Le JSON envoye est invalide.'], Response::HTTP_BAD_REQUEST);
        }

        return is_array($payload) ? $payload : $this->json(['message' => 'Les donnees envoyees sont invalides.'], Response::HTTP_BAD_REQUEST);
    }

    /** Cette methode transforme les erreurs de validation Symfony en reponse JSON lisible. */
    private function validateDto(object $dto): ?JsonResponse
    {
        $errors = $this->validator->validate($dto);
        if (count($errors) === 0) {
            return null;
        }

        $details = [];
        foreach ($errors as $error) {
            $details[$error->getPropertyPath()][] = $error->getMessage();
        }

        return $this->json(['message' => 'Les donnees envoyees sont invalides.', 'errors' => $details], Response::HTTP_BAD_REQUEST);
    }

    /** Cette methode prepare la reponse JSON d'un rendez-vous garage sans exposer le mot de passe du client. */
    private function serializeAppointment(Appointment $appointment): array
    {
        return [
            'id' => $appointment->getId(),
            'statut' => $appointment->getStatut(),
            'dateDebut' => $appointment->getDateDebut()?->format(DATE_ATOM),
            'dateFin' => $appointment->getDateFin()?->format(DATE_ATOM),
            'commentaireClient' => $appointment->getCommentaireClient(),
            'createdAt' => $appointment->getCreatedAt()?->format(DATE_ATOM),
            'updatedAt' => $appointment->getUpdatedAt()?->format(DATE_ATOM),
            'client' => [
                'id' => $appointment->getClient()?->getId(),
                'nom' => $appointment->getClient()?->getNom(),
                'prenom' => $appointment->getClient()?->getPrenom(),
                'email' => $appointment->getClient()?->getEmail(),
                'telephone' => $appointment->getClient()?->getTelephone(),
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
            'interventionId' => $appointment->getIntervention()?->getId(),
        ];
    }

    /** Cette methode prepare la reponse JSON de l'intervention creee automatiquement. */
    private function serializeIntervention(Intervention $intervention): array
    {
        return [
            'id' => $intervention->getId(),
            'status' => [
                'id' => $intervention->getStatutActuel()?->getId(),
                'code' => $intervention->getStatutActuel()?->getCode(),
                'libelle' => $intervention->getStatutActuel()?->getLibelle(),
            ],
            'createdAt' => $intervention->getCreatedAt()?->format(DATE_ATOM),
            'closedAt' => $intervention->getClosedAt()?->format(DATE_ATOM),
        ];
    }
}