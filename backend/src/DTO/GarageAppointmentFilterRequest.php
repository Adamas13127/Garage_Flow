<?php

/*
 * Ce fichier declare le DTO GarageAppointmentFilterRequest du backend GarageFlow.
 * Il existe pour valider les filtres envoyes par le garage lorsqu'il consulte ses rendez-vous.
 * Il communique avec GarageAppointmentController, Symfony Validator et GarageAppointmentService.
 */

namespace App\DTO;

use App\Entity\Appointment;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/** Ce DTO represente les filtres simples de liste des rendez-vous garage. */
class GarageAppointmentFilterRequest
{
    #[Assert\Length(max: 50)]
    public ?string $statut = null;

    public ?string $date = null;

    /** Cette methode verifie que le statut filtre correspond a un statut de rendez-vous connu. */
    #[Assert\Callback]
    public function validateStatut(ExecutionContextInterface $context): void
    {
        if ($this->statut === null || $this->statut === '') {
            return;
        }

        if (!in_array($this->statut, [Appointment::STATUT_EN_ATTENTE, Appointment::STATUT_CONFIRME, Appointment::STATUT_REFUSE, Appointment::STATUT_ANNULE, Appointment::STATUT_TERMINE], true)) {
            $context->buildViolation('Le statut demande est invalide.')->atPath('statut')->addViolation();
        }
    }
}