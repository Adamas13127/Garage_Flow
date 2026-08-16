<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateUnavailabilityRequest
{
    public ?string $dateDebut = null;
    public ?string $dateFin = null;
    #[Assert\Length(max: 255)] public ?string $motif = null;
    /** @var array<string, bool> */
    private array $providedFields = [];

    public function markProvided(string $field): void
    {
        $this->providedFields[$field] = true;
    }

    public function hasProvided(string $field): bool
    {
        return isset($this->providedFields[$field]);
    }
}
