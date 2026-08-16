<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Vehicle.
 * Il existe pour centraliser les requetes SQL liees aux vehicules des clients.
 * Il communique avec Doctrine ORM, User et la base MySQL pour filtrer les vehicules par proprietaire.
 */

namespace App\Repository;

use App\Entity\User;
use App\Entity\Vehicle;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Vehicle>
 */
class VehicleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Vehicle::class);
    }

    /**
     * @return list<Vehicle>
     */
    public function findByClient(User $client): array
    {
        return $this->createQueryBuilder('vehicle')
            ->andWhere('vehicle.client = :client')
            ->setParameter('client', $client)
            ->orderBy('vehicle.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByClientAndId(User $client, int $id): ?Vehicle
    {
        return $this->createQueryBuilder('vehicle')
            ->andWhere('vehicle.client = :client')
            ->andWhere('vehicle.id = :id')
            ->setParameter('client', $client)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function existsByClientAndPlate(User $client, string $plate, ?Vehicle $excludedVehicle = null): bool
    {
        $queryBuilder = $this->createQueryBuilder('vehicle')
            ->select('COUNT(vehicle.id)')
            ->andWhere('vehicle.client = :client')
            ->andWhere('vehicle.plaqueImmatriculation = :plate')
            ->setParameter('client', $client)
            ->setParameter('plate', $plate);

        if (null !== $excludedVehicle && null !== $excludedVehicle->getId()) {
            $queryBuilder
                ->andWhere('vehicle.id != :excludedId')
                ->setParameter('excludedId', $excludedVehicle->getId());
        }

        return (int) $queryBuilder->getQuery()->getSingleScalarResult() > 0;
    }
}
