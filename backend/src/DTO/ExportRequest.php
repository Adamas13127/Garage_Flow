<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class ExportRequest
{
    #[Assert\NotBlank(message: 'Le parametre from est obligatoire (format YYYY-MM-DD).')]
    public ?string $from = null;

    #[Assert\NotBlank(message: 'Le parametre to est obligatoire (format YYYY-MM-DD).')]
    public ?string $to = null;

    public ?string $format = 'json';

    #[Assert\Callback]
    public function validateFormat(ExecutionContextInterface $context): void
    {
        if (!in_array($this->format, ['csv', 'json'], true)) {
            $context->buildViolation('Le format demande doit etre csv ou json.')->atPath('format')->addViolation();
        }
    }
}
