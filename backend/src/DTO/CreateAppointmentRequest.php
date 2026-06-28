<?php

/*
 * Ce fichier declare le DTO CreateAppointmentRequest du backend GarageFlow.
 * Il existe pour transporter et valider les donnees envoyees par un client lors d'une demande de rendez-vous.
 * Il communique avec AppointmentController, Symfony Validator et AppointmentService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente le formulaire API de creation d'un rendez-vous client. */
class CreateAppointmentRequest
{
    #[Assert\NotNull(message: 'Le garage est obligatoire.')]
    #[Assert\Positive(message: 'Le garage doit etre valide.')]
    public ?int $garageId = null;

    #[Assert\NotNull(message: 'Le vehicule est obligatoire.')]
    #[Assert\Positive(message: 'Le vehicule doit etre valide.')]
    public ?int $vehicleId = null;

    #[Assert\NotNull(message: 'La prestation est obligatoire.')]
    #[Assert\Positive(message: 'La prestation doit etre valide.')]
    public ?int $serviceId = null;

    #[Assert\NotBlank(message: 'La date de debut est obligatoire.')]
    public ?string $dateDebut = null;

    #[Assert\Length(max: 2000, maxMessage: 'Le commentaire est trop long.')]
    public ?string $commentaireClient = null;
}