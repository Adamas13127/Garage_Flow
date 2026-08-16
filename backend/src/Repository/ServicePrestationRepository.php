<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite ServicePrestation.
 * Il existe pour centraliser les requetes SQL liees aux prestations d'un garage.
 * Il communique avec Doctrine ORM, Garage et MySQL pour filtrer les prestations par garage.
 */

namespace App\Repository;

use App\Entity\Garage;
use App\Entity\ServicePrestation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ServicePrestation>
 */
class ServicePrestationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ServicePrestation::class);
    }

    /**
     * @return ServicePrestation[]
     */
    public function findActiveServicesByGarage(Garage $garage): array
    {
        return $this->createQueryBuilder('service')
            ->andWhere('service.garage = :garage')
            ->andWhere('service.actif = true')
            ->setParameter('garage', $garage)
            ->orderBy('service.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return ServicePrestation[]
     */
    public function findByGarage(Garage $garage): array
    {
        return $this->createQueryBuilder('service')
            ->andWhere('service.garage = :garage')
            ->setParameter('garage', $garage)
            ->orderBy('service.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByGarageAndId(Garage $garage, int $id): ?ServicePrestation
    {
        return $this->createQueryBuilder('service')
            ->andWhere('service.garage = :garage')
            ->andWhere('service.id = :id')
            ->setParameter('garage', $garage)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
