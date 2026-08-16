<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class InterventionFilterRequest
{
    #[Assert\Length(max: 80)]
    public ?string $statusCode = null;

    public ?string $date = null;
}
