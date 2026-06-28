<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Appointment.
 * Il existe pour centraliser les requetes SQL liees aux rendez-vous clients.
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
        return $this->createQueryBuilder('appointment')
            ->andWhere('appointment.garage = :garage')
            ->andWhere('appointment.statut IN (:statuses)')
            ->andWhere('appointment.dateDebut < :end')
            ->andWhere('appointment.dateFin > :start')
            ->setParameter('garage', $garage)
            ->setParameter('statuses', [Appointment::STATUT_EN_ATTENTE, Appointment::STATUT_CONFIRME])
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('appointment.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
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
}