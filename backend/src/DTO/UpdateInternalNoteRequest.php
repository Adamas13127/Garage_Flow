<?php

/*
 * Ce fichier declare le DTO UpdateInternalNoteRequest du backend GarageFlow.
 * Il existe pour valider le contenu modifie d'une note interne existante.
 * Il communique avec GarageInterventionController, Symfony Validator et InternalNoteService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateInternalNoteRequest
{
    #[Assert\NotBlank(message: 'Le contenu de la note est obligatoire.')]
    public ?string $contenu = null;
}
