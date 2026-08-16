<?php

/*
 * Ce fichier declare le controleur VehicleController du backend GarageFlow.
 * Il existe pour exposer les routes permettant au client connecte de gerer ses vehicules.
 * Il communique avec VehicleService, les DTO, Symfony Security et le validator Symfony.
 */

namespace App\Controller;

use App\DTO\CreateVehicleRequest;
use App\DTO\UpdateVehicleRequest;
use App\Entity\User;
use App\Entity\Vehicle;
use App\Security\DuplicateVehiclePlateException;
use App\Security\VehicleNotFoundException;
use App\Service\VehicleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/client/vehicles')]
#[IsGranted('ROLE_CLIENT')]
class VehicleController extends AbstractController
{
    public function __construct(
        private readonly VehicleService $vehicleService,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'api_client_vehicles_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $client = $this->getClientUser();
        $vehicles = array_map(fn (Vehicle $vehicle): array => $this->serializeVehicle($vehicle), $this->vehicleService->getVehiclesForClient($client));

        return $this->json(['items' => $vehicles]);
    }

    #[Route('', name: 'api_client_vehicles_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $payload = $this->decodeJsonPayload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new CreateVehicleRequest();
        $dto->marque = isset($payload['marque']) ? (string) $payload['marque'] : null;
        $dto->modele = isset($payload['modele']) ? (string) $payload['modele'] : null;
        $dto->plaqueImmatriculation = isset($payload['plaqueImmatriculation']) ? (string) $payload['plaqueImmatriculation'] : null;
        $dto->kilometrage = array_key_exists('kilometrage', $payload) && null !== $payload['kilometrage'] ? (int) $payload['kilometrage'] : null;
        $dto->annee = array_key_exists('annee', $payload) && null !== $payload['annee'] ? (int) $payload['annee'] : null;
        $dto->carburant = array_key_exists('carburant', $payload) && null !== $payload['carburant'] ? (string) $payload['carburant'] : null;

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            $vehicle = $this->vehicleService->createVehicle($this->getClientUser(), $dto);
        } catch (DuplicateVehiclePlateException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }

        return $this->json($this->serializeVehicle($vehicle), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_client_vehicles_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try {
            return $this->json($this->serializeVehicle($this->vehicleService->getVehicleForClient($this->getClientUser(), $id)));
        } catch (VehicleNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    #[Route('/{id}', name: 'api_client_vehicles_update', methods: ['PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $payload = $this->decodeJsonPayload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new UpdateVehicleRequest();
        foreach (['marque', 'modele', 'plaqueImmatriculation', 'kilometrage', 'annee', 'carburant'] as $field) {
            if (array_key_exists($field, $payload)) {
                $dto->markProvided($field);
            }
        }

        $dto->marque = array_key_exists('marque', $payload) && null !== $payload['marque'] ? (string) $payload['marque'] : null;
        $dto->modele = array_key_exists('modele', $payload) && null !== $payload['modele'] ? (string) $payload['modele'] : null;
        $dto->plaqueImmatriculation = array_key_exists('plaqueImmatriculation', $payload) && null !== $payload['plaqueImmatriculation'] ? (string) $payload['plaqueImmatriculation'] : null;
        $dto->kilometrage = array_key_exists('kilometrage', $payload) && null !== $payload['kilometrage'] ? (int) $payload['kilometrage'] : null;
        $dto->annee = array_key_exists('annee', $payload) && null !== $payload['annee'] ? (int) $payload['annee'] : null;
        $dto->carburant = array_key_exists('carburant', $payload) && null !== $payload['carburant'] ? (string) $payload['carburant'] : null;

        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            $vehicle = $this->vehicleService->updateVehicle($this->getClientUser(), $id, $dto);
        } catch (DuplicateVehiclePlateException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        } catch (VehicleNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serializeVehicle($vehicle));
    }

    #[Route('/{id}', name: 'api_client_vehicles_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {
            $this->vehicleService->deleteVehicle($this->getClientUser(), $id);
        } catch (VehicleNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    private function getClientUser(): User
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
    private function serializeVehicle(Vehicle $vehicle): array
    {
        return [
            'id' => $vehicle->getId(),
            'marque' => $vehicle->getMarque(),
            'modele' => $vehicle->getModele(),
            'plaqueImmatriculation' => $vehicle->getPlaqueImmatriculation(),
            'kilometrage' => $vehicle->getKilometrage(),
            'annee' => $vehicle->getAnnee(),
            'carburant' => $vehicle->getCarburant(),
            'createdAt' => $vehicle->getCreatedAt()?->format(DATE_ATOM),
            'updatedAt' => $vehicle->getUpdatedAt()?->format(DATE_ATOM),
        ];
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
}
