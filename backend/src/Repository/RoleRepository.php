<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Role.
 * Il existe pour centraliser plus tard les requetes SQL liees a cette entite.
 * Il communique avec Doctrine ORM et la base MySQL, sans contenir encore de requete metier specifique.
 */

namespace App\Repository;

use App\Entity\Role;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository servira a recuperer et filtrer les donnees de l'entite Role.
 *
 * @extends ServiceEntityRepository<Role>
 */
class RoleRepository extends ServiceEntityRepository
{
    /**
     * Cette methode connecte le repository a Doctrine pour l'entite Role.
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Role::class);
    }
}