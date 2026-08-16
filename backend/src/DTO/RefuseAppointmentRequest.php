<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class RefuseAppointmentRequest
{
    #[Assert\Length(max: 1000, maxMessage: 'Le motif de refus est trop long.')]
    public ?string $motifRefus = null;
}
