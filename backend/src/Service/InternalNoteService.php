<?php

/*
 * Ce fichier declare le service InternalNoteService du backend GarageFlow.
 * Il existe pour gerer les notes internes d'une intervention cote garage.
 * Il communique avec GarageInterventionService, InternalNoteRepository et Doctrine ORM.
 */

namespace App\Service;

use App\DTO\CreateInternalNoteRequest;
use App\DTO\UpdateInternalNoteRequest;
use App\Entity\Garage;
use App\Entity\InternalNote;
use App\Entity\User;
use App\Repository\InternalNoteRepository;
use App\Security\InternalNoteNotFoundException;
use Doctrine\ORM\EntityManagerInterface;

/** Ce service garantit que les notes internes restent limitees au garage proprietaire de l'intervention. */
class InternalNoteService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly InternalNoteRepository $noteRepository,
        private readonly GarageInterventionService $interventionService,
    ) {
    }

    /**
     * @return InternalNote[]
     */
    public function listForIntervention(Garage $garage, int $interventionId): array
    {
        $intervention = $this->interventionService->getForGarage($garage, $interventionId);

        return $this->noteRepository->findNotesByIntervention($intervention);
    }

    public function create(Garage $garage, int $interventionId, User $author, CreateInternalNoteRequest $request): InternalNote
    {
        $intervention = $this->interventionService->getForGarage($garage, $interventionId);
        $note = new InternalNote();
        $note
            ->setIntervention($intervention)
            ->setAuthor($author)
            ->setContenu(trim((string) $request->contenu))
            ->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($note);
        $this->entityManager->flush();

        return $note;
    }

    public function update(Garage $garage, int $interventionId, int $noteId, UpdateInternalNoteRequest $request): InternalNote
    {
        $note = $this->getNoteForGarageIntervention($garage, $interventionId, $noteId);
        $note->setContenu(trim((string) $request->contenu));
        $note->setUpdatedAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $note;
    }

    public function delete(Garage $garage, int $interventionId, int $noteId): void
    {
        $note = $this->getNoteForGarageIntervention($garage, $interventionId, $noteId);
        $this->entityManager->remove($note);
        $this->entityManager->flush();
    }

    private function getNoteForGarageIntervention(Garage $garage, int $interventionId, int $noteId): InternalNote
    {
        $intervention = $this->interventionService->getForGarage($garage, $interventionId);
        $note = $this->noteRepository->findOneNoteByInterventionAndId($intervention, $noteId);
        if (!$note instanceof InternalNote) {
            throw new InternalNoteNotFoundException('Note interne introuvable.');
        }

        return $note;
    }
}
