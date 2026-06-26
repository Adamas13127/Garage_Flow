<?php

/*
 * Ce fichier declare l'entite Appointment du backend GarageFlow.
 * Il existe pour stocker une demande ou confirmation de rendez-vous entre un client et un garage.
 * Il communique avec Garage, User, Vehicle, ServicePrestation, Intervention et Notification.
 */

namespace App\Entity;

use App\Repository\AppointmentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AppointmentRepository::class)]
#[ORM\Table(name: 'appointment')]
#[ORM\Index(name: 'idx_appointment_garage_date', columns: ['garage_id', 'date_debut'])]
#[ORM\Index(name: 'idx_appointment_client', columns: ['client_id'])]
#[ORM\Index(name: 'idx_appointment_vehicle', columns: ['vehicle_id'])]
class Appointment
{
    public const STATUT_EN_ATTENTE = 'EN_ATTENTE';
    public const STATUT_CONFIRME = 'CONFIRME';
    public const STATUT_REFUSE = 'REFUSE';
    public const STATUT_ANNULE = 'ANNULE';
    public const STATUT_TERMINE = 'TERMINE';

    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\ManyToOne(inversedBy: 'appointments')] #[ORM\JoinColumn(nullable: false)] private ?Garage $garage = null;
    #[ORM\ManyToOne(inversedBy: 'appointments')] #[ORM\JoinColumn(nullable: false)] private ?User $client = null;
    #[ORM\ManyToOne(inversedBy: 'appointments')] #[ORM\JoinColumn(nullable: false)] private ?Vehicle $vehicle = null;
    #[ORM\ManyToOne(inversedBy: 'appointments')] #[ORM\JoinColumn(nullable: false)] private ?ServicePrestation $service = null;
    #[ORM\Column] private ?\DateTimeImmutable $dateDebut = null;
    #[ORM\Column] private ?\DateTimeImmutable $dateFin = null;
    #[ORM\Column(length: 50)] private string $statut = self::STATUT_EN_ATTENTE;
    #[ORM\Column(type: 'text', nullable: true)] private ?string $commentaireClient = null;
    #[ORM\Column] private ?\DateTimeImmutable $createdAt = null;
    #[ORM\Column(nullable: true)] private ?\DateTimeImmutable $updatedAt = null;
    #[ORM\OneToOne(mappedBy: 'appointment', targetEntity: Intervention::class)] private ?Intervention $intervention = null;
    /** @var Collection<int, Notification> */ #[ORM\OneToMany(mappedBy: 'appointment', targetEntity: Notification::class)] private Collection $notifications;
    /** Cette methode initialise les notifications du rendez-vous et sa date de creation. */
    public function __construct() { $this->createdAt = new \DateTimeImmutable(); $this->notifications = new ArrayCollection(); }
    public function getId(): ?int { return $this->id; }
    public function getGarage(): ?Garage { return $this->garage; }
    public function setGarage(?Garage $garage): static { $this->garage = $garage; return $this; }
    public function getClient(): ?User { return $this->client; }
    public function setClient(?User $client): static { $this->client = $client; return $this; }
    public function getVehicle(): ?Vehicle { return $this->vehicle; }
    public function setVehicle(?Vehicle $vehicle): static { $this->vehicle = $vehicle; return $this; }
    public function getService(): ?ServicePrestation { return $this->service; }
    public function setService(?ServicePrestation $service): static { $this->service = $service; return $this; }
    public function getDateDebut(): ?\DateTimeImmutable { return $this->dateDebut; }
    public function setDateDebut(\DateTimeImmutable $dateDebut): static { $this->dateDebut = $dateDebut; return $this; }
    public function getDateFin(): ?\DateTimeImmutable { return $this->dateFin; }
    public function setDateFin(\DateTimeImmutable $dateFin): static { $this->dateFin = $dateFin; return $this; }
    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $statut): static { $this->statut = $statut; return $this; }
    public function getCommentaireClient(): ?string { return $this->commentaireClient; }
    public function setCommentaireClient(?string $commentaireClient): static { $this->commentaireClient = $commentaireClient; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }
    public function getIntervention(): ?Intervention { return $this->intervention; }
    public function setIntervention(?Intervention $intervention): static { $this->intervention = $intervention; return $this; }
    public function getNotifications(): Collection { return $this->notifications; }
    public function addNotification(Notification $notification): static { if (!$this->notifications->contains($notification)) { $this->notifications->add($notification); $notification->setAppointment($this); } return $this; }
    public function removeNotification(Notification $notification): static { if ($this->notifications->removeElement($notification) && $notification->getAppointment() === $this) { $notification->setAppointment(null); } return $this; }
}