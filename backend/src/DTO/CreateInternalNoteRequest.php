<?php

/*
 * Ce fichier declare le DTO CreateInternalNoteRequest du backend GarageFlow.
 * Il existe pour valider le contenu d'une note interne creee par un membre du garage.
 * Il communique avec GarageInterventionController, Symfony Validator et InternalNoteService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateInternalNoteRequest
{
    #[Assert\NotBlank(message: 'Le contenu de la note est obligatoire.')]
    public ?string $contenu = null;
}
