<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

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
