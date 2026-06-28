<?php

/*
 * Ce fichier declare le controleur NotificationController du backend GarageFlow.
 * Il existe pour permettre a l'utilisateur connecte de consulter et lire ses notifications in-app.
 * Il communique avec NotificationService, NotificationRepository et Symfony Security.
 */

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\User;
use App\Security\NotificationNotFoundException;
use App\Service\NotificationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/** Ce controleur expose les notifications du seul utilisateur connecte. */
#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    /** Cette route liste les notifications de l'utilisateur connecte, avec un filtre non lues optionnel. */
    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $unreadOnly = filter_var($request->query->get('unreadOnly', 'false'), FILTER_VALIDATE_BOOLEAN);

        return $this->json(['items' => array_map(
            fn (Notification $notification): array => $this->serializeNotification($notification),
            $this->notificationService->listForUser($this->user(), $unreadOnly)
        )]);
    }

    /** Cette route marque une notification de l'utilisateur connecte comme lue. */
    #[Route('/{id}/read', name: 'api_notifications_read', methods: ['PATCH'])]
    public function read(int $id): JsonResponse
    {
        try {
            return $this->json($this->serializeNotification($this->notificationService->markAsRead($this->user(), $id)));
        } catch (NotificationNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route marque toutes les notifications de l'utilisateur connecte comme lues. */
    #[Route('/read-all', name: 'api_notifications_read_all', methods: ['PATCH'])]
    public function readAll(): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead($this->user());

        return $this->json(['message' => 'Notifications marquees comme lues.', 'updatedCount' => $count]);
    }

    /** Cette methode recupere l'utilisateur connecte sans exposer son mot de passe. */
    private function user(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw $this->createAccessDeniedException('Authentification requise.');
        }

        return $user;
    }

    /** Cette methode transforme une notification en tableau JSON public. */
    private function serializeNotification(Notification $notification): array
    {
        return [
            'id' => $notification->getId(),
            'type' => $notification->getType(),
            'canal' => $notification->getCanal(),
            'contenu' => $notification->getContenu(),
            'lu' => $notification->isLu(),
            'createdAt' => $notification->getCreatedAt()?->format(DATE_ATOM),
            'readAt' => $notification->getReadAt()?->format(DATE_ATOM),
            'appointmentId' => $notification->getAppointment()?->getId(),
            'interventionId' => $notification->getIntervention()?->getId(),
        ];
    }
}