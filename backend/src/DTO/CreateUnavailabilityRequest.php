<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateUnavailabilityRequest
{
    #[Assert\NotBlank(message: 'La date de debut est obligatoire.')]
    public ?string $dateDebut = null;
    #[Assert\NotBlank(message: 'La date de fin est obligatoire.')]
    public ?string $dateFin = null;
    #[Assert\Length(max: 255)]
    public ?string $motif = null;
}
