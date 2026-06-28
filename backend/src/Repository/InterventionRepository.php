<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Intervention.
 * Il existe pour centraliser les requetes SQL liees au suivi atelier cree apres confirmation d'un rendez-vous.
 * Il communique avec Doctrine ORM, Appointment, Garage, User et la base MySQL.
 */

namespace App\Repository;

use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\Intervention;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository centralise les requetes vers la table des interventions.
 *
 * @extends ServiceEntityRepository<Intervention>
 */
class InterventionRepository extends ServiceEntityRepository
{
    /** Cette methode connecte le repository a Doctrine pour l'entite Intervention. */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Intervention::class);
    }

    /** Cette methode retrouve l'intervention creee pour un rendez-vous donne. */
    public function findOneByAppointment(Appointment $appointment): ?Intervention
    {
        return $this->createQueryBuilder('intervention')
            ->andWhere('intervention.appointment = :appointment')
            ->setParameter('appointment', $appointment)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** Cette methode liste les interventions d'un garage avec filtres de statut et de date. */
    public function findByGarageWithFilters(Garage $garage, ?string $statusCode, ?\DateTimeImmutable $date): array
    {
        $queryBuilder = $this->createQueryBuilder('intervention')
            ->join('intervention.appointment', 'appointment')
            ->join('intervention.statutActuel', 'status')
            ->andWhere('appointment.garage = :garage')
            ->setParameter('garage', $garage)
            ->orderBy('appointment.dateDebut', 'DESC');

        if ($statusCode !== null && $statusCode !== '') {
            $queryBuilder
                ->andWhere('status.code = :statusCode')
                ->setParameter('statusCode', $statusCode);
        }

        if ($date instanceof \DateTimeImmutable) {
            $queryBuilder
                ->andWhere('appointment.dateDebut >= :dayStart')
                ->andWhere('appointment.dateDebut < :dayEnd')
                ->setParameter('dayStart', $date->setTime(0, 0))
                ->setParameter('dayEnd', $date->setTime(0, 0)->modify('+1 day'));
        }

        return $queryBuilder->getQuery()->getResult();
    }

    /** Cette methode retrouve une intervention seulement si elle appartient au garage donne. */
    public function findOneByGarageAndId(Garage $garage, int $id): ?Intervention
    {
        return $this->createQueryBuilder('intervention')
            ->join('intervention.appointment', 'appointment')
            ->andWhere('appointment.garage = :garage')
            ->andWhere('intervention.id = :id')
            ->setParameter('garage', $garage)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** Cette methode liste les interventions rattachees aux rendez-vous du client connecte. */
    public function findByClient(User $client): array
    {
        return $this->createQueryBuilder('intervention')
            ->join('intervention.appointment', 'appointment')
            ->andWhere('appointment.client = :client')
            ->setParameter('client', $client)
            ->orderBy('appointment.dateDebut', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** Cette methode retrouve une intervention seulement si elle appartient au client donne. */
    public function findOneByClientAndId(User $client, int $id): ?Intervention
    {
        return $this->createQueryBuilder('intervention')
            ->join('intervention.appointment', 'appointment')
            ->andWhere('appointment.client = :client')
            ->andWhere('intervention.id = :id')
            ->setParameter('client', $client)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}