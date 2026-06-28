<?php

/*
 * Ce fichier declare une commande Symfony de demonstration pour GarageFlow.
 * Il existe pour creer localement un garage et un gerant de test afin de verifier les routes protegees.
 * Il communique avec Doctrine, User, Role, Garage et le service de hashage des mots de passe.
 */

namespace App\Command;

use App\Entity\Garage;
use App\Entity\Role;
use App\Entity\User;
use App\Repository\RoleRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/** Cette commande prepare uniquement des donnees locales pour tester les endpoints garage. */
#[AsCommand(
    name: 'app:create-demo-garage',
    description: 'Cree un garage et un gerant de demonstration pour les tests locaux.'
)]
class CreateDemoGarageCommand extends Command
{
    private const DEMO_EMAIL = 'gerant.demo@garageflow.local';
    private const DEMO_PASSWORD = 'Password123';

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly RoleRepository $roleRepository,
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    /** Cette methode cree ou reutilise les donnees de demonstration sans les dupliquer. */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $role = $this->getOrCreateManagerRole();
        $garage = $this->getOrCreateDemoGarage();
        $user = $this->getOrCreateManagerUser($role, $garage);

        $this->entityManager->flush();

        $io->success('Garage et gerant de demonstration prets.');
        $io->writeln('Email : '.$user->getEmail());
        $io->writeln('Mot de passe local : '.self::DEMO_PASSWORD);
        $io->writeln('Garage : '.$garage->getNom());

        return Command::SUCCESS;
    }

    /** Cette methode cree le role gerant si les fixtures ne l'ont pas encore charge. */
    private function getOrCreateManagerRole(): Role
    {
        $role = $this->roleRepository->findOneBy(['code' => 'ROLE_GERANT']);
        if ($role instanceof Role) {
            return $role;
        }

        $role = new Role();
        $role->setCode('ROLE_GERANT');
        $role->setLibelle('Gerant de garage');
        $this->entityManager->persist($role);

        return $role;
    }

    /** Cette methode cree un garage actif minimal pour tester le back-office garage. */
    private function getOrCreateDemoGarage(): Garage
    {
        $garage = $this->entityManager->getRepository(Garage::class)->findOneBy(['email' => 'demo.garage@garageflow.local']);
        if ($garage instanceof Garage) {
            return $garage;
        }

        $garage = new Garage();
        $garage
            ->setNom('Garage Demo GarageFlow')
            ->setAdresse('1 rue de la Demo')
            ->setVille('Paris')
            ->setCodePostal('75000')
            ->setTelephone('0102030405')
            ->setEmail('demo.garage@garageflow.local')
            ->setDescription('Garage local cree pour tester les endpoints de gestion.')
            ->setActif(true);

        $this->entityManager->persist($garage);

        return $garage;
    }

    /** Cette methode cree ou rattache le compte gerant au garage de demonstration. */
    private function getOrCreateManagerUser(Role $role, Garage $garage): User
    {
        $user = $this->userRepository->findOneBy(['email' => self::DEMO_EMAIL]);
        if ($user instanceof User) {
            $user->setRole($role);
            $user->setGarage($garage);
            $user->setActif(true);
            return $user;
        }

        $user = new User();
        $user
            ->setNom('Demo')
            ->setPrenom('Gerant')
            ->setEmail(self::DEMO_EMAIL)
            ->setTelephone('0600000000')
            ->setRole($role)
            ->setGarage($garage)
            ->setActif(true);

        $user->setPassword($this->passwordHasher->hashPassword($user, self::DEMO_PASSWORD));
        $this->entityManager->persist($user);

        return $user;
    }
}
