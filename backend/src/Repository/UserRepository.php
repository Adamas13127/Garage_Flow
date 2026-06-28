<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite User.
 * Il existe pour centraliser les requetes SQL liees aux utilisateurs GarageFlow.
 * Il communique avec Doctrine ORM, Garage, Role et la base MySQL pour retrouver les utilisateurs selon leur perimetre.
 */

namespace App\Repository;

use App\Entity\Garage;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository centralise les requetes vers la table des utilisateurs.
 *
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    /** Cette methode connecte le repository a Doctrine pour l'entite User. */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /** Cette methode retrouve les gerants actifs d'un garage pour leur envoyer une notification. */
    public function findActiveManagersByGarage(Garage $garage): array
    {
        return $this->createQueryBuilder('user')
            ->join('user.role', 'role')
            ->andWhere('user.garage = :garage')
            ->andWhere('user.actif = true')
            ->andWhere('role.code = :roleCode')
            ->setParameter('garage', $garage)
            ->setParameter('roleCode', 'ROLE_GERANT')
            ->orderBy('user.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
}