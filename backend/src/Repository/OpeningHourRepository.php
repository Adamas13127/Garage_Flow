<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite OpeningHour.
 * Il existe pour centraliser les requetes SQL liees aux horaires recurrentes d'un garage.
 * Il communique avec Doctrine ORM, Garage et MySQL pour filtrer les horaires par garage.
 */

namespace App\Repository;

use App\Entity\Garage;
use App\Entity\OpeningHour;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository centralise les requetes vers la table des horaires d'ouverture.
 *
 * @extends ServiceEntityRepository<OpeningHour>
 */
class OpeningHourRepository extends ServiceEntityRepository
{
    /** Cette methode connecte le repository a Doctrine pour l'entite OpeningHour. */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, OpeningHour::class);
    }

    /** Cette methode retourne les horaires actifs visibles pour un garage. */
    public function findActiveByGarage(Garage $garage): array
    {
        return $this->createQueryBuilder('hour')
            ->andWhere('hour.garage = :garage')
            ->andWhere('hour.actif = true')
            ->setParameter('garage', $garage)
            ->orderBy('hour.jourSemaine', 'ASC')
            ->addOrderBy('hour.heureDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** Cette methode retourne tous les horaires du garage rattache au gerant. */
    public function findByGarage(Garage $garage): array
    {
        return $this->createQueryBuilder('hour')
            ->andWhere('hour.garage = :garage')
            ->setParameter('garage', $garage)
            ->orderBy('hour.jourSemaine', 'ASC')
            ->addOrderBy('hour.heureDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** Cette methode retrouve un horaire seulement s'il appartient au garage donne. */
    public function findOneByGarageAndId(Garage $garage, int $id): ?OpeningHour
    {
        return $this->createQueryBuilder('hour')
            ->andWhere('hour.garage = :garage')
            ->andWhere('hour.id = :id')
            ->setParameter('garage', $garage)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}