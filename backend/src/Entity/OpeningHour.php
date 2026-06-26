<?php

/*
 * Ce fichier declare l'entite OpeningHour du backend GarageFlow.
 * Il existe pour stocker les plages horaires recurrentes d'un garage.
 * Il communique avec Garage pour calculer plus tard les creneaux disponibles.
 */

namespace App\Entity;

use App\Repository\OpeningHourRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OpeningHourRepository::class)]
#[ORM\Table(name: 'opening_hour')]
#[ORM\Index(name: 'idx_opening_hour_garage', columns: ['garage_id'])]
class OpeningHour
{
    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'openingHours')] #[ORM\JoinColumn(nullable: false)] private ?Garage $garage = null;
    #[ORM\Column(type: 'smallint')] private ?int $jourSemaine = null;
    #[ORM\Column(type: 'time_immutable')] private ?\DateTimeImmutable $heureDebut = null;
    #[ORM\Column(type: 'time_immutable')] private ?\DateTimeImmutable $heureFin = null;
    #[ORM\Column(options: ['default' => true])] private bool $actif = true;
    public function getId(): ?int { return $this->id; }
    public function getGarage(): ?Garage { return $this->garage; }
    public function setGarage(?Garage $garage): static { $this->garage = $garage; return $this; }
    public function getJourSemaine(): ?int { return $this->jourSemaine; }
    public function setJourSemaine(int $jourSemaine): static { $this->jourSemaine = $jourSemaine; return $this; }
    public function getHeureDebut(): ?\DateTimeImmutable { return $this->heureDebut; }
    public function setHeureDebut(\DateTimeImmutable $heureDebut): static { $this->heureDebut = $heureDebut; return $this; }
    public function getHeureFin(): ?\DateTimeImmutable { return $this->heureFin; }
    public function setHeureFin(\DateTimeImmutable $heureFin): static { $this->heureFin = $heureFin; return $this; }
    public function isActif(): bool { return $this->actif; }
    public function setActif(bool $actif): static { $this->actif = $actif; return $this; }
}