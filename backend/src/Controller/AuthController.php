<?php

/*
 * Ce fichier declare le controleur AuthController du backend GarageFlow.
 * Il existe pour exposer les routes API d'inscription client et de lecture de l'utilisateur connecte.
 * Il communique avec AuthService, Symfony Security et le validator Symfony.
 */

namespace App\Controller;

use App\DTO\RegisterClientRequest;
use App\Entity\User;
use App\Security\DuplicateEmailException;
use App\Service\AuthService;
use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Ce controleur regroupe les routes d'authentification strictement necessaires au MVP.
 */
#[Route('/api')]
class AuthController extends AbstractController
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /**
     * Cette route permet a un client de creer son compte avant de prendre rendez-vous.
     */
    #[Route('/auth/register/client', name: 'api_auth_register_client', methods: ['POST'])]
    public function registerClient(Request $request): JsonResponse
    {
        try {
            $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return $this->json(['message' => 'Le JSON envoye est invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if (!is_array($payload)) {
            return $this->json(['message' => 'Les donnees envoyees sont invalides.'], Response::HTTP_BAD_REQUEST);
        }

        $dto = new RegisterClientRequest();
        $dto->nom = isset($payload['nom']) ? (string) $payload['nom'] : null;
        $dto->prenom = isset($payload['prenom']) ? (string) $payload['prenom'] : null;
        $dto->email = isset($payload['email']) ? (string) $payload['email'] : null;
        $dto->password = isset($payload['password']) ? (string) $payload['password'] : null;
        $dto->telephone = isset($payload['telephone']) && $payload['telephone'] !== null ? (string) $payload['telephone'] : null;

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            $details = [];
            foreach ($errors as $error) {
                $details[$error->getPropertyPath()][] = $error->getMessage();
            }

            return $this->json(['message' => 'Les donnees envoyees sont invalides.', 'errors' => $details], Response::HTTP_BAD_REQUEST);
        }

        try {
            $user = $this->authService->registerClient($dto);
        } catch (DuplicateEmailException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }

        return $this->json([
            'message' => 'Compte client cree avec succes.',
            'id' => $user->getId(),
            'email' => $user->getEmail(),
        ], Response::HTTP_CREATED);
    }

    /**
     * Cette route sert de point d'entree au firewall Lexik pour verifier les identifiants et creer le JWT.
     */
    #[Route('/auth/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        return $this->json(['message' => 'Identifiants invalides.'], Response::HTTP_UNAUTHORIZED);
    }
    /**
     * Cette route permet au frontend de connaitre l'utilisateur connecte grace au token JWT.
     */
    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['message' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'email' => $user->getEmail(),
            'role' => $user->getRole()?->getCode(),
            'telephone' => $user->getTelephone(),
            'actif' => $user->isActif(),
        ]);
    }
}