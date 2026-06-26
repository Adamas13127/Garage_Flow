<?php

/*
 * Ce fichier declare l'entite Notification du backend GarageFlow.
 * Il existe pour stocker les notifications applicatives ou email envoyees aux utilisateurs.
 * Il communique avec User, Appointment et Intervention pour garder le contexte de la notification.
 */

namespace App\Entity;

use App\Repository\NotificationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificationRepository::class)]
#[ORM\Table(name: 'notification')]
#[ORM\Index(name: 'idx_notification_recipient', columns: ['recipient_id'])]
class Notification
{
    public const TYPE_RDV_DEMANDE = 'RDV_DEMANDE';
    public const TYPE_RDV_ACCEPTE = 'RDV_ACCEPTE';
    public const TYPE_RDV_REFUSE = 'RDV_REFUSE';
    public const TYPE_RDV_ANNULE = 'RDV_ANNULE';
    public const TYPE_STATUT_INTERVENTION_CHANGE = 'STATUT_INTERVENTION_CHANGE';
    public const TYPE_VEHICULE_PRET = 'VEHICULE_PRET';
    public const CANAL_APP = 'APP';
    public const CANAL_EMAIL = 'EMAIL';

    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'notifications')] #[ORM\JoinColumn(nullable: false)] private ?User $recipient = null;
    #[ORM\ManyToOne(inversedBy: 'notifications')] #[ORM\JoinColumn(nullable: true)] private ?Appointment $appointment = null;
    #[ORM\ManyToOne(inversedBy: 'notifications')] #[ORM\JoinColumn(nullable: true)] private ?Intervention $intervention = null;
    #[ORM\Column(length: 80)] private ?string $type = null;
    #[ORM\Column(length: 20)] private ?string $canal = null;
    #[ORM\Column(type: 'text')] private ?string $contenu = null;
    #[ORM\Column(options: ['default' => false])] private bool $lu = false;
    #[ORM\Column] private ?\DateTimeImmutable $createdAt = null;
    #[ORM\Column(nullable: true)] private ?\DateTimeImmutable $readAt = null;
    /** Cette methode initialise la date de creation et l'etat non lu de la notification. */
    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }
    public function getId(): ?int { return $this->id; }
    public function getRecipient(): ?User { return $this->recipient; }
    public function setRecipient(?User $recipient): static { $this->recipient = $recipient; return $this; }
    public function getAppointment(): ?Appointment { return $this->appointment; }
    public function setAppointment(?Appointment $appointment): static { $this->appointment = $appointment; return $this; }
    public function getIntervention(): ?Intervention { return $this->intervention; }
    public function setIntervention(?Intervention $intervention): static { $this->intervention = $intervention; return $this; }
    public function getType(): ?string { return $this->type; }
    public function setType(string $type): static { $this->type = $type; return $this; }
    public function getCanal(): ?string { return $this->canal; }
    public function setCanal(string $canal): static { $this->canal = $canal; return $this; }
    public function getContenu(): ?string { return $this->contenu; }
    public function setContenu(string $contenu): static { $this->contenu = $contenu; return $this; }
    public function isLu(): bool { return $this->lu; }
    public function setLu(bool $lu): static { $this->lu = $lu; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getReadAt(): ?\DateTimeImmutable { return $this->readAt; }
    public function setReadAt(?\DateTimeImmutable $readAt): static { $this->readAt = $readAt; return $this; }
}