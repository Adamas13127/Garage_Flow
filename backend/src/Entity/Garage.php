<?php

/*
 * Ce fichier declare l'entite Garage du backend GarageFlow.
 * Il existe pour representer un garage independant inscrit sur la plateforme.
 * Il communique avec les utilisateurs, horaires, prestations, rendez-vous et logs du garage.
 */

namespace App\Entity;

use App\Repository\GarageRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GarageRepository::class)]
#[ORM\Table(name: 'garage')]
class Garage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;
    #[ORM\Column(length: 150)] private ?string $nom = null;
    #[ORM\Column(length: 255)] private ?string $adresse = null;
    #[ORM\Column(length: 100)] private ?string $ville = null;
    #[ORM\Column(length: 20)] private ?string $codePostal = null;
    #[ORM\Column(length: 30, nullable: true)] private ?string $telephone = null;
    #[ORM\Column(length: 180, nullable: true)] private ?string $email = null;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;
    #[ORM\Column(length: 255, nullable: true)] private ?string $logoUrl = null;
    #[ORM\Column(options: ['default' => true])] private bool $actif = true;
    #[ORM\Column] private ?\DateTimeImmutable $createdAt = null;
    #[ORM\Column(nullable: true)] private ?\DateTimeImmutable $updatedAt = null;

    /** @var Collection<int, User> */ #[ORM\OneToMany(mappedBy: 'garage', targetEntity: User::class)] private Collection $users;
    /** @var Collection<int, OpeningHour> */ #[ORM\OneToMany(mappedBy: 'garage', targetEntity: OpeningHour::class, orphanRemoval: true)] private Collection $openingHours;
    /** @var Collection<int, Unavailability> */ #[ORM\OneToMany(mappedBy: 'garage', targetEntity: Unavailability::class, orphanRemoval: true)] private Collection $unavailabilities;
    /** @var Collection<int, ServicePrestation> */ #[ORM\OneToMany(mappedBy: 'garage', targetEntity: ServicePrestation::class, orphanRemoval: true)] private Collection $servicePrestations;
    /** @var Collection<int, Appointment> */ #[ORM\OneToMany(mappedBy: 'garage', targetEntity: Appointment::class)] private Collection $appointments;
    /** @var Collection<int, ActionLog> */ #[ORM\OneToMany(mappedBy: 'garage', targetEntity: ActionLog::class)] private Collection $actionLogs;

    /** Cette methode initialise les collections du garage et sa date de creation. */
    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->users = new ArrayCollection();
        $this->openingHours = new ArrayCollection();
        $this->unavailabilities = new ArrayCollection();
        $this->servicePrestations = new ArrayCollection();
        $this->appointments = new ArrayCollection();
        $this->actionLogs = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }
    public function getAdresse(): ?string { return $this->adresse; }
    public function setAdresse(string $adresse): static { $this->adresse = $adresse; return $this; }
    public function getVille(): ?string { return $this->ville; }
    public function setVille(string $ville): static { $this->ville = $ville; return $this; }
    public function getCodePostal(): ?string { return $this->codePostal; }
    public function setCodePostal(string $codePostal): static { $this->codePostal = $codePostal; return $this; }
    public function getTelephone(): ?string { return $this->telephone; }
    public function setTelephone(?string $telephone): static { $this->telephone = $telephone; return $this; }
    public function getEmail(): ?string { return $this->email; }
    public function setEmail(?string $email): static { $this->email = $email; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }
    public function getLogoUrl(): ?string { return $this->logoUrl; }
    public function setLogoUrl(?string $logoUrl): static { $this->logoUrl = $logoUrl; return $this; }
    public function isActif(): bool { return $this->actif; }
    public function setActif(bool $actif): static { $this->actif = $actif; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }
    public function getUsers(): Collection { return $this->users; }
    public function addUser(User $user): static { if (!$this->users->contains($user)) { $this->users->add($user); $user->setGarage($this); } return $this; }
    public function removeUser(User $user): static { if ($this->users->removeElement($user) && $user->getGarage() === $this) { $user->setGarage(null); } return $this; }
    public function getOpeningHours(): Collection { return $this->openingHours; }
    public function addOpeningHour(OpeningHour $openingHour): static { if (!$this->openingHours->contains($openingHour)) { $this->openingHours->add($openingHour); $openingHour->setGarage($this); } return $this; }
    public function removeOpeningHour(OpeningHour $openingHour): static { if ($this->openingHours->removeElement($openingHour) && $openingHour->getGarage() === $this) { $openingHour->setGarage(null); } return $this; }
    public function getUnavailabilities(): Collection { return $this->unavailabilities; }
    public function addUnavailability(Unavailability $unavailability): static { if (!$this->unavailabilities->contains($unavailability)) { $this->unavailabilities->add($unavailability); $unavailability->setGarage($this); } return $this; }
    public function removeUnavailability(Unavailability $unavailability): static { if ($this->unavailabilities->removeElement($unavailability) && $unavailability->getGarage() === $this) { $unavailability->setGarage(null); } return $this; }
    public function getServicePrestations(): Collection { return $this->servicePrestations; }
    public function addServicePrestation(ServicePrestation $servicePrestation): static { if (!$this->servicePrestations->contains($servicePrestation)) { $this->servicePrestations->add($servicePrestation); $servicePrestation->setGarage($this); } return $this; }
    public function removeServicePrestation(ServicePrestation $servicePrestation): static { if ($this->servicePrestations->removeElement($servicePrestation) && $servicePrestation->getGarage() === $this) { $servicePrestation->setGarage(null); } return $this; }
    public function getAppointments(): Collection { return $this->appointments; }
    public function addAppointment(Appointment $appointment): static { if (!$this->appointments->contains($appointment)) { $this->appointments->add($appointment); $appointment->setGarage($this); } return $this; }
    public function removeAppointment(Appointment $appointment): static { if ($this->appointments->removeElement($appointment) && $appointment->getGarage() === $this) { $appointment->setGarage(null); } return $this; }
    public function getActionLogs(): Collection { return $this->actionLogs; }
    public function addActionLog(ActionLog $actionLog): static { if (!$this->actionLogs->contains($actionLog)) { $this->actionLogs->add($actionLog); $actionLog->setGarage($this); } return $this; }
    public function removeActionLog(ActionLog $actionLog): static { if ($this->actionLogs->removeElement($actionLog) && $actionLog->getGarage() === $this) { $actionLog->setGarage(null); } return $this; }
}