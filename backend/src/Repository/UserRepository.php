<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite User.
 * Il existe pour centraliser plus tard les requetes SQL liees a cette entite.
 * Il communique avec Doctrine ORM et la base MySQL, sans contenir encore de requete metier specifique.
 */

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository servira a recuperer et filtrer les donnees de l'entite User.
 *
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    /**
     * Cette methode connecte le repository a Doctrine pour l'entite User.
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }
}