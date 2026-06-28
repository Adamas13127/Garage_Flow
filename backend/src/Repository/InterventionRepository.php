<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Intervention.
 * Il existe pour centraliser les requetes SQL liees au suivi atelier cree apres confirmation d'un rendez-vous.
 * Il communique avec Doctrine ORM, Appointment et la base MySQL.
 */

namespace App\Repository;

use App\Entity\Appointment;
use App\Entity\Intervention;
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
}