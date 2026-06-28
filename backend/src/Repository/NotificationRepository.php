<?php

/*
 * Ce fichier declare le repository Doctrine de l'entite Notification.
 * Il existe pour centraliser les requetes SQL liees aux notifications in-app du MVP.
 * Il communique avec Doctrine ORM, User et la base MySQL pour garantir qu'un utilisateur ne voit que ses notifications.
 */

namespace App\Repository;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Ce repository centralise les requetes vers la table des notifications.
 *
 * @extends ServiceEntityRepository<Notification>
 */
class NotificationRepository extends ServiceEntityRepository
{
    /** Cette methode connecte le repository a Doctrine pour l'entite Notification. */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    /** Cette methode liste les notifications d'un utilisateur, les plus recentes d'abord. */
    public function findByRecipient(User $recipient): array
    {
        return $this->createQueryBuilder('notification')
            ->andWhere('notification.recipient = :recipient')
            ->setParameter('recipient', $recipient)
            ->orderBy('notification.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** Cette methode liste seulement les notifications non lues d'un utilisateur. */
    public function findUnreadByRecipient(User $recipient): array
    {
        return $this->createQueryBuilder('notification')
            ->andWhere('notification.recipient = :recipient')
            ->andWhere('notification.lu = false')
            ->setParameter('recipient', $recipient)
            ->orderBy('notification.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** Cette methode retrouve une notification uniquement si elle appartient a l'utilisateur donne. */
    public function findOneByRecipientAndId(User $recipient, int $id): ?Notification
    {
        return $this->createQueryBuilder('notification')
            ->andWhere('notification.recipient = :recipient')
            ->andWhere('notification.id = :id')
            ->setParameter('recipient', $recipient)
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}