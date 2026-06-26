<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite InterventionStatus.
 * Il existe pour centraliser plus tard les requetes SQL liees a cette entite.
 * Il communique avec Doctrine ORM et la base MySQL, sans contenir encore de requete metier specifique.
 */

namespace App\Repository;

use App\Entity\InterventionStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository servira a recuperer et filtrer les donnees de l'entite InterventionStatus.
 *
 * @extends ServiceEntityRepository<InterventionStatus>
 */
class InterventionStatusRepository extends ServiceEntityRepository
{
    /**
     * Cette methode connecte le repository a Doctrine pour l'entite InterventionStatus.
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, InterventionStatus::class);
    }
}