<?php

/*
 * Ce fichier declare le noyau Symfony du backend GarageFlow.
 * Il existe pour charger la configuration, les routes et les services de l'API.
 * Il communique avec les bundles Symfony et avec les fichiers du dossier config/.
 */

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

/**
 * Cette classe represente le point central qui demarre l'application Symfony.
 */
class Kernel extends BaseKernel
{
    use MicroKernelTrait;
}