<?php

/*
 * Ce fichier declare le service AvailabilityService du backend GarageFlow.
 * Il existe pour calculer les creneaux disponibles d'un garage a partir de ses horaires, indisponibilites et rendez-vous.
 * Il communique avec les repositories Garage, ServicePrestation, OpeningHour, Unavailability et Appointment.
 */

namespace App\Service;

use App\Entity\Garage;
use App\Entity\OpeningHour;
use App\Entity\ServicePrestation;
use App\Repository\AppointmentRepository;
use App\Repository\GarageRepository;
use App\Repository\OpeningHourRepository;
use App\Repository\ServicePrestationRepository;
use App\Repository\UnavailabilityRepository;
use App\Security\GarageNotFoundException;
use App\Security\GarageResourceNotFoundException;
use App\Security\InvalidAppointmentRequestException;

/** Ce service contient la logique metier qui determine si un creneau peut etre reserve. */
class AvailabilityService
{
    private const SLOT_STEP_MINUTES = 30;

    public function __construct(
        private readonly GarageRepository $garageRepository,
        private readonly ServicePrestationRepository $serviceRepository,
        private readonly OpeningHourRepository $openingHourRepository,
        private readonly UnavailabilityRepository $unavailabilityRepository,
        private readonly AppointmentRepository $appointmentRepository,
    ) {
    }

    /** Cette methode retourne les creneaux disponibles pour un garage, une prestation et une date. */
    public function getAvailableSlots(int $garageId, int $serviceId, string $date): array
    {
        $garage = $this->getActiveGarage($garageId);
        $service = $this->getActiveServiceForGarage($garage, $serviceId);
        $day = $this->parseDay($date);
        $weekday = (int) $day->format('N');
        $slots = [];
        $now = new \DateTimeImmutable();

        foreach ($this->openingHourRepository->findActiveByGarageAndWeekday($garage, $weekday) as $openingHour) {
            if (!$openingHour instanceof OpeningHour) {
                continue;
            }

            $periodStart = $this->combineDayAndTime($day, $openingHour->getHeureDebut());
            $periodEnd = $this->combineDayAndTime($day, $openingHour->getHeureFin());
            $cursor = $periodStart;

            while ($cursor < $periodEnd) {
                $slotEnd = $cursor->modify('+'.$service->getDureeMinutes().' minutes');
                if ($slotEnd > $periodEnd) {
                    break;
                }

                if ($cursor > $now && $this->isPeriodFree($garage, $cursor, $slotEnd)) {
                    $slots[] = ['dateDebut' => $cursor->format(DATE_ATOM), 'dateFin' => $slotEnd->format(DATE_ATOM)];
                }

                $cursor = $cursor->modify('+'.self::SLOT_STEP_MINUTES.' minutes');
            }
        }

        return $slots;
    }

    /** Cette methode verifie qu'un creneau precis peut recevoir la prestation demandee. */
    public function isSlotAvailable(Garage $garage, ServicePrestation $service, \DateTimeImmutable $start): bool
    {
        $end = $start->modify('+'.$service->getDureeMinutes().' minutes');
        if ($start <= new \DateTimeImmutable()) {
            return false;
        }

        if (!$this->fitsInsideOpeningHours($garage, $start, $end)) {
            return false;
        }

        return $this->isPeriodFree($garage, $start, $end);
    }

    /** Cette methode recupere un garage actif ou declenche une erreur 404. */
    public function getActiveGarage(int $garageId): Garage
    {
        $garage = $this->garageRepository->findActiveGarageById($garageId);
        if (!$garage instanceof Garage) {
            throw new GarageNotFoundException('Garage introuvable.');
        }

        return $garage;
    }

    /** Cette methode recupere une prestation active du garage ou declenche une erreur 404. */
    public function getActiveServiceForGarage(Garage $garage, int $serviceId): ServicePrestation
    {
        $service = $this->serviceRepository->findOneByGarageAndId($garage, $serviceId);
        if (!$service instanceof ServicePrestation || !$service->isActif()) {
            throw new GarageResourceNotFoundException('Prestation introuvable.');
        }

        return $service;
    }

    /** Cette methode convertit une date YYYY-MM-DD en jour exploitable par le calcul de disponibilite. */
    public function parseDay(string $date): \DateTimeImmutable
    {
        $day = \DateTimeImmutable::createFromFormat('!Y-m-d', trim($date));
        $errors = \DateTimeImmutable::getLastErrors();

        if (!$day instanceof \DateTimeImmutable || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            throw new InvalidAppointmentRequestException('La date doit etre au format YYYY-MM-DD.');
        }

        return $day;
    }

    /** Cette methode convertit la date de debut envoyee par le client en objet DateTimeImmutable. */
    public function parseDateTime(string $value): \DateTimeImmutable
    {
        try {
            return new \DateTimeImmutable(trim($value));
        } catch (\Exception) {
            throw new InvalidAppointmentRequestException('La date de debut est invalide.');
        }
    }

    /** Cette methode verifie qu'un creneau est dans une plage horaire active du garage. */
    private function fitsInsideOpeningHours(Garage $garage, \DateTimeImmutable $start, \DateTimeImmutable $end): bool
    {
        $day = \DateTimeImmutable::createFromFormat('!Y-m-d', $start->format('Y-m-d'));
        if (!$day instanceof \DateTimeImmutable) {
            return false;
        }

        foreach ($this->openingHourRepository->findActiveByGarageAndWeekday($garage, (int) $start->format('N')) as $openingHour) {
            if (!$openingHour instanceof OpeningHour) {
                continue;
            }

            $periodStart = $this->combineDayAndTime($day, $openingHour->getHeureDebut(), $start->getTimezone());
            $periodEnd = $this->combineDayAndTime($day, $openingHour->getHeureFin(), $start->getTimezone());

            if ($start >= $periodStart && $end <= $periodEnd) {
                return true;
            }
        }

        return false;
    }

    /** Cette methode verifie qu'aucune indisponibilite ni rendez-vous bloquant ne chevauche la periode. */
    private function isPeriodFree(Garage $garage, \DateTimeImmutable $start, \DateTimeImmutable $end): bool
    {
        if ($this->unavailabilityRepository->findForGarageBetween($garage, $start, $end) !== []) {
            return false;
        }

        return $this->appointmentRepository->findBlockingAppointmentsForGarageBetween($garage, $start, $end) === [];
    }

    /** Cette methode colle une heure recurrente sur une date precise pour obtenir un vrai creneau. */
    private function combineDayAndTime(\DateTimeImmutable $day, ?\DateTimeImmutable $time, ?\DateTimeZone $timezone = null): \DateTimeImmutable
    {
        if (!$time instanceof \DateTimeImmutable) {
            throw new InvalidAppointmentRequestException('Un horaire du garage est incomplet.');
        }

        $timezone ??= $day->getTimezone();

        return new \DateTimeImmutable($day->format('Y-m-d').' '.$time->format('H:i:s'), $timezone);
    }
}