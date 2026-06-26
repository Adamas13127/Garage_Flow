<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Intervention.
 * Il existe pour centraliser plus tard les requetes SQL liees a cette entite.
 * Il communique avec Doctrine ORM et la base MySQL, sans contenir encore de requete metier specifique.
 */

namespace App\Repository;

use App\Entity\Intervention;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository servira a recuperer et filtrer les donnees de l'entite Intervention.
 *
 * @extends ServiceEntityRepository<Intervention>
 */
class InterventionRepository extends ServiceEntityRepository
{
    /**
     * Cette methode connecte le repository a Doctrine pour l'entite Intervention.
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Intervention::class);
    }
}