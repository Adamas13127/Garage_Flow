<?php

/*
 * Ce fichier declare la commande de donnees de demonstration completes de GarageFlow.
 * Il existe pour remplir une base locale avec un scenario coherent pour le jury.
 * Il communique avec Doctrine, les entites metier et le hashage des mots de passe Symfony.
 */

namespace App\Command;

use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\InternalNote;
use App\Entity\Intervention;
use App\Entity\InterventionStatus;
use App\Entity\InterventionStatusHistory;
use App\Entity\Notification;
use App\Entity\OpeningHour;
use App\Entity\Role;
use App\Entity\ServicePrestation;
use App\Entity\User;
use App\Entity\Vehicle;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/** Cette commande prepare un jeu de donnees local complet pour presenter le MVP GarageFlow. */
#[AsCommand(
    name: 'app:create-demo-data',
    description: 'Cree des donnees de demonstration realistes pour le jury.'
)]
class CreateDemoDataCommand extends Command
{
    private const DEMO_PASSWORD = 'Password123';
    private const GARAGE_EMAIL = 'demo.garage@garageflow.local';
    private const GARAGE_NAME = 'Garage Demo GarageFlow';

    /** @var array<string, int> */
    private array $created = [];

    /** @var array<string, int> */
    private array $reused = [];

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    /** Cette methode orchestre la creation idempotente du scenario de demonstration. */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $this->created = [];
        $this->reused = [];

        $roles = $this->ensureRoles();
        $statuses = $this->ensureInterventionStatuses();
        $garage = $this->getOrCreateGarage();
        $manager = $this->getOrCreateUser('gerant.demo@garageflow.local', 'Demo', 'Gerant', $roles['ROLE_GERANT'], $garage);
        $employee = $this->getOrCreateUser('employe.demo@garageflow.local', 'Demo', 'Employe', $roles['ROLE_EMPLOYE'], $garage);
        $client = $this->getOrCreateUser('client.demo@garageflow.local', 'Client', 'Demo', $roles['ROLE_CLIENT'], null);
        $services = $this->ensureServices($garage);
        $this->ensureOpeningHours($garage);
        $vehicles = $this->ensureVehicles($client);
        $appointments = $this->ensureAppointments($garage, $client, $vehicles, $services);
        $interventions = $this->ensureInterventions($appointments, $statuses, $employee);
        $this->ensureInternalNotes($interventions, $employee);
        $this->ensureNotifications($manager, $client, $appointments, $interventions);

        $this->entityManager->flush();
        $this->printSummary($io, $garage, $manager, $employee, $client, $vehicles, $services, $appointments, $interventions);

        return Command::SUCCESS;
    }

    /** Cette methode cree les roles si la base locale n'a pas encore recu les fixtures. */
    private function ensureRoles(): array
    {
        $definitions = [
            'ROLE_ADMIN' => 'Administrateur plateforme',
            'ROLE_GERANT' => 'Gerant de garage',
            'ROLE_EMPLOYE' => 'Employe de garage',
            'ROLE_CLIENT' => 'Client',
        ];
        $roles = [];
        foreach ($definitions as $code => $label) {
            $role = $this->entityManager->getRepository(Role::class)->findOneBy(['code' => $code]);
            if (!$role instanceof Role) {
                $role = (new Role())->setCode($code);
                $this->entityManager->persist($role);
                $this->markCreated('roles');
            } else {
                $this->markReused('roles');
            }
            $role->setLibelle($label);
            $roles[$code] = $role;
        }

        return $roles;
    }

    /** Cette methode garantit que les statuts de suivi atelier existent pour les interventions demo. */
    private function ensureInterventionStatuses(): array
    {
        $definitions = [
            'VEHICULE_DEPOSE' => ['Vehicule depose', 1],
            'DIAGNOSTIC_EN_COURS' => ['Diagnostic en cours', 2],
            'ATTENTE_VALIDATION_CLIENT' => ['Attente validation client', 3],
            'REPARATION_EN_COURS' => ['Reparation en cours', 4],
            'VEHICULE_PRET' => ['Vehicule pret', 5],
            'VEHICULE_RECUPERE' => ['Vehicule recupere', 6],
        ];
        $statuses = [];
        foreach ($definitions as $code => [$label, $order]) {
            $status = $this->entityManager->getRepository(InterventionStatus::class)->findOneBy(['code' => $code]);
            if (!$status instanceof InterventionStatus) {
                $status = (new InterventionStatus())->setCode($code);
                $this->entityManager->persist($status);
                $this->markCreated('statuts intervention');
            } else {
                $this->markReused('statuts intervention');
            }
            $status->setLibelle($label)->setOrdreAffichage($order)->setVisibleClient(true);
            $statuses[$code] = $status;
        }

        return $statuses;
    }

    /** Cette methode cree ou remet a jour le garage utilise pendant la demonstration. */
    private function getOrCreateGarage(): Garage
    {
        $garage = $this->entityManager->getRepository(Garage::class)->findOneBy(['email' => self::GARAGE_EMAIL]);
        if (!$garage instanceof Garage) {
            $garage = new Garage();
            $this->entityManager->persist($garage);
            $this->markCreated('garages');
        } else {
            $this->markReused('garages');
        }

        $garage
            ->setNom(self::GARAGE_NAME)
            ->setAdresse('1 rue de la Demo')
            ->setVille('Paris')
            ->setCodePostal('75000')
            ->setTelephone('0102030405')
            ->setEmail(self::GARAGE_EMAIL)
            ->setDescription('Garage de demonstration pour le jury')
            ->setActif(true);

        return $garage;
    }

    /** Cette methode cree ou reutilise un compte de demonstration avec le bon role et garage. */
    private function getOrCreateUser(string $email, string $nom, string $prenom, Role $role, ?Garage $garage): User
    {
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user instanceof User) {
            $user = (new User())->setEmail($email);
            $this->entityManager->persist($user);
            $this->markCreated('utilisateurs');
        } else {
            $this->markReused('utilisateurs');
        }

        $user
            ->setNom($nom)
            ->setPrenom($prenom)
            ->setRole($role)
            ->setGarage($garage)
            ->setTelephone('0600000000')
            ->setActif(true);
        $user->setPassword($this->passwordHasher->hashPassword($user, self::DEMO_PASSWORD));

        return $user;
    }

    /** Cette methode cree les prestations actives visibles dans le dashboard garage. */
    private function ensureServices(Garage $garage): array
    {
        $definitions = [
            'Vidange moteur' => 60,
            'Diagnostic electronique' => 45,
            'Remplacement plaquettes de frein' => 90,
            'Revision complete' => 120,
            'Controle climatisation' => 60,
        ];
        $services = [];
        foreach ($definitions as $name => $duration) {
            $service = $this->entityManager->getRepository(ServicePrestation::class)->findOneBy(['garage' => $garage, 'nom' => $name]);
            if (!$service instanceof ServicePrestation) {
                $service = (new ServicePrestation())->setGarage($garage)->setNom($name);
                $this->entityManager->persist($service);
                $this->markCreated('prestations');
            } else {
                $this->markReused('prestations');
            }
            $service->setDescription($name.' propose par le garage de demonstration.')->setDureeMinutes($duration)->setActif(true);
            $services[$name] = $service;
        }

        return $services;
    }

    /** Cette methode cree ou corrige les horaires recurrentes du garage de demonstration. */
    private function ensureOpeningHours(Garage $garage): void
    {
        $definitions = [1 => ['09:00', '18:00'], 2 => ['09:00', '18:00'], 3 => ['09:00', '18:00'], 4 => ['09:00', '18:00'], 5 => ['09:00', '17:00'], 6 => ['09:00', '13:00']];
        foreach ($definitions as $day => [$start, $end]) {
            $hour = $this->entityManager->getRepository(OpeningHour::class)->findOneBy(['garage' => $garage, 'jourSemaine' => $day]);
            if (!$hour instanceof OpeningHour) {
                $hour = (new OpeningHour())->setGarage($garage)->setJourSemaine($day);
                $this->entityManager->persist($hour);
                $this->markCreated('horaires');
            } else {
                $this->markReused('horaires');
            }
            $hour->setHeureDebut(new \DateTimeImmutable($start))->setHeureFin(new \DateTimeImmutable($end))->setActif(true);
        }
    }

    /** Cette methode cree les vehicules du compte client de demonstration. */
    private function ensureVehicles(User $client): array
    {
        $definitions = [
            'AA-123-AA' => ['Renault', 'Clio IV', 84500, 2018, 'Essence'],
            'BB-456-BB' => ['Peugeot', '308', 126000, 2017, 'Diesel'],
        ];
        $vehicles = [];
        foreach ($definitions as $plate => [$brand, $model, $mileage, $year, $fuel]) {
            $vehicle = $this->entityManager->getRepository(Vehicle::class)->findOneBy(['client' => $client, 'plaqueImmatriculation' => $plate]);
            if (!$vehicle instanceof Vehicle) {
                $vehicle = (new Vehicle())->setClient($client)->setPlaqueImmatriculation($plate);
                $this->entityManager->persist($vehicle);
                $this->markCreated('vehicules');
            } else {
                $this->markReused('vehicules');
            }
            $vehicle->setMarque($brand)->setModele($model)->setKilometrage($mileage)->setAnnee($year)->setCarburant($fuel);
            $vehicles[$plate] = $vehicle;
        }

        return $vehicles;
    }

    /** Cette methode cree des rendez-vous coherents avec les horaires du garage. */
    private function ensureAppointments(Garage $garage, User $client, array $vehicles, array $services): array
    {
        $definitions = [
            'attente_vidange' => [Appointment::STATUT_EN_ATTENTE, '2030-01-14 09:00', $vehicles['AA-123-AA'], $services['Vidange moteur'], 'Demande de vidange avant depart.'],
            'attente_clim' => [Appointment::STATUT_EN_ATTENTE, '2030-01-15 10:30', $vehicles['BB-456-BB'], $services['Controle climatisation'], 'Controle climatisation avant ete.'],
            'confirme_diag' => [Appointment::STATUT_CONFIRME, '2030-01-16 09:00', $vehicles['AA-123-AA'], $services['Diagnostic electronique'], 'Voyant moteur allume.'],
            'confirme_freins' => [Appointment::STATUT_CONFIRME, '2030-01-17 10:00', $vehicles['BB-456-BB'], $services['Remplacement plaquettes de frein'], 'Bruit au freinage.'],
            'confirme_revision' => [Appointment::STATUT_CONFIRME, '2030-01-18 09:00', $vehicles['AA-123-AA'], $services['Revision complete'], 'Revision complete avant controle technique.'],
            'refuse_clim' => [Appointment::STATUT_REFUSE, '2030-01-20 11:00', $vehicles['BB-456-BB'], $services['Controle climatisation'], 'Creneau refuse pour demonstration.'],
            'annule_vidange' => [Appointment::STATUT_ANNULE, '2030-01-21 14:00', $vehicles['AA-123-AA'], $services['Vidange moteur'], 'Client indisponible.'],
            'termine_diag' => [Appointment::STATUT_TERMINE, '2030-01-22 09:00', $vehicles['BB-456-BB'], $services['Diagnostic electronique'], 'Diagnostic termine pour historique.'],
        ];
        $appointments = [];
        foreach ($definitions as $key => [$status, $date, $vehicle, $service, $comment]) {
            $start = new \DateTimeImmutable($date);
            $end = $start->modify('+'.$service->getDureeMinutes().' minutes');
            $appointment = $this->entityManager->getRepository(Appointment::class)->findOneBy(['garage' => $garage, 'client' => $client, 'vehicle' => $vehicle, 'service' => $service, 'dateDebut' => $start]);
            if (!$appointment instanceof Appointment) {
                $appointment = (new Appointment())->setGarage($garage)->setClient($client)->setVehicle($vehicle)->setService($service)->setDateDebut($start);
                $this->entityManager->persist($appointment);
                $this->markCreated('rendez-vous');
            } else {
                $this->markReused('rendez-vous');
            }
            $appointment->setDateFin($end)->setStatut($status)->setCommentaireClient($comment);
            $appointments[$key] = $appointment;
        }

        return $appointments;
    }

    /** Cette methode cree les interventions et leurs historiques de statut. */
    private function ensureInterventions(array $appointments, array $statuses, User $employee): array
    {
        $definitions = [
            'diagnostic' => [$appointments['confirme_diag'], 'DIAGNOSTIC_EN_COURS', ['VEHICULE_DEPOSE', 'DIAGNOSTIC_EN_COURS']],
            'reparation' => [$appointments['confirme_freins'], 'REPARATION_EN_COURS', ['VEHICULE_DEPOSE', 'DIAGNOSTIC_EN_COURS', 'ATTENTE_VALIDATION_CLIENT', 'REPARATION_EN_COURS']],
            'pret' => [$appointments['confirme_revision'], 'VEHICULE_PRET', ['VEHICULE_DEPOSE', 'DIAGNOSTIC_EN_COURS', 'REPARATION_EN_COURS', 'VEHICULE_PRET']],
            'termine' => [$appointments['termine_diag'], 'VEHICULE_RECUPERE', ['VEHICULE_DEPOSE', 'DIAGNOSTIC_EN_COURS', 'REPARATION_EN_COURS', 'VEHICULE_PRET', 'VEHICULE_RECUPERE']],
        ];
        $interventions = [];
        foreach ($definitions as $key => [$appointment, $currentCode, $historyCodes]) {
            $intervention = $appointment->getIntervention();
            if (!$intervention instanceof Intervention) {
                $intervention = $this->entityManager->getRepository(Intervention::class)->findOneBy(['appointment' => $appointment]);
            }
            if (!$intervention instanceof Intervention) {
                $intervention = (new Intervention())->setAppointment($appointment);
                $appointment->setIntervention($intervention);
                $this->entityManager->persist($intervention);
                $this->markCreated('interventions');
            } else {
                $this->markReused('interventions');
            }
            $intervention->setStatutActuel($statuses[$currentCode])->setNotesResume('Intervention de demonstration GarageFlow.');
            if ($currentCode === 'VEHICULE_RECUPERE') {
                $intervention->setClosedAt(new \DateTimeImmutable('2030-01-22 16:00'));
            }
            $this->ensureStatusHistory($intervention, $historyCodes, $statuses, $employee);
            $interventions[$key] = $intervention;
        }

        return $interventions;
    }

    /** Cette methode ajoute les lignes d'historique manquantes sans les dupliquer. */
    private function ensureStatusHistory(Intervention $intervention, array $historyCodes, array $statuses, User $employee): void
    {
        foreach ($historyCodes as $index => $code) {
            $history = $this->entityManager->getRepository(InterventionStatusHistory::class)->findOneBy(['intervention' => $intervention, 'status' => $statuses[$code]]);
            if (!$history instanceof InterventionStatusHistory) {
                $history = (new InterventionStatusHistory())->setIntervention($intervention)->setStatus($statuses[$code]);
                $this->entityManager->persist($history);
                $this->markCreated('historiques statut');
            } else {
                $this->markReused('historiques statut');
            }
            $history->setChangedBy($employee)->setChangedAt((new \DateTimeImmutable('2030-01-10 09:00'))->modify('+'.$index.' hours'))->setCommentaire('Etape '.$statuses[$code]->getLibelle().' creee pour la demonstration.');
        }
    }

    /** Cette methode cree des notes internes uniquement visibles par le garage. */
    private function ensureInternalNotes(array $interventions, User $employee): void
    {
        $definitions = [
            [$interventions['diagnostic'], 'Client signale un bruit au freinage.'],
            [$interventions['reparation'], 'Prevoir verification des plaquettes avant restitution.'],
            [$interventions['pret'], 'Devis valide oralement pendant la demonstration.'],
        ];
        foreach ($definitions as [$intervention, $content]) {
            $note = $this->entityManager->getRepository(InternalNote::class)->findOneBy(['intervention' => $intervention, 'contenu' => $content]);
            if (!$note instanceof InternalNote) {
                $note = (new InternalNote())->setIntervention($intervention)->setContenu($content);
                $this->entityManager->persist($note);
                $this->markCreated('notes internes');
            } else {
                $this->markReused('notes internes');
            }
            $note->setAuthor($employee);
        }
    }

    /** Cette methode cree des notifications visibles dans les compteurs web et mobile. */
    private function ensureNotifications(User $manager, User $client, array $appointments, array $interventions): void
    {
        $definitions = [
            [$manager, Notification::TYPE_RDV_DEMANDE, 'Nouvelle demande de rendez-vous pour une vidange moteur.', $appointments['attente_vidange'], null, false],
            [$manager, Notification::TYPE_RDV_ANNULE, 'Un client a annule un rendez-vous de demonstration.', $appointments['annule_vidange'], null, false],
            [$client, Notification::TYPE_RDV_ACCEPTE, 'Votre rendez-vous diagnostic electronique a ete accepte.', $appointments['confirme_diag'], null, false],
            [$client, Notification::TYPE_STATUT_INTERVENTION_CHANGE, 'Le diagnostic de votre vehicule est en cours.', $appointments['confirme_diag'], $interventions['diagnostic'], false],
            [$client, Notification::TYPE_VEHICULE_PRET, 'Votre vehicule est pret a etre recupere.', $appointments['confirme_revision'], $interventions['pret'], false],
            [$client, Notification::TYPE_STATUT_INTERVENTION_CHANGE, 'Rappel de suivi : consultez les etapes de votre reparation.', $appointments['confirme_freins'], $interventions['reparation'], true],
        ];
        foreach ($definitions as [$recipient, $type, $content, $appointment, $intervention, $read]) {
            $notification = $this->entityManager->getRepository(Notification::class)->findOneBy(['recipient' => $recipient, 'type' => $type, 'contenu' => $content]);
            if (!$notification instanceof Notification) {
                $notification = (new Notification())->setRecipient($recipient)->setType($type)->setContenu($content);
                $this->entityManager->persist($notification);
                $this->markCreated('notifications');
            } else {
                $this->markReused('notifications');
            }
            $notification->setCanal(Notification::CANAL_APP)->setAppointment($appointment)->setIntervention($intervention)->setLu($read)->setReadAt($read ? new \DateTimeImmutable('2030-01-12 12:00') : null);
        }
    }

    /** Cette methode affiche un resume lisible pour guider la demonstration locale. */
    private function printSummary(SymfonyStyle $io, Garage $garage, User $manager, User $employee, User $client, array $vehicles, array $services, array $appointments, array $interventions): void
    {
        $io->success('Donnees de demonstration GarageFlow pretes.');
        $io->section('Resume idempotent');
        foreach (array_unique(array_merge(array_keys($this->created), array_keys($this->reused))) as $label) {
            $io->writeln(sprintf('- %s : %d cree(s), %d reutilise(s)', $label, $this->created[$label] ?? 0, $this->reused[$label] ?? 0));
        }
        $io->section('Connexion');
        $io->listing([
            'Gerant : '.$manager->getEmail().' / '.self::DEMO_PASSWORD,
            'Employe : '.$employee->getEmail().' / '.self::DEMO_PASSWORD,
            'Client : '.$client->getEmail().' / '.self::DEMO_PASSWORD,
        ]);
        $io->section('Donnees principales');
        $io->writeln('Garage : '.$garage->getNom());
        $io->writeln('Vehicules : '.implode(', ', array_keys($vehicles)));
        $io->writeln('Prestations : '.implode(', ', array_keys($services)));
        $io->writeln('Rendez-vous : '.count($appointments));
        $io->writeln('Interventions : '.count($interventions));
        $io->writeln('Commande : php bin/console app:create-demo-data');
    }

    /** Cette methode incremente le compteur de creation affiche dans le resume. */
    private function markCreated(string $label): void { $this->created[$label] = ($this->created[$label] ?? 0) + 1; }

    /** Cette methode incremente le compteur de reutilisation affiche dans le resume. */
    private function markReused(string $label): void { $this->reused[$label] = ($this->reused[$label] ?? 0) + 1; }
}