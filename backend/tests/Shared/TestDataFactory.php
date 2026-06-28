<?php

/*
 * Ce fichier declare la fabrique de donnees des tests GarageFlow.
 * Il existe pour creer rapidement des roles, utilisateurs, garages, prestations et vehicules coherents.
 * Il communique avec Doctrine ORM et les entites du backend utilisees par les tests API.
 */

namespace App\Tests\Shared;

use App\Entity\Garage;
use App\Entity\InterventionStatus;
use App\Entity\OpeningHour;
use App\Entity\Role;
use App\Entity\ServicePrestation;
use App\Entity\User;
use App\Entity\Vehicle;
use Doctrine\ORM\EntityManagerInterface;

/** Cette classe construit les donnees minimales necessaires aux scenarios API. */
class TestDataFactory
{
    public const DEFAULT_PASSWORD = 'Password123';
    private int $counter = 1;

    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    /** Cette methode cree les roles et statuts indispensables au MVP. */
    public function ensureReferenceData(): void
    {
        $this->role('ROLE_ADMIN', 'Administrateur plateforme');
        $this->role('ROLE_GERANT', 'Gerant de garage');
        $this->role('ROLE_EMPLOYE', 'Employe de garage');
        $this->role('ROLE_CLIENT', 'Client');

        $this->status('VEHICULE_DEPOSE', 'Vehicule depose', 1);
        $this->status('DIAGNOSTIC_EN_COURS', 'Diagnostic en cours', 2);
        $this->status('ATTENTE_VALIDATION_CLIENT', 'Attente validation client', 3);
        $this->status('REPARATION_EN_COURS', 'Reparation en cours', 4);
        $this->status('VEHICULE_PRET', 'Vehicule pret', 5);
        $this->status('VEHICULE_RECUPERE', 'Vehicule recupere', 6);
        $this->entityManager->flush();
    }

    /** Cette methode cree un garage actif avec horaires ouverts toute la semaine. */
    public function garageWithManager(): array
    {
        $garage = $this->garage();
        $manager = $this->user('ROLE_GERANT', 'gerant'.$this->counter.'@garageflow.test', $garage);
        $service = $this->service($garage);
        $this->openingHours($garage);
        $this->entityManager->flush();

        return ['garage' => $garage, 'manager' => $manager, 'service' => $service];
    }

    /** Cette methode cree un client avec un vehicule utilisable pour les rendez-vous. */
    public function clientWithVehicle(?string $email = null): array
    {
        $client = $this->user('ROLE_CLIENT', $email ?? 'client'.$this->next().'@garageflow.test');
        $vehicle = $this->vehicle($client);
        $this->entityManager->flush();

        return ['client' => $client, 'vehicle' => $vehicle];
    }

    /** Cette methode retourne une date future stable pour les tests de rendez-vous. */
    public function futureSlot(int $offsetHours = 0): \DateTimeImmutable
    {
        return (new \DateTimeImmutable('+40 days'))->setTime(9 + $offsetHours, 0);
    }

    /** Cette methode cree un role s'il n'existe pas encore. */
    private function role(string $code, string $label): Role
    {
        $role = $this->entityManager->getRepository(Role::class)->findOneBy(['code' => $code]);
        if (!$role instanceof Role) {
            $role = (new Role())->setCode($code)->setLibelle($label);
            $this->entityManager->persist($role);
        }

        return $role;
    }

    /** Cette methode cree un statut d'intervention s'il n'existe pas encore. */
    private function status(string $code, string $label, int $order): InterventionStatus
    {
        $status = $this->entityManager->getRepository(InterventionStatus::class)->findOneBy(['code' => $code]);
        if (!$status instanceof InterventionStatus) {
            $status = (new InterventionStatus())->setCode($code);
            $this->entityManager->persist($status);
        }

        $status->setLibelle($label)->setOrdreAffichage($order)->setVisibleClient(true);

        return $status;
    }

    /** Cette methode cree un garage actif minimal. */
    private function garage(): Garage
    {
        $suffix = $this->next();
        $garage = (new Garage())
            ->setNom('Garage Test '.$suffix)
            ->setAdresse('1 rue des Tests')
            ->setVille('Paris')
            ->setCodePostal('75000')
            ->setTelephone('0102030405')
            ->setEmail('garage'.$suffix.'@garageflow.test')
            ->setDescription('Garage de test')
            ->setActif(true);
        $this->entityManager->persist($garage);

        return $garage;
    }

    /** Cette methode cree un utilisateur avec un mot de passe connu. */
    public function user(string $roleCode, string $email, ?Garage $garage = null): User
    {
        $role = $this->entityManager->getRepository(Role::class)->findOneBy(['code' => $roleCode]);
        $user = (new User())
            ->setRole($role)
            ->setGarage($garage)
            ->setNom('Nom')
            ->setPrenom('Prenom')
            ->setEmail($email)
            ->setPassword(password_hash(self::DEFAULT_PASSWORD, PASSWORD_BCRYPT))
            ->setTelephone('0601020304')
            ->setActif(true);
        $this->entityManager->persist($user);

        return $user;
    }

    /** Cette methode cree une prestation active de trente minutes. */
    public function service(Garage $garage, int $duration = 30): ServicePrestation
    {
        $service = (new ServicePrestation())
            ->setGarage($garage)
            ->setNom('Diagnostic')
            ->setDescription('Prestation de test')
            ->setDureeMinutes($duration)
            ->setActif(true);
        $this->entityManager->persist($service);

        return $service;
    }

    /** Cette methode cree des horaires larges pour rendre les creneaux disponibles. */
    public function openingHours(Garage $garage): void
    {
        for ($day = 1; $day <= 7; ++$day) {
            $hour = (new OpeningHour())
                ->setGarage($garage)
                ->setJourSemaine($day)
                ->setHeureDebut(new \DateTimeImmutable('08:00:00'))
                ->setHeureFin(new \DateTimeImmutable('18:00:00'))
                ->setActif(true);
            $this->entityManager->persist($hour);
        }
    }

    /** Cette methode cree un vehicule rattache au client fourni. */
    public function vehicle(User $client, ?string $plate = null): Vehicle
    {
        $suffix = $this->next();
        $vehicle = (new Vehicle())
            ->setClient($client)
            ->setMarque('Renault')
            ->setModele('Clio')
            ->setPlaqueImmatriculation($plate ?? 'GF-'.$suffix)
            ->setKilometrage(10000)
            ->setAnnee(2020)
            ->setCarburant('Essence');
        $this->entityManager->persist($vehicle);

        return $vehicle;
    }

    /** Cette methode incremente un suffixe pour eviter les doublons dans les tests. */
    private function next(): int
    {
        return $this->counter++;
    }
}