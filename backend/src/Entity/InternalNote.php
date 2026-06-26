<?php

/*
 * Ce fichier declare l'entite InternalNote du backend GarageFlow.
 * Il existe pour stocker les notes internes d'un garage sur une intervention.
 * Il communique avec Intervention et User, et ces notes ne doivent jamais etre exposees aux clients.
 */

namespace App\Entity;

use App\Repository\InternalNoteRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InternalNoteRepository::class)]
#[ORM\Table(name: 'internal_note')]
#[ORM\Index(name: 'idx_internal_note_intervention', columns: ['intervention_id'])]
class InternalNote
{
    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'internalNotes')] #[ORM\JoinColumn(nullable: false)] private ?Intervention $intervention = null;
    #[ORM\ManyToOne(inversedBy: 'internalNotes')] #[ORM\JoinColumn(nullable: false)] private ?User $author = null;
    #[ORM\Column(type: 'text')] private ?string $contenu = null;
    #[ORM\Column] private ?\DateTimeImmutable $createdAt = null;
    #[ORM\Column(nullable: true)] private ?\DateTimeImmutable $updatedAt = null;
    /** Cette methode initialise la date de creation de la note interne. */
    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }
    public function getId(): ?int { return $this->id; }
    public function getIntervention(): ?Intervention { return $this->intervention; }
    public function setIntervention(?Intervention $intervention): static { $this->intervention = $intervention; return $this; }
    public function getAuthor(): ?User { return $this->author; }
    public function setAuthor(?User $author): static { $this->author = $author; return $this; }
    public function getContenu(): ?string { return $this->contenu; }
    public function setContenu(string $contenu): static { $this->contenu = $contenu; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }
}