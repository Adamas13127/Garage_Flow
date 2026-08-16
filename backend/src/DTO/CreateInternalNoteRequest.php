<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateInternalNoteRequest
{
    #[Assert\NotBlank(message: 'Le contenu de la note est obligatoire.')]
    public ?string $contenu = null;
}
