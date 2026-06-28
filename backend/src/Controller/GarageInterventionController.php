<?php

/*
 * Ce fichier declare le controleur GarageInterventionController du backend GarageFlow.
 * Il existe pour exposer les routes utilisees par le garage pour suivre les interventions et notes internes.
 * Il communique avec les DTO, les services intervention, les notes internes et Symfony Security.
 */

namespace App\Controller;

use App\DTO\CreateInternalNoteRequest;
use App\DTO\InterventionFilterRequest;
use App\DTO\UpdateInternalNoteRequest;
use App\DTO\UpdateInterventionStatusRequest;
use App\Entity\Garage;
use App\Entity\InternalNote;
use App\Entity\Intervention;
use App\Entity\InterventionStatusHistory;
use App\Entity\User;
use App\Security\GarageNotFoundException;
use App\Security\InternalNoteNotFoundException;
use App\Security\InterventionNotFoundException;
use App\Security\InterventionStatusNotFoundException;
use App\Security\InvalidAppointmentRequestException;
use App\Service\GarageInterventionService;
use App\Service\GarageManagementService;
use App\Service\InternalNoteService;
use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/** Ce controleur expose les routes de suivi atelier reservees au garage. */
#[Route('/api/garage/me/interventions')]
#[IsGranted('ROLE_EMPLOYE')]
class GarageInterventionController extends AbstractController
{
    public function __construct(
        private readonly GarageInterventionService $interventionService,
        private readonly InternalNoteService $noteService,
        private readonly GarageManagementService $garageManagementService,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /** Cette route liste les interventions du garage connecte. */
    #[Route('', name: 'api_garage_me_interventions_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $dto = new InterventionFilterRequest();
        $dto->statusCode = $request->query->get('statusCode');
        $dto->date = $request->query->get('date');

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            return $this->json(['items' => array_map(
                fn (Intervention $intervention): array => $this->serializeInterventionSummary($intervention),
                $this->interventionService->listForGarage($this->garage(), $dto)
            )]);
        } catch (InvalidAppointmentRequestException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (GarageNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route retourne le detail complet d'une intervention du garage connecte. */
    #[Route('/{id}', name: 'api_garage_me_interventions_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try {
            $intervention = $this->interventionService->getForGarage($this->garage(), $id);

            return $this->json($this->serializeInterventionDetail($intervention));
        } catch (GarageNotFoundException|InterventionNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route change le statut d'une intervention et ajoute une ligne d'historique. */
    #[Route('/{id}/status', name: 'api_garage_me_interventions_update_status', methods: ['PATCH'])]
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new UpdateInterventionStatusRequest();
        $dto->statusCode = array_key_exists('statusCode', $payload) && $payload['statusCode'] !== null ? (string) $payload['statusCode'] : null;
        $dto->commentaire = array_key_exists('commentaire', $payload) && $payload['commentaire'] !== null ? (string) $payload['commentaire'] : null;

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            $intervention = $this->interventionService->updateStatus($this->garage(), $id, $this->user(), $dto);

            return $this->json($this->serializeInterventionDetail($intervention));
        } catch (GarageNotFoundException|InterventionNotFoundException|InterventionStatusNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route liste les notes internes d'une intervention du garage. */
    #[Route('/{id}/notes', name: 'api_garage_me_interventions_notes_list', methods: ['GET'])]
    public function listNotes(int $id): JsonResponse
    {
        try {
            return $this->json(['items' => array_map(
                fn (InternalNote $note): array => $this->serializeNote($note),
                $this->noteService->listForIntervention($this->garage(), $id)
            )]);
        } catch (GarageNotFoundException|InterventionNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route ajoute une note interne a une intervention du garage. */
    #[Route('/{id}/notes', name: 'api_garage_me_interventions_notes_create', methods: ['POST'])]
    public function createNote(int $id, Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new CreateInternalNoteRequest();
        $dto->contenu = array_key_exists('contenu', $payload) && $payload['contenu'] !== null ? (string) $payload['contenu'] : null;

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            return $this->json($this->serializeNote($this->noteService->create($this->garage(), $id, $this->user(), $dto)), Response::HTTP_CREATED);
        } catch (GarageNotFoundException|InterventionNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route modifie une note interne appartenant a l'intervention du garage. */
    #[Route('/{id}/notes/{noteId}', name: 'api_garage_me_interventions_notes_update', methods: ['PATCH'])]
    public function updateNote(int $id, int $noteId, Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new UpdateInternalNoteRequest();
        $dto->contenu = array_key_exists('contenu', $payload) && $payload['contenu'] !== null ? (string) $payload['contenu'] : null;

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            return $this->json($this->serializeNote($this->noteService->update($this->garage(), $id, $noteId, $dto)));
        } catch (GarageNotFoundException|InterventionNotFoundException|InternalNoteNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route supprime une note interne appartenant a l'intervention du garage. */
    #[Route('/{id}/notes/{noteId}', name: 'api_garage_me_interventions_notes_delete', methods: ['DELETE'])]
    public function deleteNote(int $id, int $noteId): JsonResponse
    {
        try {
            $this->noteService->delete($this->garage(), $id, $noteId);

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (GarageNotFoundException|InterventionNotFoundException|InternalNoteNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
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

    /** Cette methode recupere le garage rattache a l'utilisateur connecte. */
    private function garage(): Garage
    {
        return $this->garageManagementService->getGarageForUser($this->user());
    }

    /** Cette methode decode le JSON envoye par le garage. */
    private function payload(Request $request): array|JsonResponse
    {
        try {
            $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return $this->json(['message' => 'Le JSON envoye est invalide.'], Response::HTTP_BAD_REQUEST);
        }

        return is_array($payload) ? $payload : $this->json(['message' => 'Les donnees envoyees sont invalides.'], Response::HTTP_BAD_REQUEST);
    }

    /** Cette methode transforme les erreurs de validation en reponse JSON. */
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

    /** Cette methode prepare le resume d'une intervention pour les listes garage. */
    private function serializeInterventionSummary(Intervention $intervention): array
    {
        $appointment = $intervention->getAppointment();

        return [
            'id' => $intervention->getId(),
            'createdAt' => $intervention->getCreatedAt()?->format(DATE_ATOM),
            'closedAt' => $intervention->getClosedAt()?->format(DATE_ATOM),
            'notesResume' => $intervention->getNotesResume(),
            'statutActuel' => $this->serializeStatus($intervention),
            'appointment' => ['id' => $appointment?->getId(), 'dateDebut' => $appointment?->getDateDebut()?->format(DATE_ATOM), 'dateFin' => $appointment?->getDateFin()?->format(DATE_ATOM), 'statut' => $appointment?->getStatut()],
            'client' => ['id' => $appointment?->getClient()?->getId(), 'nom' => $appointment?->getClient()?->getNom(), 'prenom' => $appointment?->getClient()?->getPrenom(), 'email' => $appointment?->getClient()?->getEmail(), 'telephone' => $appointment?->getClient()?->getTelephone()],
            'vehicle' => ['id' => $appointment?->getVehicle()?->getId(), 'marque' => $appointment?->getVehicle()?->getMarque(), 'modele' => $appointment?->getVehicle()?->getModele(), 'plaqueImmatriculation' => $appointment?->getVehicle()?->getPlaqueImmatriculation()],
            'service' => ['id' => $appointment?->getService()?->getId(), 'nom' => $appointment?->getService()?->getNom(), 'dureeMinutes' => $appointment?->getService()?->getDureeMinutes()],
        ];
    }

    /** Cette methode prepare le detail d'une intervention avec historique et notes internes. */
    private function serializeInterventionDetail(Intervention $intervention): array
    {
        return $this->serializeInterventionSummary($intervention) + [
            'history' => array_map(fn (InterventionStatusHistory $history): array => $this->serializeHistory($history), $this->interventionService->getHistory($intervention)),
            'internalNotes' => array_map(fn (InternalNote $note): array => $this->serializeNote($note), $this->noteService->listForIntervention($this->garage(), (int) $intervention->getId())),
        ];
    }

    /** Cette methode prepare un statut d'intervention pour la reponse JSON. */
    private function serializeStatus(Intervention $intervention): array
    {
        $status = $intervention->getStatutActuel();

        return ['code' => $status?->getCode(), 'libelle' => $status?->getLibelle(), 'ordreAffichage' => $status?->getOrdreAffichage(), 'visibleClient' => $status?->isVisibleClient()];
    }

    /** Cette methode prepare une ligne d'historique pour le garage. */
    private function serializeHistory(InterventionStatusHistory $history): array
    {
        return [
            'id' => $history->getId(),
            'status' => ['code' => $history->getStatus()?->getCode(), 'libelle' => $history->getStatus()?->getLibelle(), 'ordreAffichage' => $history->getStatus()?->getOrdreAffichage(), 'visibleClient' => $history->getStatus()?->isVisibleClient()],
            'changedBy' => ['id' => $history->getChangedBy()?->getId(), 'nom' => $history->getChangedBy()?->getNom(), 'prenom' => $history->getChangedBy()?->getPrenom()],
            'commentaire' => $history->getCommentaire(),
            'changedAt' => $history->getChangedAt()?->format(DATE_ATOM),
        ];
    }

    /** Cette methode prepare une note interne uniquement pour les reponses garage. */
    private function serializeNote(InternalNote $note): array
    {
        return [
            'id' => $note->getId(),
            'contenu' => $note->getContenu(),
            'author' => ['id' => $note->getAuthor()?->getId(), 'nom' => $note->getAuthor()?->getNom(), 'prenom' => $note->getAuthor()?->getPrenom()],
            'createdAt' => $note->getCreatedAt()?->format(DATE_ATOM),
            'updatedAt' => $note->getUpdatedAt()?->format(DATE_ATOM),
        ];
    }
}