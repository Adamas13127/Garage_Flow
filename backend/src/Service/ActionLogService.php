<?php

/*
 * Ce fichier declare le service ActionLogService du backend GarageFlow.
 * Il existe pour journaliser dans action_log les actions metier importantes avec l'utilisateur
 * authentifie a l'origine de l'action -- ce que le declencheur SQL d'audit ne peut pas faire,
 * une connexion MySQL n'ayant aucune notion de l'utilisateur JWT applicatif.
 * Il communique avec les services metier (rendez-vous, interventions, prestations,
 * indisponibilites, garages) et Doctrine ORM.
 */

namespace App\Service;

use App\Entity\ActionLog;
use App\Entity\Garage;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class ActionLogService
{
    public const APPOINTMENT_CREATED = 'RENDEZ_VOUS_CREE';
    public const APPOINTMENT_ACCEPTED = 'RENDEZ_VOUS_ACCEPTE';
    public const APPOINTMENT_REFUSED = 'RENDEZ_VOUS_REFUSE';
    public const APPOINTMENT_CANCELLED = 'RENDEZ_VOUS_ANNULE';
    public const INTERVENTION_CREATED = 'INTERVENTION_CREEE';
    public const INTERVENTION_STATUS_CHANGED = 'INTERVENTION_STATUT_CHANGE';
    public const SERVICE_CREATED = 'PRESTATION_CREEE';
    public const SERVICE_UPDATED = 'PRESTATION_MODIFIEE';
    public const UNAVAILABILITY_CREATED = 'INDISPONIBILITE_CREEE';
    public const UNAVAILABILITY_UPDATED = 'INDISPONIBILITE_MODIFIEE';
    public const GARAGE_UPDATED = 'GARAGE_MODIFIE';

    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function log(User $author, ?Garage $garage, string $action, string $entiteConcernee, int $idEntiteConcernee, ?string $description = null): void
    {
        $log = new ActionLog();
        $log
            ->setUser($author)
            ->setGarage($garage)
            ->setAction($action)
            ->setEntiteConcernee($entiteConcernee)
            ->setIdEntiteConcernee($idEntiteConcernee)
            ->setDescription($description)
            ->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($log);
    }
}
