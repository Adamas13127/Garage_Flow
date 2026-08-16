<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateInterventionStatusRequest
{
    #[Assert\NotBlank(message: 'Le code du statut est obligatoire.')]
    #[Assert\Length(max: 80)]
    public ?string $statusCode = null;

    #[Assert\Length(max: 2000, maxMessage: 'Le commentaire est trop long.')]
    public ?string $commentaire = null;
}
