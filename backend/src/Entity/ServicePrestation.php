<?php

/*
 * Ce fichier declare l'entite ServicePrestation du backend GarageFlow.
 * Il existe pour representer les prestations proposees par un garage sans confondre avec les services Symfony.
 * Il communique avec Garage et Appointment pour relier une demande de rendez-vous a une prestation.
 */

namespace App\Entity;

use App\Repository\ServicePrestationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ServicePrestationRepository::class)]
#[ORM\Table(name: 'service_prestation')]
#[ORM\Index(name: 'idx_service_prestation_garage', columns: ['garage_id'])]
class ServicePrestation
{
    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'servicePrestations')] #[ORM\JoinColumn(nullable: false)] private ?Garage $garage = null;
    #[ORM\Column(length: 150)] private ?string $nom = null;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;
    #[ORM\Column] private ?int $dureeMinutes = null;
    #[ORM\Column(options: ['default' => true])] private bool $actif = true;
    #[ORM\Column] private ?\DateTimeImmutable $createdAt = null;
    #[ORM\Column(nullable: true)] private ?\DateTimeImmutable $updatedAt = null;
    /** @var Collection<int, Appointment> */ #[ORM\OneToMany(mappedBy: 'service', targetEntity: Appointment::class)] private Collection $appointments;
    /** Cette methode initialise les rendez-vous lies et la date de creation. */
    public function __construct() { $this->createdAt = new \DateTimeImmutable(); $this->appointments = new ArrayCollection(); }
    public function getId(): ?int { return $this->id; }
    public function getGarage(): ?Garage { return $this->garage; }
    public function setGarage(?Garage $garage): static { $this->garage = $garage; return $this; }
    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }
    public function getDureeMinutes(): ?int { return $this->dureeMinutes; }
    public function setDureeMinutes(int $dureeMinutes): static { $this->dureeMinutes = $dureeMinutes; return $this; }
    public function isActif(): bool { return $this->actif; }
    public function setActif(bool $actif): static { $this->actif = $actif; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }
    public function getAppointments(): Collection { return $this->appointments; }
    public function addAppointment(Appointment $appointment): static { if (!$this->appointments->contains($appointment)) { $this->appointments->add($appointment); $appointment->setService($this); } return $this; }
    public function removeAppointment(Appointment $appointment): static { if ($this->appointments->removeElement($appointment) && $appointment->getService() === $this) { $appointment->setService(null); } return $this; }
}