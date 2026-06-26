<?php

/*
 * Ce fichier declare l'entite Unavailability du backend GarageFlow.
 * Il existe pour bloquer exceptionnellement un creneau ou une periode d'un garage.
 * Il communique avec Garage et User pour savoir quel garage est bloque et qui a cree le blocage.
 */

namespace App\Entity;

use App\Repository\UnavailabilityRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UnavailabilityRepository::class)]
#[ORM\Table(name: 'unavailability')]
#[ORM\Index(name: 'idx_unavailability_garage', columns: ['garage_id'])]
class Unavailability
{
    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'unavailabilities')] #[ORM\JoinColumn(nullable: false)] private ?Garage $garage = null;
    #[ORM\ManyToOne(inversedBy: 'createdUnavailabilities')] #[ORM\JoinColumn(nullable: true)] private ?User $createdBy = null;
    #[ORM\Column] private ?\DateTimeImmutable $dateDebut = null;
    #[ORM\Column] private ?\DateTimeImmutable $dateFin = null;
    #[ORM\Column(length: 255, nullable: true)] private ?string $motif = null;
    #[ORM\Column] private ?\DateTimeImmutable $createdAt = null;
    /** Cette methode initialise la date de creation de l'indisponibilite. */
    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }
    public function getId(): ?int { return $this->id; }
    public function getGarage(): ?Garage { return $this->garage; }
    public function setGarage(?Garage $garage): static { $this->garage = $garage; return $this; }
    public function getCreatedBy(): ?User { return $this->createdBy; }
    public function setCreatedBy(?User $createdBy): static { $this->createdBy = $createdBy; return $this; }
    public function getDateDebut(): ?\DateTimeImmutable { return $this->dateDebut; }
    public function setDateDebut(\DateTimeImmutable $dateDebut): static { $this->dateDebut = $dateDebut; return $this; }
    public function getDateFin(): ?\DateTimeImmutable { return $this->dateFin; }
    public function setDateFin(\DateTimeImmutable $dateFin): static { $this->dateFin = $dateFin; return $this; }
    public function getMotif(): ?string { return $this->motif; }
    public function setMotif(?string $motif): static { $this->motif = $motif; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
}