<?php

/*
 * Ce fichier declare le controleur AvailabilityController du backend GarageFlow.
 * Il existe pour exposer la route publique qui calcule les creneaux disponibles d'un garage.
 * Il communique avec AvailableSlotsRequest, AvailabilityService et Symfony Validator.
 */

namespace App\Controller;

use App\DTO\AvailableSlotsRequest;
use App\Security\GarageNotFoundException;
use App\Security\GarageResourceNotFoundException;
use App\Security\InvalidAppointmentRequestException;
use App\Service\AvailabilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/** Ce controleur recoit les demandes de consultation des creneaux disponibles. */
class AvailabilityController extends AbstractController
{
    public function __construct(
        private readonly AvailabilityService $availabilityService,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /** Cette route retourne les creneaux disponibles pour une prestation d'un garage actif. */
    #[Route('/api/garages/{garageId}/available-slots', name: 'api_garages_available_slots', methods: ['GET'])]
    public function availableSlots(int $garageId, Request $request): JsonResponse
    {
        $dto = new AvailableSlotsRequest();
        $dto->serviceId = $request->query->has('serviceId') ? (int) $request->query->get('serviceId') : null;
        $dto->date = $request->query->get('date');

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            return $this->json($this->availabilityService->getAvailableSlots($garageId, (int) $dto->serviceId, (string) $dto->date));
        } catch (InvalidAppointmentRequestException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (GarageNotFoundException|GarageResourceNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette methode convertit les erreurs de validation en reponse JSON claire pour le client API. */
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
}