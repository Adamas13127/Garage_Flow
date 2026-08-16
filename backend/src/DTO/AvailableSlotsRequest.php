<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class AvailableSlotsRequest
{
    #[Assert\NotNull(message: 'La prestation est obligatoire.')]
    #[Assert\Positive(message: 'La prestation doit etre valide.')]
    public ?int $serviceId = null;

    #[Assert\NotBlank(message: 'La date est obligatoire.')]
    public ?string $date = null;
}
