<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Appointment.
 * Il existe pour centraliser les requetes SQL liees aux rendez-vous clients et garage.
 * Il communique avec Doctrine ORM, User, Garage et MySQL pour filtrer les rendez-vous sans exposer ceux des autres utilisateurs.
 */

namespace App\Repository;

use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository centralise les requetes vers la table des rendez-vous.
 *
 * @extends ServiceEntityRepository<Appointment>
 */
class AppointmentRepository extends ServiceEntityRepository
{
    /** Cette methode connecte le repository a Doctrine pour l'entite Appointment. */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Appointment::class);
    }

    /** Cette methode retrouve les rendez-vous qui bloquent une periode pour un garage donne. */
    public function findBlockingAppointmentsForGarageBetween(Garage $garage, \DateTimeImmutable $start, \DateTimeImmutable $end): array
    {
        return $this->findBlockingAppointmentsForGarageBetweenExcludingAppointment($garage, $start, $end, null);
    }

    /** Cette methode retrouve les rendez-vous bloquants en excluant le rendez-vous en cours de decision. */
    public function findBlockingAppointmentsForGarageBetweenExcludingAppointment(Garage $garage, \DateTimeImmutable $start, \DateTimeImmutable $end, ?Appointment $excludedAppointment): array
    {
        $queryBuilder = $this->createQueryBuilder('appointment')
            ->andWhere('appointment.garage = :garage')
            ->andWhere('appointment.statut IN (:statuses)')
            ->andWhere('appointment.dateDebut < :end')
            ->andWhere('appointment.dateFin > :start')
            ->setParameter('garage', $garage)
            ->setParameter('statuses', [Appointment::STATUT_EN_ATTENTE, Appointment::STATUT_CONFIRME])
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('appointment.dateDebut', 'ASC');

        if ($excludedAppointment instanceof Appointment && $excludedAppointment->getId() !== null) {
            $queryBuilder
                ->andWhere('appointment.id != :excludedId')
                ->setParameter('excludedId', $excludedAppointment->getId());
        }

        return $queryBuilder->getQuery()->getResult();
    }

    /** Cette methode retourne tous les rendez-vous appartenant au client connecte. */
    public function findByClient(User $client): array
    {
        return $this->createQueryBuilder('appointment')
            ->andWhere('appointment.client = :client')
            ->setParameter('client', $client)
            ->orderBy('appointment.dateDebut', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** Cette methode retrouve un rendez-vous uniquement s'il appartient au client donne. */
    public function findOneByClientAndId(User $client, int $id): ?Appointment
    {
        return $this->createQueryBuilder('appointment')
            ->andWhere('appointment.client = :client')
            ->andWhere('appointment.id = :id')
            ->setParameter('client', $client)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** Cette methode retourne les rendez-vous d'un garage avec des filtres simples de statut et de date. */
    public function findByGarageWithFilters(Garage $garage, ?string $statut, ?\DateTimeImmutable $date): array
    {
        $queryBuilder = $this->createQueryBuilder('appointment')
            ->andWhere('appointment.garage = :garage')
            ->setParameter('garage', $garage)
            ->orderBy('appointment.dateDebut', 'ASC');

        if ($statut !== null && $statut !== '') {
            $queryBuilder
                ->andWhere('appointment.statut = :statut')
                ->setParameter('statut', $statut);
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

    /** Cette methode retrouve un rendez-vous uniquement s'il appartient au garage donne. */
    public function findOneByGarageAndId(Garage $garage, int $id): ?Appointment
    {
        return $this->createQueryBuilder('appointment')
            ->andWhere('appointment.garage = :garage')
            ->andWhere('appointment.id = :id')
            ->setParameter('garage', $garage)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}