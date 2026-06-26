<?php

/*
 * Ce fichier declare l'entite Vehicle du backend GarageFlow.
 * Il existe pour stocker les vehicules appartenant aux clients.
 * Il communique avec User et Appointment pour rattacher un rendez-vous au bon vehicule.
 */

namespace App\Entity;

use App\Repository\VehicleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: VehicleRepository::class)]
#[ORM\Table(name: 'vehicle')]
#[ORM\UniqueConstraint(name: 'uniq_vehicle_client_plate', columns: ['client_id', 'plaque_immatriculation'])]
#[ORM\Index(name: 'idx_vehicle_client', columns: ['client_id'])]
class Vehicle
{
    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'vehicles')] #[ORM\JoinColumn(nullable: false)] private ?User $client = null;
    #[ORM\Column(length: 100)] private ?string $marque = null;
    #[ORM\Column(length: 100)] private ?string $modele = null;
    #[ORM\Column(length: 20)] private ?string $plaqueImmatriculation = null;
    #[ORM\Column(nullable: true)] private ?int $kilometrage = null;
    #[ORM\Column(nullable: true)] private ?int $annee = null;
    #[ORM\Column(length: 50, nullable: true)] private ?string $carburant = null;
    #[ORM\Column] private ?\DateTimeImmutable $createdAt = null;
    #[ORM\Column(nullable: true)] private ?\DateTimeImmutable $updatedAt = null;
    /** @var Collection<int, Appointment> */ #[ORM\OneToMany(mappedBy: 'vehicle', targetEntity: Appointment::class)] private Collection $appointments;
    /** Cette methode initialise les rendez-vous du vehicule et sa date de creation. */
    public function __construct() { $this->createdAt = new \DateTimeImmutable(); $this->appointments = new ArrayCollection(); }
    public function getId(): ?int { return $this->id; }
    public function getClient(): ?User { return $this->client; }
    public function setClient(?User $client): static { $this->client = $client; return $this; }
    public function getMarque(): ?string { return $this->marque; }
    public function setMarque(string $marque): static { $this->marque = $marque; return $this; }
    public function getModele(): ?string { return $this->modele; }
    public function setModele(string $modele): static { $this->modele = $modele; return $this; }
    public function getPlaqueImmatriculation(): ?string { return $this->plaqueImmatriculation; }
    public function setPlaqueImmatriculation(string $plaqueImmatriculation): static { $this->plaqueImmatriculation = $plaqueImmatriculation; return $this; }
    public function getKilometrage(): ?int { return $this->kilometrage; }
    public function setKilometrage(?int $kilometrage): static { $this->kilometrage = $kilometrage; return $this; }
    public function getAnnee(): ?int { return $this->annee; }
    public function setAnnee(?int $annee): static { $this->annee = $annee; return $this; }
    public function getCarburant(): ?string { return $this->carburant; }
    public function setCarburant(?string $carburant): static { $this->carburant = $carburant; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }
    public function getAppointments(): Collection { return $this->appointments; }
    public function addAppointment(Appointment $appointment): static { if (!$this->appointments->contains($appointment)) { $this->appointments->add($appointment); $appointment->setVehicle($this); } return $this; }
    public function removeAppointment(Appointment $appointment): static { if ($this->appointments->removeElement($appointment) && $appointment->getVehicle() === $this) { $appointment->setVehicle(null); } return $this; }
}