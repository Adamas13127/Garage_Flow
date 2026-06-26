<?php

/*
 * Ce fichier declare l'entite Intervention du backend GarageFlow.
 * Il existe pour representer le suivi atelier cree apres confirmation d'un rendez-vous.
 * Il communique avec Appointment, InterventionStatus, les historiques, notes et notifications.
 */

namespace App\Entity;

use App\Repository\InterventionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InterventionRepository::class)]
#[ORM\Table(name: 'intervention')]
#[ORM\UniqueConstraint(name: 'uniq_intervention_appointment', columns: ['appointment_id'])]
class Intervention
{
    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\OneToOne(inversedBy: 'intervention', targetEntity: Appointment::class)] #[ORM\JoinColumn(nullable: false)] private ?Appointment $appointment = null;
    #[ORM\ManyToOne(inversedBy: 'interventions')] #[ORM\JoinColumn(nullable: false)] private ?InterventionStatus $statutActuel = null;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $notesResume = null;
    #[ORM\Column] private ?\DateTimeImmutable $createdAt = null;
    #[ORM\Column(nullable: true)] private ?\DateTimeImmutable $closedAt = null;
    /** @var Collection<int, InterventionStatusHistory> */ #[ORM\OneToMany(mappedBy: 'intervention', targetEntity: InterventionStatusHistory::class, orphanRemoval: true)] private Collection $statusHistories;
    /** @var Collection<int, InternalNote> */ #[ORM\OneToMany(mappedBy: 'intervention', targetEntity: InternalNote::class, orphanRemoval: true)] private Collection $internalNotes;
    /** @var Collection<int, Notification> */ #[ORM\OneToMany(mappedBy: 'intervention', targetEntity: Notification::class)] private Collection $notifications;
    /** Cette methode initialise les collections de suivi et la date de creation. */
    public function __construct() { $this->createdAt = new \DateTimeImmutable(); $this->statusHistories = new ArrayCollection(); $this->internalNotes = new ArrayCollection(); $this->notifications = new ArrayCollection(); }
    public function getId(): ?int { return $this->id; }
    public function getAppointment(): ?Appointment { return $this->appointment; }
    public function setAppointment(?Appointment $appointment): static { $this->appointment = $appointment; return $this; }
    public function getStatutActuel(): ?InterventionStatus { return $this->statutActuel; }
    public function setStatutActuel(?InterventionStatus $statutActuel): static { $this->statutActuel = $statutActuel; return $this; }
    public function getNotesResume(): ?string { return $this->notesResume; }
    public function setNotesResume(?string $notesResume): static { $this->notesResume = $notesResume; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getClosedAt(): ?\DateTimeImmutable { return $this->closedAt; }
    public function setClosedAt(?\DateTimeImmutable $closedAt): static { $this->closedAt = $closedAt; return $this; }
    public function getStatusHistories(): Collection { return $this->statusHistories; }
    public function addStatusHistory(InterventionStatusHistory $history): static { if (!$this->statusHistories->contains($history)) { $this->statusHistories->add($history); $history->setIntervention($this); } return $this; }
    public function removeStatusHistory(InterventionStatusHistory $history): static { if ($this->statusHistories->removeElement($history) && $history->getIntervention() === $this) { $history->setIntervention(null); } return $this; }
    public function getInternalNotes(): Collection { return $this->internalNotes; }
    public function addInternalNote(InternalNote $note): static { if (!$this->internalNotes->contains($note)) { $this->internalNotes->add($note); $note->setIntervention($this); } return $this; }
    public function removeInternalNote(InternalNote $note): static { if ($this->internalNotes->removeElement($note) && $note->getIntervention() === $this) { $note->setIntervention(null); } return $this; }
    public function getNotifications(): Collection { return $this->notifications; }
    public function addNotification(Notification $notification): static { if (!$this->notifications->contains($notification)) { $this->notifications->add($notification); $notification->setIntervention($this); } return $this; }
    public function removeNotification(Notification $notification): static { if ($this->notifications->removeElement($notification) && $notification->getIntervention() === $this) { $notification->setIntervention(null); } return $this; }
}