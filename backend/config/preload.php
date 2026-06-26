<?php

/*
 * Ce fichier peut preparer le prechargement PHP du backend GarageFlow.
 * Il existe pour aider les performances en production si l'environnement l'utilise.
 * Il est gere par Symfony et ne contient pas de logique metier.
 */

if (file_exists(dirname(__DIR__).'/var/cache/prod/App_KernelProdContainer.preload.php')) {
    require dirname(__DIR__).'/var/cache/prod/App_KernelProdContainer.preload.php';
}