<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateInternalNoteRequest
{
    #[Assert\NotBlank(message: 'Le contenu de la note est obligatoire.')]
    public ?string $contenu = null;
}
