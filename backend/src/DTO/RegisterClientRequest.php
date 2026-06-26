<?php

/*
 * Ce fichier declare le DTO RegisterClientRequest du backend GarageFlow.
 * Il existe pour transporter et valider les donnees envoyees lors de l'inscription client.
 * Il communique avec AuthController, le validator Symfony et AuthService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Ce DTO represente les informations necessaires pour creer un compte client.
 */
class RegisterClientRequest
{
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(max: 100, maxMessage: 'Le nom ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $nom = null;

    #[Assert\NotBlank(message: 'Le prenom est obligatoire.')]
    #[Assert\Length(max: 100, maxMessage: 'Le prenom ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $prenom = null;

    #[Assert\NotBlank(message: 'L email est obligatoire.')]
    #[Assert\Email(message: 'L email doit etre valide.')]
    #[Assert\Length(max: 180, maxMessage: 'L email ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $email = null;

    #[Assert\NotBlank(message: 'Le mot de passe est obligatoire.')]
    #[Assert\Length(min: 8, max: 255, minMessage: 'Le mot de passe doit contenir au moins {{ limit }} caracteres.')]
    public ?string $password = null;

    #[Assert\Length(max: 30, maxMessage: 'Le telephone ne doit pas depasser {{ limit }} caracteres.')]
    public ?string $telephone = null;
}