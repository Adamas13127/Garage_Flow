<?php

/*
 * Ce fichier declare le service ClientInterventionService du backend GarageFlow.
 * Il existe pour permettre a un client de consulter l'avancement de ses propres reparations.
 * Il communique avec InterventionRepository et InterventionStatusHistoryRepository sans exposer les notes internes.
 */

namespace App\Service;

use App\Entity\Intervention;
use App\Entity\User;
use App\Repository\InterventionRepository;
use App\Repository\InterventionStatusHistoryRepository;
use App\Security\InterventionNotFoundException;

/** Ce service garantit qu'un client ne voit que les interventions liees a ses rendez-vous. */
class ClientInterventionService
{
    public function __construct(
        private readonly InterventionRepository $interventionRepository,
        private readonly InterventionStatusHistoryRepository $historyRepository,
    ) {
    }

    /**
     * @return Intervention[]
     */
    public function listForClient(User $client): array
    {
        return $this->interventionRepository->findByClient($client);
    }

    public function getForClient(User $client, int $id): Intervention
    {
        $intervention = $this->interventionRepository->findOneByClientAndId($client, $id);
        if (!$intervention instanceof Intervention) {
            throw new InterventionNotFoundException('Intervention introuvable.');
        }

        return $intervention;
    }

    /**
     * @return \App\Entity\InterventionStatusHistory[]
     */
    public function getVisibleHistory(Intervention $intervention): array
    {
        return $this->historyRepository->findVisibleHistoryByIntervention($intervention);
    }
}
