<?php

/*
 * Ce fichier declare l'entite InterventionStatusHistory du backend GarageFlow.
 * Il existe pour garder une trace de chaque changement de statut d'une intervention.
 * Il communique avec Intervention, InterventionStatus et User pour savoir quoi, quand et par qui.
 */

namespace App\Entity;

use App\Repository\InterventionStatusHistoryRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InterventionStatusHistoryRepository::class)]
#[ORM\Table(name: 'intervention_status_history')]
#[ORM\Index(name: 'idx_intervention_status_history_intervention', columns: ['intervention_id'])]
class InterventionStatusHistory
{
    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'statusHistories')] #[ORM\JoinColumn(nullable: false)] private ?Intervention $intervention = null;
    #[ORM\ManyToOne(inversedBy: 'histories')] #[ORM\JoinColumn(nullable: false)] private ?InterventionStatus $status = null;
    #[ORM\ManyToOne(inversedBy: 'interventionStatusHistories')] #[ORM\JoinColumn(nullable: false)] private ?User $changedBy = null;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $commentaire = null;
    #[ORM\Column] private ?\DateTimeImmutable $changedAt = null;
    /** Cette methode initialise la date du changement de statut. */
    public function __construct() { $this->changedAt = new \DateTimeImmutable(); }
    public function getId(): ?int { return $this->id; }
    public function getIntervention(): ?Intervention { return $this->intervention; }
    public function setIntervention(?Intervention $intervention): static { $this->intervention = $intervention; return $this; }
    public function getStatus(): ?InterventionStatus { return $this->status; }
    public function setStatus(?InterventionStatus $status): static { $this->status = $status; return $this; }
    public function getChangedBy(): ?User { return $this->changedBy; }
    public function setChangedBy(?User $changedBy): static { $this->changedBy = $changedBy; return $this; }
    public function getCommentaire(): ?string { return $this->commentaire; }
    public function setCommentaire(?string $commentaire): static { $this->commentaire = $commentaire; return $this; }
    public function getChangedAt(): ?\DateTimeImmutable { return $this->changedAt; }
    public function setChangedAt(\DateTimeImmutable $changedAt): static { $this->changedAt = $changedAt; return $this; }
}