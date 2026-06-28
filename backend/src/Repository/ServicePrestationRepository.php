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
 * Ce repository centralise les requetes vers la table des prestations.
 *
 * @extends ServiceEntityRepository<ServicePrestation>
 */
class ServicePrestationRepository extends ServiceEntityRepository
{
    /** Cette methode connecte le repository a Doctrine pour l'entite ServicePrestation. */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ServicePrestation::class);
    }

    /** Cette methode retourne les prestations actives visibles pour un garage actif. */
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

    /** Cette methode retourne toutes les prestations du garage rattache au gerant. */
    public function findByGarage(Garage $garage): array
    {
        return $this->createQueryBuilder('service')
            ->andWhere('service.garage = :garage')
            ->setParameter('garage', $garage)
            ->orderBy('service.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** Cette methode retrouve une prestation seulement si elle appartient au garage donne. */
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