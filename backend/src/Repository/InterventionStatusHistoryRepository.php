<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite InterventionStatusHistory.
 * Il existe pour centraliser les requetes SQL liees a l'historique des statuts d'intervention.
 * Il communique avec Doctrine ORM, Intervention, InterventionStatus et la base MySQL.
 */

namespace App\Repository;

use App\Entity\Intervention;
use App\Entity\InterventionStatusHistory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository centralise les requetes vers la table d'historique des statuts.
 *
 * @extends ServiceEntityRepository<InterventionStatusHistory>
 */
class InterventionStatusHistoryRepository extends ServiceEntityRepository
{
    /** Cette methode connecte le repository a Doctrine pour l'entite InterventionStatusHistory. */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, InterventionStatusHistory::class);
    }

    /** Cette methode retourne tout l'historique d'une intervention pour le garage. */
    public function findHistoryByIntervention(Intervention $intervention): array
    {
        return $this->createQueryBuilder('history')
            ->andWhere('history.intervention = :intervention')
            ->setParameter('intervention', $intervention)
            ->orderBy('history.changedAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** Cette methode retourne seulement l'historique visible par le client. */
    public function findVisibleHistoryByIntervention(Intervention $intervention): array
    {
        return $this->createQueryBuilder('history')
            ->join('history.status', 'status')
            ->andWhere('history.intervention = :intervention')
            ->andWhere('status.visibleClient = true')
            ->setParameter('intervention', $intervention)
            ->orderBy('history.changedAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}