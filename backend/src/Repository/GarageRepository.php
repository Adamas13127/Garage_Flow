<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Garage.
 * Il existe pour centraliser les requetes SQL liees au catalogue et a la gestion des garages.
 * Il communique avec Doctrine ORM et MySQL pour filtrer les garages actifs ou rattaches a un utilisateur.
 */

namespace App\Repository;

use App\Entity\Garage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Garage>
 */
class GarageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Garage::class);
    }

    /**
     * @return Garage[]
     */
    public function findActiveGarages(): array
    {
        return $this->createQueryBuilder('garage')
            ->andWhere('garage.actif = true')
            ->orderBy('garage.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findActiveGarageById(int $id): ?Garage
    {
        return $this->createQueryBuilder('garage')
            ->andWhere('garage.id = :id')
            ->andWhere('garage.actif = true')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
