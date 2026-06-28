<?php

/*
 * Ce fichier demarre l'environnement de test du backend GarageFlow.
 * Il existe pour charger Composer, les variables Symfony et les reglages necessaires a PHPUnit.
 * Il communique avec Symfony Dotenv et le Kernel utilise par les tests automatises.
 */

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}