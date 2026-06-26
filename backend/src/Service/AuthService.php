<?php

/*
 * Ce fichier declare le service AuthService du backend GarageFlow.
 * Il existe pour regrouper la logique necessaire a la creation d'un compte client.
 * Il communique avec les repositories, Doctrine, le hasher Symfony et l'entite User.
 */

namespace App\Service;

use App\DTO\RegisterClientRequest;
use App\Entity\Role;
use App\Entity\User;
use App\Repository\RoleRepository;
use App\Repository\UserRepository;
use App\Security\DuplicateEmailException;
use Doctrine\ORM\EntityManagerInterface;
use RuntimeException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Ce service contient la logique metier necessaire a la creation d'un compte client.
 */
class AuthService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly RoleRepository $roleRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    /**
     * Cette methode verifie l'email, hash le mot de passe puis sauvegarde le client en base.
     */
    public function registerClient(RegisterClientRequest $request): User
    {
        $email = mb_strtolower(trim((string) $request->email));

        if ($this->userRepository->findOneBy(['email' => $email]) !== null) {
            throw new DuplicateEmailException('Un compte existe deja avec cet email.');
        }

        $role = $this->roleRepository->findOneBy(['code' => 'ROLE_CLIENT']);
        if (!$role instanceof Role) {
            throw new RuntimeException('Le role ROLE_CLIENT doit etre charge avant de creer un client.');
        }

        $user = new User();
        $user->setRole($role);
        $user->setNom(trim((string) $request->nom));
        $user->setPrenom(trim((string) $request->prenom));
        $user->setEmail($email);
        $user->setTelephone($request->telephone !== null && trim($request->telephone) !== '' ? trim($request->telephone) : null);
        $user->setActif(true);
        $user->setPassword($this->passwordHasher->hashPassword($user, (string) $request->password));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }
}