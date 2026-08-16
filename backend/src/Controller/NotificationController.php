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

#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $unreadOnly = filter_var($request->query->get('unreadOnly', 'false'), FILTER_VALIDATE_BOOLEAN);

        return $this->json(['items' => array_map(
            fn (Notification $notification): array => $this->serializeNotification($notification),
            $this->notificationService->listForUser($this->user(), $unreadOnly)
        )]);
    }

    #[Route('/{id}/read', name: 'api_notifications_read', methods: ['PATCH'])]
    public function read(int $id): JsonResponse
    {
        try {
            return $this->json($this->serializeNotification($this->notificationService->markAsRead($this->user(), $id)));
        } catch (NotificationNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    #[Route('/read-all', name: 'api_notifications_read_all', methods: ['PATCH'])]
    public function readAll(): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead($this->user());

        return $this->json(['message' => 'Notifications marquees comme lues.', 'updatedCount' => $count]);
    }

    private function user(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw $this->createAccessDeniedException('Authentification requise.');
        }

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
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
