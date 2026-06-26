<?php

/*
 * Ce fichier declare l'entite ActionLog du backend GarageFlow.
 * Il existe pour journaliser les actions importantes realisees dans l'application.
 * Il communique avec User et Garage pour garder la trace de qui a agi et sur quel garage.
 */

namespace App\Entity;

use App\Repository\ActionLogRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ActionLogRepository::class)]
#[ORM\Table(name: 'action_log')]
#[ORM\Index(name: 'idx_action_log_garage', columns: ['garage_id'])]
class ActionLog
{
    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'actionLogs')] #[ORM\JoinColumn(nullable: true)] private ?User $user = null;
    #[ORM\ManyToOne(inversedBy: 'actionLogs')] #[ORM\JoinColumn(nullable: true)] private ?Garage $garage = null;
    #[ORM\Column(length: 150)] private ?string $action = null;
    #[ORM\Column(length: 100, nullable: true)] private ?string $entiteConcernee = null;
    #[ORM\Column(nullable: true)] private ?int $idEntiteConcernee = null;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $description = null;
    #[ORM\Column] private ?\DateTimeImmutable $createdAt = null;
    /** Cette methode initialise la date de creation du log d'action. */
    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }
    public function getId(): ?int { return $this->id; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }
    public function getGarage(): ?Garage { return $this->garage; }
    public function setGarage(?Garage $garage): static { $this->garage = $garage; return $this; }
    public function getAction(): ?string { return $this->action; }
    public function setAction(string $action): static { $this->action = $action; return $this; }
    public function getEntiteConcernee(): ?string { return $this->entiteConcernee; }
    public function setEntiteConcernee(?string $entiteConcernee): static { $this->entiteConcernee = $entiteConcernee; return $this; }
    public function getIdEntiteConcernee(): ?int { return $this->idEntiteConcernee; }
    public function setIdEntiteConcernee(?int $idEntiteConcernee): static { $this->idEntiteConcernee = $idEntiteConcernee; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
}