<?php

/*
 * Ce fichier declare l'entite InterventionStatus du backend GarageFlow.
 * Il existe pour stocker les statuts possibles du suivi atelier.
 * Il communique avec Intervention et InterventionStatusHistory pour historiser les changements.
 */

namespace App\Entity;

use App\Repository\InterventionStatusRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InterventionStatusRepository::class)]
#[ORM\Table(name: 'intervention_status')]
#[ORM\UniqueConstraint(name: 'uniq_intervention_status_code', columns: ['code'])]
class InterventionStatus
{
    #[ORM\Id] #[ORM\GeneratedValue] #[ORM\Column] private ?int $id = null;
    #[ORM\Column(length: 80)] private ?string $code = null;
    #[ORM\Column(length: 150)] private ?string $libelle = null;
    #[ORM\Column] private ?int $ordreAffichage = null;
    #[ORM\Column(options: ['default' => true])] private bool $visibleClient = true;
    /** @var Collection<int, Intervention> */ #[ORM\OneToMany(mappedBy: 'statutActuel', targetEntity: Intervention::class)] private Collection $interventions;
    /** @var Collection<int, InterventionStatusHistory> */ #[ORM\OneToMany(mappedBy: 'status', targetEntity: InterventionStatusHistory::class)] private Collection $histories;
    /** Cette methode initialise les interventions et historiques lies a ce statut. */
    public function __construct() { $this->interventions = new ArrayCollection(); $this->histories = new ArrayCollection(); }
    public function getId(): ?int { return $this->id; }
    public function getCode(): ?string { return $this->code; }
    public function setCode(string $code): static { $this->code = $code; return $this; }
    public function getLibelle(): ?string { return $this->libelle; }
    public function setLibelle(string $libelle): static { $this->libelle = $libelle; return $this; }
    public function getOrdreAffichage(): ?int { return $this->ordreAffichage; }
    public function setOrdreAffichage(int $ordreAffichage): static { $this->ordreAffichage = $ordreAffichage; return $this; }
    public function isVisibleClient(): bool { return $this->visibleClient; }
    public function setVisibleClient(bool $visibleClient): static { $this->visibleClient = $visibleClient; return $this; }
    public function getInterventions(): Collection { return $this->interventions; }
    public function addIntervention(Intervention $intervention): static { if (!$this->interventions->contains($intervention)) { $this->interventions->add($intervention); $intervention->setStatutActuel($this); } return $this; }
    public function removeIntervention(Intervention $intervention): static { if ($this->interventions->removeElement($intervention) && $intervention->getStatutActuel() === $this) { $intervention->setStatutActuel(null); } return $this; }
    public function getHistories(): Collection { return $this->histories; }
    public function addHistory(InterventionStatusHistory $history): static { if (!$this->histories->contains($history)) { $this->histories->add($history); $history->setStatus($this); } return $this; }
    public function removeHistory(InterventionStatusHistory $history): static { if ($this->histories->removeElement($history) && $history->getStatus() === $this) { $history->setStatus(null); } return $this; }
}