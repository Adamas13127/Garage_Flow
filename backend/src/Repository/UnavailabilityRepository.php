<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Unavailability.
 * Il existe pour centraliser les requetes SQL liees aux indisponibilites d'un garage.
 * Il communique avec Doctrine ORM, Garage et MySQL pour filtrer les indisponibilites par garage.
 */

namespace App\Repository;

use App\Entity\Garage;
use App\Entity\Unavailability;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Unavailability>
 */
class UnavailabilityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Unavailability::class);
    }

    /**
     * @return Unavailability[]
     */
    public function findFutureByGarage(Garage $garage): array
    {
        return $this->createQueryBuilder('unavailability')
            ->andWhere('unavailability.garage = :garage')
            ->andWhere('unavailability.dateFin >= :now')
            ->setParameter('garage', $garage)
            ->setParameter('now', new \DateTimeImmutable())
            ->orderBy('unavailability.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Unavailability[]
     */
    public function findByGarage(Garage $garage): array
    {
        return $this->createQueryBuilder('unavailability')
            ->andWhere('unavailability.garage = :garage')
            ->setParameter('garage', $garage)
            ->orderBy('unavailability.dateDebut', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByGarageAndId(Garage $garage, int $id): ?Unavailability
    {
        return $this->createQueryBuilder('unavailability')
            ->andWhere('unavailability.garage = :garage')
            ->andWhere('unavailability.id = :id')
            ->setParameter('garage', $garage)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return Unavailability[]
     */
    public function findForGarageBetween(Garage $garage, \DateTimeImmutable $start, \DateTimeImmutable $end): array
    {
        return $this->createQueryBuilder('unavailability')
            ->andWhere('unavailability.garage = :garage')
            ->andWhere('unavailability.dateDebut < :end')
            ->andWhere('unavailability.dateFin > :start')
            ->setParameter('garage', $garage)
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('unavailability.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
