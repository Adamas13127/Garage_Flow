<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite ActionLog.
 * Il existe pour centraliser plus tard les requetes SQL liees a cette entite.
 * Il communique avec Doctrine ORM et la base MySQL, sans contenir encore de requete metier specifique.
 */

namespace App\Repository;

use App\Entity\ActionLog;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ActionLog>
 */
class ActionLogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ActionLog::class);
    }
}
