<?php

/*
 * Ce fichier declare le controleur GarageManagementController du backend GarageFlow.
 * Il existe pour exposer les routes de gestion du garage rattache a l'utilisateur connecte.
 * Il communique avec les DTO, les services garage et Symfony Security.
 */

namespace App\Controller;

use App\DTO\CreateOpeningHourRequest;
use App\DTO\CreateServicePrestationRequest;
use App\DTO\CreateUnavailabilityRequest;
use App\DTO\UpdateGarageRequest;
use App\DTO\UpdateOpeningHourRequest;
use App\DTO\UpdateServicePrestationRequest;
use App\DTO\UpdateUnavailabilityRequest;
use App\Entity\Garage;
use App\Entity\OpeningHour;
use App\Entity\ServicePrestation;
use App\Entity\Unavailability;
use App\Entity\User;
use App\Security\GarageNotFoundException;
use App\Security\GarageResourceNotFoundException;
use App\Security\InvalidGarageScheduleException;
use App\Service\GarageManagementService;
use App\Service\OpeningHourService;
use App\Service\ServicePrestationService;
use App\Service\UnavailabilityService;
use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/** Ce controleur recoit les requetes HTTP de gestion garage et appelle les services adaptes. */
#[Route('/api/garage/me')]
class GarageManagementController extends AbstractController
{
    public function __construct(
        private readonly GarageManagementService $garageManagementService,
        private readonly ServicePrestationService $servicePrestationService,
        private readonly OpeningHourService $openingHourService,
        private readonly UnavailabilityService $unavailabilityService,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /** Cette route retourne le garage rattache a l'utilisateur connecte. */
    #[Route('', name: 'api_garage_me_show', methods: ['GET'])]
    #[IsGranted('ROLE_EMPLOYE')]
    public function show(): JsonResponse
    {
        try {
            return $this->json($this->serializeGarage($this->garage()));
        } catch (GarageNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route modifie les informations principales du garage connecte. */
    #[Route('', name: 'api_garage_me_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_GERANT')]
    public function updateGarage(Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new UpdateGarageRequest();
        $this->fillUpdateGarageRequest($dto, $payload);

        $error = $this->validateDto($dto);
        if ($error instanceof JsonResponse) {
            return $error;
        }

        try {
            return $this->json($this->serializeGarage($this->garageManagementService->updateGarage($this->garage(), $dto)));
        } catch (GarageNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route liste les prestations du garage connecte. */
    #[Route('/services', name: 'api_garage_me_services_list', methods: ['GET'])]
    #[IsGranted('ROLE_EMPLOYE')]
    public function listServices(): JsonResponse
    {
        return $this->json(array_map(
            fn (ServicePrestation $service): array => $this->serializeService($service),
            $this->servicePrestationService->listForGarage($this->garage())
        ));
    }

    /** Cette route cree une prestation pour le garage connecte. */
    #[Route('/services', name: 'api_garage_me_services_create', methods: ['POST'])]
    #[IsGranted('ROLE_GERANT')]
    public function createService(Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new CreateServicePrestationRequest();
        $dto->nom = $this->nullableString($payload['nom'] ?? null);
        $dto->description = $this->nullableString($payload['description'] ?? null);
        $dto->dureeMinutes = array_key_exists('dureeMinutes', $payload) ? (int) $payload['dureeMinutes'] : null;
        $dto->actif = array_key_exists('actif', $payload) ? (bool) $payload['actif'] : true;

        $error = $this->validateDto($dto);
        if ($error instanceof JsonResponse) {
            return $error;
        }

        return $this->json($this->serializeService($this->servicePrestationService->create($this->garage(), $dto)), Response::HTTP_CREATED);
    }

    /** Cette route modifie une prestation appartenant au garage connecte. */
    #[Route('/services/{id}', name: 'api_garage_me_services_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_GERANT')]
    public function updateService(int $id, Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new UpdateServicePrestationRequest();
        $this->fillUpdateServiceRequest($dto, $payload);

        $error = $this->validateDto($dto);
        if ($error instanceof JsonResponse) {
            return $error;
        }

        try {
            return $this->json($this->serializeService($this->servicePrestationService->update($this->garage(), $id, $dto)));
        } catch (GarageResourceNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route desactive une prestation sans la supprimer de la base. */
    #[Route('/services/{id}', name: 'api_garage_me_services_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_GERANT')]
    public function deleteService(int $id): JsonResponse
    {
        try {
            $this->servicePrestationService->disable($this->garage(), $id);
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (GarageResourceNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route liste les horaires du garage connecte. */
    #[Route('/opening-hours', name: 'api_garage_me_opening_hours_list', methods: ['GET'])]
    #[IsGranted('ROLE_EMPLOYE')]
    public function listOpeningHours(): JsonResponse
    {
        return $this->json(array_map(
            fn (OpeningHour $hour): array => $this->serializeOpeningHour($hour),
            $this->openingHourService->listForGarage($this->garage())
        ));
    }

    /** Cette route cree une plage horaire recurrente pour le garage connecte. */
    #[Route('/opening-hours', name: 'api_garage_me_opening_hours_create', methods: ['POST'])]
    #[IsGranted('ROLE_GERANT')]
    public function createOpeningHour(Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new CreateOpeningHourRequest();
        $dto->jourSemaine = array_key_exists('jourSemaine', $payload) ? (int) $payload['jourSemaine'] : null;
        $dto->heureDebut = $this->nullableString($payload['heureDebut'] ?? null);
        $dto->heureFin = $this->nullableString($payload['heureFin'] ?? null);
        $dto->actif = array_key_exists('actif', $payload) ? (bool) $payload['actif'] : true;

        $error = $this->validateDto($dto);
        if ($error instanceof JsonResponse) {
            return $error;
        }

        try {
            return $this->json($this->serializeOpeningHour($this->openingHourService->create($this->garage(), $dto)), Response::HTTP_CREATED);
        } catch (InvalidGarageScheduleException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /** Cette route modifie une plage horaire appartenant au garage connecte. */
    #[Route('/opening-hours/{id}', name: 'api_garage_me_opening_hours_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_GERANT')]
    public function updateOpeningHour(int $id, Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new UpdateOpeningHourRequest();
        $this->fillUpdateOpeningHourRequest($dto, $payload);

        $error = $this->validateDto($dto);
        if ($error instanceof JsonResponse) {
            return $error;
        }

        try {
            return $this->json($this->serializeOpeningHour($this->openingHourService->update($this->garage(), $id, $dto)));
        } catch (GarageResourceNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (InvalidGarageScheduleException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /** Cette route desactive un horaire sans le supprimer de la base. */
    #[Route('/opening-hours/{id}', name: 'api_garage_me_opening_hours_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_GERANT')]
    public function deleteOpeningHour(int $id): JsonResponse
    {
        try {
            $this->openingHourService->disable($this->garage(), $id);
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (GarageResourceNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    /** Cette route liste les indisponibilites du garage connecte. */
    #[Route('/unavailabilities', name: 'api_garage_me_unavailabilities_list', methods: ['GET'])]
    #[IsGranted('ROLE_EMPLOYE')]
    public function listUnavailabilities(): JsonResponse
    {
        return $this->json(array_map(
            fn (Unavailability $unavailability): array => $this->serializeUnavailability($unavailability),
            $this->unavailabilityService->listForGarage($this->garage())
        ));
    }

    /** Cette route cree une indisponibilite exceptionnelle pour le garage connecte. */
    #[Route('/unavailabilities', name: 'api_garage_me_unavailabilities_create', methods: ['POST'])]
    #[IsGranted('ROLE_GERANT')]
    public function createUnavailability(Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new CreateUnavailabilityRequest();
        $dto->dateDebut = $this->nullableString($payload['dateDebut'] ?? null);
        $dto->dateFin = $this->nullableString($payload['dateFin'] ?? null);
        $dto->motif = $this->nullableString($payload['motif'] ?? null);

        $error = $this->validateDto($dto);
        if ($error instanceof JsonResponse) {
            return $error;
        }

        try {
            return $this->json($this->serializeUnavailability($this->unavailabilityService->create($this->garage(), $this->user(), $dto)), Response::HTTP_CREATED);
        } catch (InvalidGarageScheduleException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /** Cette route modifie une indisponibilite appartenant au garage connecte. */
    #[Route('/unavailabilities/{id}', name: 'api_garage_me_unavailabilities_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_GERANT')]
    public function updateUnavailability(int $id, Request $request): JsonResponse
    {
        $payload = $this->payload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $dto = new UpdateUnavailabilityRequest();
        $this->fillUpdateUnavailabilityRequest($dto, $payload);

        $error = $this->validateDto($dto);
        if ($error instanceof JsonResponse) {
            return $error;
        }

        try {
            return $this->json($this->serializeUnavailability($this->unavailabilityService->update($this->garage(), $id, $dto)));
        } catch (GarageResourceNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (InvalidGarageScheduleException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    /** Cette route supprime une indisponibilite car elle ne possede pas de champ actif. */
    #[Route('/unavailabilities/{id}', name: 'api_garage_me_unavailabilities_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_GERANT')]
    public function deleteUnavailability(int $id): JsonResponse
    {
        try {
            $this->unavailabilityService->delete($this->garage(), $id);
            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (GarageResourceNotFoundException $exception) {
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

    /** Cette methode transforme le JSON recu en tableau PHP utilisable par les DTO. */
    private function payload(Request $request): array|JsonResponse
    {
        try {
            $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return $this->json(['message' => 'Le JSON envoye est invalide.'], Response::HTTP_BAD_REQUEST);
        }

        return is_array($payload) ? $payload : $this->json(['message' => 'Les donnees envoyees sont invalides.'], Response::HTTP_BAD_REQUEST);
    }

    /** Cette methode remplit le DTO de modification du garage avec les champs reellement envoyes. */
    private function fillUpdateGarageRequest(UpdateGarageRequest $dto, array $payload): void
    {
        foreach (['nom', 'adresse', 'ville', 'codePostal', 'telephone', 'email', 'description', 'logoUrl', 'actif'] as $field) {
            if (!array_key_exists($field, $payload)) {
                continue;
            }

            $dto->markProvided($field);
            $dto->$field = $field === 'actif' ? (bool) $payload[$field] : $this->nullableString($payload[$field]);
        }
    }

    /** Cette methode remplit le DTO de modification d'une prestation avec les bons types. */
    private function fillUpdateServiceRequest(UpdateServicePrestationRequest $dto, array $payload): void
    {
        if (array_key_exists('nom', $payload)) {
            $dto->markProvided('nom');
            $dto->nom = $this->nullableString($payload['nom']);
        }
        if (array_key_exists('description', $payload)) {
            $dto->markProvided('description');
            $dto->description = $this->nullableString($payload['description']);
        }
        if (array_key_exists('dureeMinutes', $payload)) {
            $dto->markProvided('dureeMinutes');
            $dto->dureeMinutes = (int) $payload['dureeMinutes'];
        }
        if (array_key_exists('actif', $payload)) {
            $dto->markProvided('actif');
            $dto->actif = (bool) $payload['actif'];
        }
    }

    /** Cette methode remplit le DTO de modification d'un horaire avec les bons types. */
    private function fillUpdateOpeningHourRequest(UpdateOpeningHourRequest $dto, array $payload): void
    {
        if (array_key_exists('jourSemaine', $payload)) {
            $dto->markProvided('jourSemaine');
            $dto->jourSemaine = (int) $payload['jourSemaine'];
        }
        if (array_key_exists('heureDebut', $payload)) {
            $dto->markProvided('heureDebut');
            $dto->heureDebut = $this->nullableString($payload['heureDebut']);
        }
        if (array_key_exists('heureFin', $payload)) {
            $dto->markProvided('heureFin');
            $dto->heureFin = $this->nullableString($payload['heureFin']);
        }
        if (array_key_exists('actif', $payload)) {
            $dto->markProvided('actif');
            $dto->actif = (bool) $payload['actif'];
        }
    }

    /** Cette methode remplit le DTO de modification d'une indisponibilite. */
    private function fillUpdateUnavailabilityRequest(UpdateUnavailabilityRequest $dto, array $payload): void
    {
        foreach (['dateDebut', 'dateFin', 'motif'] as $field) {
            if (!array_key_exists($field, $payload)) {
                continue;
            }

            $dto->markProvided($field);
            $dto->$field = $this->nullableString($payload[$field]);
        }
    }

    /** Cette methode lance la validation Symfony et retourne une erreur lisible si besoin. */
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

    /** Cette methode convertit une valeur JSON en chaine ou null. */
    private function nullableString(mixed $value): ?string
    {
        return $value === null ? null : (string) $value;
    }

    /** Cette methode prepare la reponse JSON d'un garage. */
    private function serializeGarage(Garage $garage): array
    {
        return [
            'id' => $garage->getId(),
            'nom' => $garage->getNom(),
            'adresse' => $garage->getAdresse(),
            'ville' => $garage->getVille(),
            'codePostal' => $garage->getCodePostal(),
            'telephone' => $garage->getTelephone(),
            'email' => $garage->getEmail(),
            'description' => $garage->getDescription(),
            'logoUrl' => $garage->getLogoUrl(),
            'actif' => $garage->isActif(),
        ];
    }

    /** Cette methode prepare la reponse JSON d'une prestation. */
    private function serializeService(ServicePrestation $service): array
    {
        return [
            'id' => $service->getId(),
            'nom' => $service->getNom(),
            'description' => $service->getDescription(),
            'dureeMinutes' => $service->getDureeMinutes(),
            'actif' => $service->isActif(),
            'createdAt' => $service->getCreatedAt()?->format(DATE_ATOM),
            'updatedAt' => $service->getUpdatedAt()?->format(DATE_ATOM),
        ];
    }

    /** Cette methode prepare la reponse JSON d'un horaire. */
    private function serializeOpeningHour(OpeningHour $hour): array
    {
        return [
            'id' => $hour->getId(),
            'jourSemaine' => $hour->getJourSemaine(),
            'heureDebut' => $hour->getHeureDebut()?->format('H:i'),
            'heureFin' => $hour->getHeureFin()?->format('H:i'),
            'actif' => $hour->isActif(),
        ];
    }

    /** Cette methode prepare la reponse JSON d'une indisponibilite. */
    private function serializeUnavailability(Unavailability $unavailability): array
    {
        return [
            'id' => $unavailability->getId(),
            'dateDebut' => $unavailability->getDateDebut()?->format(DATE_ATOM),
            'dateFin' => $unavailability->getDateFin()?->format(DATE_ATOM),
            'motif' => $unavailability->getMotif(),
            'createdAt' => $unavailability->getCreatedAt()?->format(DATE_ATOM),
        ];
    }
}
