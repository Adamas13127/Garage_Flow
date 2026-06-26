<?php

/*
 * Ce fichier declare l'entite User du backend GarageFlow.
 * Il existe pour centraliser les comptes clients, employes, gerants et administrateurs.
 * Il communique avec les roles, les garages, les vehicules, les rendez-vous, Symfony Security et les traces d'action.
 */

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Cette entite represente un utilisateur qui pourra etre authentifie par Symfony Security.
 */
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'user')]
#[ORM\UniqueConstraint(name: 'uniq_user_email', columns: ['email'])]
#[ORM\Index(name: 'idx_user_garage', columns: ['garage_id'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Role $role = null;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Garage $garage = null;

    #[ORM\Column(length: 100)]
    private ?string $nom = null;

    #[ORM\Column(length: 100)]
    private ?string $prenom = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(length: 30, nullable: true)]
    private ?string $telephone = null;

    #[ORM\Column(options: ['default' => true])]
    private bool $actif = true;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    /** @var Collection<int, Unavailability> */
    #[ORM\OneToMany(mappedBy: 'createdBy', targetEntity: Unavailability::class)]
    private Collection $createdUnavailabilities;

    /** @var Collection<int, Vehicle> */
    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Vehicle::class)]
    private Collection $vehicles;

    /** @var Collection<int, Appointment> */
    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Appointment::class)]
    private Collection $appointments;

    /** @var Collection<int, InterventionStatusHistory> */
    #[ORM\OneToMany(mappedBy: 'changedBy', targetEntity: InterventionStatusHistory::class)]
    private Collection $interventionStatusHistories;

    /** @var Collection<int, InternalNote> */
    #[ORM\OneToMany(mappedBy: 'author', targetEntity: InternalNote::class)]
    private Collection $internalNotes;

    /** @var Collection<int, Notification> */
    #[ORM\OneToMany(mappedBy: 'recipient', targetEntity: Notification::class)]
    private Collection $notifications;

    /** @var Collection<int, ActionLog> */
    #[ORM\OneToMany(mappedBy: 'user', targetEntity: ActionLog::class)]
    private Collection $actionLogs;

    /** Cette methode initialise les collections d'un utilisateur et sa date de creation. */
    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->createdUnavailabilities = new ArrayCollection();
        $this->vehicles = new ArrayCollection();
        $this->appointments = new ArrayCollection();
        $this->interventionStatusHistories = new ArrayCollection();
        $this->internalNotes = new ArrayCollection();
        $this->notifications = new ArrayCollection();
        $this->actionLogs = new ArrayCollection();
    }

    /** Cette methode retourne l'identifiant technique de l'utilisateur. */
    public function getId(): ?int { return $this->id; }
    public function getRole(): ?Role { return $this->role; }
    public function setRole(?Role $role): static { $this->role = $role; return $this; }
    public function getGarage(): ?Garage { return $this->garage; }
    public function setGarage(?Garage $garage): static { $this->garage = $garage; return $this; }
    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }
    public function getPrenom(): ?string { return $this->prenom; }
    public function setPrenom(string $prenom): static { $this->prenom = $prenom; return $this; }
    public function getEmail(): ?string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }
    /** Cette methode permet a Symfony Security d'identifier l'utilisateur connecte grace a son email. */
    public function getUserIdentifier(): string { return (string) $this->email; }
    /** Cette methode retourne les roles Symfony calcules depuis le role stocke en base. */
    public function getRoles(): array
    {
        $roles = [];
        $roleCode = $this->role?->getCode();

        if ($roleCode !== null && $roleCode !== '') {
            $roles[] = str_starts_with($roleCode, 'ROLE_') ? $roleCode : 'ROLE_'.$roleCode;
        }

        $roles[] = 'ROLE_CLIENT';

        return array_values(array_unique($roles));
    }
    public function getPassword(): ?string { return $this->password; }
    public function setPassword(string $password): static { $this->password = $password; return $this; }
    /** Cette methode efface les donnees sensibles temporaires apres authentification. */
    public function eraseCredentials(): void {}
    public function getTelephone(): ?string { return $this->telephone; }
    public function setTelephone(?string $telephone): static { $this->telephone = $telephone; return $this; }
    public function isActif(): bool { return $this->actif; }
    public function setActif(bool $actif): static { $this->actif = $actif; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }
    public function getCreatedUnavailabilities(): Collection { return $this->createdUnavailabilities; }
    public function addCreatedUnavailability(Unavailability $unavailability): static { if (!$this->createdUnavailabilities->contains($unavailability)) { $this->createdUnavailabilities->add($unavailability); $unavailability->setCreatedBy($this); } return $this; }
    public function removeCreatedUnavailability(Unavailability $unavailability): static { if ($this->createdUnavailabilities->removeElement($unavailability) && $unavailability->getCreatedBy() === $this) { $unavailability->setCreatedBy(null); } return $this; }
    public function getVehicles(): Collection { return $this->vehicles; }
    public function addVehicle(Vehicle $vehicle): static { if (!$this->vehicles->contains($vehicle)) { $this->vehicles->add($vehicle); $vehicle->setClient($this); } return $this; }
    public function removeVehicle(Vehicle $vehicle): static { if ($this->vehicles->removeElement($vehicle) && $vehicle->getClient() === $this) { $vehicle->setClient(null); } return $this; }
    public function getAppointments(): Collection { return $this->appointments; }
    public function addAppointment(Appointment $appointment): static { if (!$this->appointments->contains($appointment)) { $this->appointments->add($appointment); $appointment->setClient($this); } return $this; }
    public function removeAppointment(Appointment $appointment): static { if ($this->appointments->removeElement($appointment) && $appointment->getClient() === $this) { $appointment->setClient(null); } return $this; }
    public function getInterventionStatusHistories(): Collection { return $this->interventionStatusHistories; }
    public function addInterventionStatusHistory(InterventionStatusHistory $history): static { if (!$this->interventionStatusHistories->contains($history)) { $this->interventionStatusHistories->add($history); $history->setChangedBy($this); } return $this; }
    public function removeInterventionStatusHistory(InterventionStatusHistory $history): static { if ($this->interventionStatusHistories->removeElement($history) && $history->getChangedBy() === $this) { $history->setChangedBy(null); } return $this; }
    public function getInternalNotes(): Collection { return $this->internalNotes; }
    public function addInternalNote(InternalNote $note): static { if (!$this->internalNotes->contains($note)) { $this->internalNotes->add($note); $note->setAuthor($this); } return $this; }
    public function removeInternalNote(InternalNote $note): static { if ($this->internalNotes->removeElement($note) && $note->getAuthor() === $this) { $note->setAuthor(null); } return $this; }
    public function getNotifications(): Collection { return $this->notifications; }
    public function addNotification(Notification $notification): static { if (!$this->notifications->contains($notification)) { $this->notifications->add($notification); $notification->setRecipient($this); } return $this; }
    public function removeNotification(Notification $notification): static { if ($this->notifications->removeElement($notification) && $notification->getRecipient() === $this) { $notification->setRecipient(null); } return $this; }
    public function getActionLogs(): Collection { return $this->actionLogs; }
    public function addActionLog(ActionLog $actionLog): static { if (!$this->actionLogs->contains($actionLog)) { $this->actionLogs->add($actionLog); $actionLog->setUser($this); } return $this; }
    public function removeActionLog(ActionLog $actionLog): static { if ($this->actionLogs->removeElement($actionLog) && $actionLog->getUser() === $this) { $actionLog->setUser(null); } return $this; }
}