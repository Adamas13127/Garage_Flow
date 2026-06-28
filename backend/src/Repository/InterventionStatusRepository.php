<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite InterventionStatus.
 * Il existe pour retrouver les statuts de reference utilises par le suivi atelier.
 * Il communique avec Doctrine ORM et la base MySQL pour choisir le statut initial d'une intervention.
 */

namespace App\Repository;

use App\Entity\InterventionStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository centralise les requetes vers la table des statuts d'intervention.
 *
 * @extends ServiceEntityRepository<InterventionStatus>
 */
class InterventionStatusRepository extends ServiceEntityRepository
{
    /** Cette methode connecte le repository a Doctrine pour l'entite InterventionStatus. */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, InterventionStatus::class);
    }

    /** Cette methode retrouve un statut d'intervention par son code technique. */
    public function findOneByCode(string $code): ?InterventionStatus
    {
        return $this->createQueryBuilder('status')
            ->andWhere('status.code = :code')
            ->setParameter('code', $code)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** Cette methode retourne le premier statut selon l'ordre d'affichage configure. */
    public function findFirstByOrder(): ?InterventionStatus
    {
        return $this->createQueryBuilder('status')
            ->orderBy('status.ordreAffichage', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}