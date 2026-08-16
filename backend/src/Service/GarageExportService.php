<?php

/*
 * Ce fichier declare le service GarageExportService du backend GarageFlow.
 * Il existe pour produire un export CSV/JSON des rendez-vous et interventions du garage connecte,
 * sur une periode donnee, pour le bloc "interfaces d'echange de donnees" du referentiel.
 * Il communique avec AppointmentRepository, InterventionRepository et Doctrine ORM.
 */

namespace App\Service;

use App\DTO\ExportRequest;
use App\Entity\Appointment;
use App\Entity\Garage;
use App\Entity\Intervention;
use App\Repository\AppointmentRepository;
use App\Repository\InterventionRepository;
use App\Security\InvalidAppointmentRequestException;

class GarageExportService
{
    public function __construct(
        private readonly AppointmentRepository $appointmentRepository,
        private readonly InterventionRepository $interventionRepository,
    ) {
    }

    /**
     * @return array<int, array<string, string|int|null>>
     */
    public function exportAppointments(Garage $garage, ExportRequest $request): array
    {
        [$from, $to] = $this->parsePeriod($request);

        return array_map(
            fn (Appointment $appointment): array => [
                'id' => $appointment->getId(),
                'statut' => $appointment->getStatut(),
                'dateDebut' => $appointment->getDateDebut()?->format(DATE_ATOM),
                'dateFin' => $appointment->getDateFin()?->format(DATE_ATOM),
                'clientNom' => $appointment->getClient()?->getNom(),
                'clientPrenom' => $appointment->getClient()?->getPrenom(),
                'clientEmail' => $appointment->getClient()?->getEmail(),
                'vehiculeMarque' => $appointment->getVehicle()?->getMarque(),
                'vehiculeModele' => $appointment->getVehicle()?->getModele(),
                'vehiculePlaque' => $appointment->getVehicle()?->getPlaqueImmatriculation(),
                'prestation' => $appointment->getService()?->getNom(),
                'commentaireClient' => $appointment->getCommentaireClient(),
            ],
            $this->appointmentRepository->findByGarageBetweenDates($garage, $from, $to)
        );
    }

    /**
     * @return array<int, array<string, string|int|null>>
     */
    public function exportInterventions(Garage $garage, ExportRequest $request): array
    {
        [$from, $to] = $this->parsePeriod($request);

        return array_map(
            fn (Intervention $intervention): array => [
                'id' => $intervention->getId(),
                'statutCode' => $intervention->getStatutActuel()?->getCode(),
                'statutLibelle' => $intervention->getStatutActuel()?->getLibelle(),
                'dateDebutRdv' => $intervention->getAppointment()?->getDateDebut()?->format(DATE_ATOM),
                'createdAt' => $intervention->getCreatedAt()?->format(DATE_ATOM),
                'closedAt' => $intervention->getClosedAt()?->format(DATE_ATOM),
                'clientNom' => $intervention->getAppointment()?->getClient()?->getNom(),
                'clientPrenom' => $intervention->getAppointment()?->getClient()?->getPrenom(),
                'vehiculePlaque' => $intervention->getAppointment()?->getVehicle()?->getPlaqueImmatriculation(),
                'prestation' => $intervention->getAppointment()?->getService()?->getNom(),
            ],
            $this->interventionRepository->findByGarageBetweenDates($garage, $from, $to)
        );
    }

    /**
     * @return array{0: \DateTimeImmutable, 1: \DateTimeImmutable}
     */
    private function parsePeriod(ExportRequest $request): array
    {
        $from = $this->parseDate($request->from);
        $to = $this->parseDate($request->to);
        if ($from > $to) {
            throw new InvalidAppointmentRequestException('Le parametre from doit etre anterieur ou egal a to.');
        }

        return [$from, $to];
    }

    private function parseDate(?string $value): \DateTimeImmutable
    {
        $parsed = \DateTimeImmutable::createFromFormat('!Y-m-d', trim((string) $value));
        $errors = \DateTimeImmutable::getLastErrors();
        if (!$parsed instanceof \DateTimeImmutable || (false !== $errors && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            throw new InvalidAppointmentRequestException('Les parametres from et to doivent etre au format YYYY-MM-DD.');
        }

        return $parsed;
    }
}
