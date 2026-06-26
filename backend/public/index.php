<?php

/*
 * Ce fichier est le point d'entree HTTP du backend GarageFlow.
 * Il existe pour recevoir les requetes web et les transmettre au noyau Symfony.
 * Il communique avec App\Kernel et avec l'autoload Composer.
 */

use App\Kernel;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

/**
 * Cette fonction cree le noyau Symfony avec l'environnement courant.
 */
return static function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};