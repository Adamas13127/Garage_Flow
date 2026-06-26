<?php

/*
 * Ce fichier declare les fixtures de reference du backend GarageFlow.
 * Il existe pour inserer les roles et statuts indispensables au MVP.
 * Il communique avec Doctrine afin d'enregistrer ces donnees dans MySQL.
 */

namespace App\DataFixtures;

use App\Entity\InterventionStatus;
use App\Entity\Role;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Cette fixture insere les roles et les statuts necessaires au fonctionnement de base de l'application.
 */
class AppFixtures extends Fixture
{
    /**
     * Cette methode charge uniquement les donnees de reference, sans creer de faux utilisateurs.
     */
    public function load(ObjectManager $manager): void
    {
        $this->loadRoles($manager);
        $this->loadInterventionStatuses($manager);

        $manager->flush();
    }

    /** Cette methode ajoute ou met a jour les roles Symfony utilises plus tard par la securite. */
    private function loadRoles(ObjectManager $manager): void
    {
        $roles = [
            'ROLE_ADMIN' => 'Administrateur plateforme',
            'ROLE_GERANT' => 'Gerant de garage',
            'ROLE_EMPLOYE' => 'Employe de garage',
            'ROLE_CLIENT' => 'Client',
        ];

        $repository = $manager->getRepository(Role::class);

        foreach ($roles as $code => $libelle) {
            $role = $repository->findOneBy(['code' => $code]) ?? new Role();
            $role->setCode($code);
            $role->setLibelle($libelle);
            $manager->persist($role);
        }
    }

    /** Cette methode ajoute ou met a jour les statuts standards du suivi d'intervention. */
    private function loadInterventionStatuses(ObjectManager $manager): void
    {
        $statuses = [
            ['VEHICULE_DEPOSE', 'Vehicule depose', 1],
            ['DIAGNOSTIC_EN_COURS', 'Diagnostic en cours', 2],
            ['ATTENTE_VALIDATION_CLIENT', 'Attente validation client', 3],
            ['REPARATION_EN_COURS', 'Reparation en cours', 4],
            ['VEHICULE_PRET', 'Vehicule pret', 5],
            ['VEHICULE_RECUPERE', 'Vehicule recupere', 6],
        ];

        $repository = $manager->getRepository(InterventionStatus::class);

        foreach ($statuses as [$code, $libelle, $ordreAffichage]) {
            $status = $repository->findOneBy(['code' => $code]) ?? new InterventionStatus();
            $status->setCode($code);
            $status->setLibelle($libelle);
            $status->setOrdreAffichage($ordreAffichage);
            $status->setVisibleClient(true);
            $manager->persist($status);
        }
    }
}