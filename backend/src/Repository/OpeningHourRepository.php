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
 * @extends ServiceEntityRepository<OpeningHour>
 */
class OpeningHourRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, OpeningHour::class);
    }

    /**
     * @return OpeningHour[]
     */
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

    /**
     * @return OpeningHour[]
     */
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

    /**
     * @return OpeningHour[]
     */
    public function findActiveByGarageAndWeekday(Garage $garage, int $weekday): array
    {
        return $this->createQueryBuilder('hour')
            ->andWhere('hour.garage = :garage')
            ->andWhere('hour.jourSemaine = :weekday')
            ->andWhere('hour.actif = true')
            ->setParameter('garage', $garage)
            ->setParameter('weekday', $weekday)
            ->orderBy('hour.heureDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
