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
 * Ce repository centralise les requetes vers la table des garages.
 *
 * @extends ServiceEntityRepository<Garage>
 */
class GarageRepository extends ServiceEntityRepository
{
    /** Cette methode connecte le repository a Doctrine pour l'entite Garage. */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Garage::class);
    }

    /** Cette methode retourne les garages actifs visibles dans le catalogue public. */
    public function findActiveGarages(): array
    {
        return $this->createQueryBuilder('garage')
            ->andWhere('garage.actif = true')
            ->orderBy('garage.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** Cette methode retourne un garage actif par son identifiant public. */
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