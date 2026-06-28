<?php

/*
 * Ce fichier declare le DTO UpdateInterventionStatusRequest du backend GarageFlow.
 * Il existe pour valider le changement de statut d'une intervention par le garage.
 * Il communique avec GarageInterventionController, Symfony Validator et GarageInterventionService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente les donnees necessaires pour changer le statut d'une intervention. */
class UpdateInterventionStatusRequest
{
    #[Assert\NotBlank(message: 'Le code du statut est obligatoire.')]
    #[Assert\Length(max: 80)]
    public ?string $statusCode = null;

    #[Assert\Length(max: 2000, maxMessage: 'Le commentaire est trop long.')]
    public ?string $commentaire = null;
}