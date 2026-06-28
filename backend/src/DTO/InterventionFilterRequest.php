<?php

/*
 * Ce fichier declare le DTO InterventionFilterRequest du backend GarageFlow.
 * Il existe pour valider les filtres utilises par le garage dans la liste des interventions.
 * Il communique avec GarageInterventionController, Symfony Validator et GarageInterventionService.
 */

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

/** Ce DTO represente les filtres de recherche des interventions du garage. */
class InterventionFilterRequest
{
    #[Assert\Length(max: 80)]
    public ?string $statusCode = null;

    public ?string $date = null;
}