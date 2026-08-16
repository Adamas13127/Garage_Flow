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
 * @extends ServiceEntityRepository<Appointment>
 */
class AppointmentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Appointment::class);
    }

    /**
     * @return Appointment[]
     */
    public function findBlockingAppointmentsForGarageBetween(Garage $garage, \DateTimeImmutable $start, \DateTimeImmutable $end): array
    {
        return $this->findBlockingAppointmentsForGarageBetweenExcludingAppointment($garage, $start, $end, null);
    }

    /**
     * @return Appointment[]
     */
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

        if ($excludedAppointment instanceof Appointment && null !== $excludedAppointment->getId()) {
            $queryBuilder
                ->andWhere('appointment.id != :excludedId')
                ->setParameter('excludedId', $excludedAppointment->getId());
        }

        return $queryBuilder->getQuery()->getResult();
    }

    /**
     * @return Appointment[]
     */
    public function findByClient(User $client): array
    {
        return $this->createQueryBuilder('appointment')
            ->andWhere('appointment.client = :client')
            ->setParameter('client', $client)
            ->orderBy('appointment.dateDebut', 'DESC')
            ->getQuery()
            ->getResult();
    }

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

    /**
     * @return Appointment[]
     */
    public function findByGarageWithFilters(Garage $garage, ?string $statut, ?\DateTimeImmutable $date): array
    {
        $queryBuilder = $this->createQueryBuilder('appointment')
            ->andWhere('appointment.garage = :garage')
            ->setParameter('garage', $garage)
            ->orderBy('appointment.dateDebut', 'ASC');

        if (null !== $statut && '' !== $statut) {
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

    /**
     * @return Appointment[]
     */
    public function findByGarageBetweenDates(Garage $garage, \DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return $this->createQueryBuilder('appointment')
            ->andWhere('appointment.garage = :garage')
            ->andWhere('appointment.dateDebut >= :from')
            ->andWhere('appointment.dateDebut < :to')
            ->setParameter('garage', $garage)
            ->setParameter('from', $from->setTime(0, 0))
            ->setParameter('to', $to->setTime(0, 0)->modify('+1 day'))
            ->orderBy('appointment.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
