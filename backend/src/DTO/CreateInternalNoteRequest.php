<?php

/*
 * Ce fichier declare le DTO CreateInternalNoteRequest du backend GarageFlow.
 * Il existe pour valider le contenu d'une note interne creee par un membre du garage.
 * Il communique avec GarageInterventionController, Symfony Validator et InternalNoteService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente le formulaire API de creation d'une note interne. */
class CreateInternalNoteRequest
{
    #[Assert\NotBlank(message: 'Le contenu de la note est obligatoire.')]
    public ?string $contenu = null;
}