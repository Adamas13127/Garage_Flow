<?php

/*
 * Ce fichier declare l'entite Role du backend GarageFlow.
 * Il existe pour stocker les profils utilisateurs comme ADMIN, GERANT, EMPLOYE ou CLIENT.
 * Il communique avec les utilisateurs afin de preparer les futures regles d'autorisation.
 */

namespace App\Entity;

use App\Repository\RoleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RoleRepository::class)]
#[ORM\Table(name: 'role')]
#[ORM\UniqueConstraint(name: 'uniq_role_code', columns: ['code'])]
class Role
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $code = null;

    #[ORM\Column(length: 100)]
    private ?string $libelle = null;

    /** @var Collection<int, User> */
    #[ORM\OneToMany(mappedBy: 'role', targetEntity: User::class)]
    private Collection $users;

    /** Cette methode prepare la collection des utilisateurs qui possedent ce role. */
    public function __construct()
    {
        $this->users = new ArrayCollection();
    }

    /** Cette methode retourne l'identifiant technique du role. */
    public function getId(): ?int { return $this->id; }
    /** Cette methode retourne le code technique du role. */
    public function getCode(): ?string { return $this->code; }
    /** Cette methode modifie le code technique du role. */
    public function setCode(string $code): static { $this->code = $code; return $this; }
    /** Cette methode retourne le libelle lisible du role. */
    public function getLibelle(): ?string { return $this->libelle; }
    /** Cette methode modifie le libelle lisible du role. */
    public function setLibelle(string $libelle): static { $this->libelle = $libelle; return $this; }
    /** Cette methode retourne les utilisateurs lies a ce role. */
    public function getUsers(): Collection { return $this->users; }
    /** Cette methode ajoute un utilisateur dans la liste du role. */
    public function addUser(User $user): static { if (!$this->users->contains($user)) { $this->users->add($user); $user->setRole($this); } return $this; }
    /** Cette methode retire un utilisateur de la liste du role. */
    public function removeUser(User $user): static { if ($this->users->removeElement($user) && $user->getRole() === $this) { $user->setRole(null); } return $this; }
}