<?php

/*
 * Ce fichier liste les bundles Symfony actifs dans le backend GarageFlow.
 * Il existe pour indiquer a Symfony quels modules techniques charger.
 * Il communique avec le framework, Doctrine, les migrations et la securite.
 */

return [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    Doctrine\Bundle\DoctrineBundle\DoctrineBundle::class => ['all' => true],
    Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle::class => ['all' => true],
    Symfony\Bundle\SecurityBundle\SecurityBundle::class => ['all' => true],
];