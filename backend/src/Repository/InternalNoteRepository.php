<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite InternalNote.
 * Il existe pour centraliser les requetes SQL liees aux notes internes d'une intervention.
 * Il communique avec Doctrine ORM, Intervention et la base MySQL sans jamais exposer ces notes aux clients.
 */

namespace App\Repository;

use App\Entity\InternalNote;
use App\Entity\Intervention;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<InternalNote>
 */
class InternalNoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, InternalNote::class);
    }

    /**
     * @return InternalNote[]
     */
    public function findNotesByIntervention(Intervention $intervention): array
    {
        return $this->createQueryBuilder('note')
            ->andWhere('note.intervention = :intervention')
            ->setParameter('intervention', $intervention)
            ->orderBy('note.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findOneNoteByInterventionAndId(Intervention $intervention, int $id): ?InternalNote
    {
        return $this->createQueryBuilder('note')
            ->andWhere('note.intervention = :intervention')
            ->andWhere('note.id = :id')
            ->setParameter('intervention', $intervention)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
