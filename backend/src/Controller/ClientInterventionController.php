<?php

/*
 * Ce fichier declare le controleur ClientInterventionController du backend GarageFlow.
 * Il existe pour exposer au client l'avancement de ses propres reparations.
 * Il communique avec ClientInterventionService et Symfony Security sans exposer les notes internes.
 */

namespace App\Controller;

use App\Entity\Intervention;
use App\Entity\InterventionStatusHistory;
use App\Entity\User;
use App\Security\InterventionNotFoundException;
use App\Service\ClientInterventionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/** Ce controleur expose les routes client de consultation du suivi de reparation. */
#[Route('/api/client/interventions')]
#[IsGranted('ROLE_CLIENT')]
class ClientInterventionController extends AbstractController
{
    public function __construct(private readonly ClientInterventionService $interventionService)
    {
    }

    /** Cette route liste les interventions liees aux rendez-vous du client connecte. */
    #[Route('', name: 'api_client_interventions_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json(['items' => array_map(
            fn (Intervention $intervention): array => $this->serializeIntervention($intervention, false),
            $this->interventionService->listForClient($this->client())
        )]);
    }

    /** Cette route retourne le detail d'une intervention du client connecte. */
    #[Route('/{id}', name: 'api_client_interventions_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try {
            return $this->json($this->serializeIntervention($this->interventionService->getForClient($this->client(), $id), true));
        } catch (InterventionNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette methode recupere l'utilisateur connecte en imposant un role client reel. */
    private function client(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw $this->createAccessDeniedException('Authentification requise.');
        }

        if ($user->getRole()?->getCode() !== 'ROLE_CLIENT') {
            throw new AccessDeniedException('Seul un client peut utiliser ces routes.');
        }

        return $user;
    }

    /** Cette methode prepare l'intervention visible par le client sans notes internes. */
    private function serializeIntervention(Intervention $intervention, bool $withHistory): array
    {
        $appointment = $intervention->getAppointment();
        $garage = $appointment?->getGarage();
        $status = $intervention->getStatutActuel();
        $data = [
            'id' => $intervention->getId(),
            'statutActuel' => ['code' => $status?->getCode(), 'libelle' => $status?->getLibelle()],
            'createdAt' => $intervention->getCreatedAt()?->format(DATE_ATOM),
            'closedAt' => $intervention->getClosedAt()?->format(DATE_ATOM),
            'appointment' => ['id' => $appointment?->getId(), 'dateDebut' => $appointment?->getDateDebut()?->format(DATE_ATOM), 'dateFin' => $appointment?->getDateFin()?->format(DATE_ATOM), 'statut' => $appointment?->getStatut()],
            'garage' => ['id' => $garage?->getId(), 'nom' => $garage?->getNom(), 'adresse' => $garage?->getAdresse(), 'ville' => $garage?->getVille(), 'telephone' => $garage?->getTelephone()],
            'vehicle' => ['id' => $appointment?->getVehicle()?->getId(), 'marque' => $appointment?->getVehicle()?->getMarque(), 'modele' => $appointment?->getVehicle()?->getModele(), 'plaqueImmatriculation' => $appointment?->getVehicle()?->getPlaqueImmatriculation()],
            'service' => ['id' => $appointment?->getService()?->getId(), 'nom' => $appointment?->getService()?->getNom()],
        ];

        if ($withHistory) {
            $data['history'] = array_map(
                fn (InterventionStatusHistory $history): array => $this->serializeVisibleHistory($history),
                $this->interventionService->getVisibleHistory($intervention)
            );
        }

        return $data;
    }

    /** Cette methode prepare une ligne d'historique autorisee pour le client. */
    private function serializeVisibleHistory(InterventionStatusHistory $history): array
    {
        return [
            'id' => $history->getId(),
            'status' => ['code' => $history->getStatus()?->getCode(), 'libelle' => $history->getStatus()?->getLibelle()],
            'commentaire' => $history->getCommentaire(),
            'changedAt' => $history->getChangedAt()?->format(DATE_ATOM),
        ];
    }
}