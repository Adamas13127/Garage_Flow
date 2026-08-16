<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateServicePrestationRequest
{
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(max: 150)]
    public ?string $nom = null;
    public ?string $description = null;
    #[Assert\NotNull(message: 'La duree est obligatoire.')]
    #[Assert\Positive(message: 'La duree doit etre positive.')]
    public ?int $dureeMinutes = null;
    public ?bool $actif = true;
}
