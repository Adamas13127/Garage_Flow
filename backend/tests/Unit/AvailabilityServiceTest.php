<?php

/*
 * Ce fichier teste unitairement AvailabilityService du backend GarageFlow.
 * Il existe pour verifier le calcul des creneaux sans base de donnees ni conteneur Symfony.
 * Il communique avec des repositories simules (mocks PHPUnit) et des entites construites en memoire.
 */

namespace App\Tests\Unit;

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
use App\Service\AvailabilityService;
use PHPUnit\Framework\TestCase;

/** Cette classe verifie en isolation le calcul de creneaux, sans dependre de Doctrine ni d'une base reelle. */
class AvailabilityServiceTest extends TestCase
{
    private GarageRepository $garageRepository;
    private ServicePrestationRepository $serviceRepository;
    private OpeningHourRepository $openingHourRepository;
    private UnavailabilityRepository $unavailabilityRepository;
    private AppointmentRepository $appointmentRepository;

    protected function setUp(): void
    {
        $this->garageRepository = $this->createMock(GarageRepository::class);
        $this->serviceRepository = $this->createMock(ServicePrestationRepository::class);
        $this->openingHourRepository = $this->createMock(OpeningHourRepository::class);
        $this->unavailabilityRepository = $this->createMock(UnavailabilityRepository::class);
        $this->appointmentRepository = $this->createMock(AppointmentRepository::class);
    }

    private function makeService(): AvailabilityService
    {
        return new AvailabilityService(
            $this->garageRepository,
            $this->serviceRepository,
            $this->openingHourRepository,
            $this->unavailabilityRepository,
            $this->appointmentRepository,
        );
    }

    private function makeGarage(): Garage
    {
        $garage = new Garage();
        $garage->setNom('Garage Test')->setAdresse('1 rue Test')->setVille('Paris')->setCodePostal('75000');

        return $garage;
    }

    private function makeService_(int $dureeMinutes, bool $actif = true): ServicePrestation
    {
        $service = new ServicePrestation();
        $service->setNom('Prestation Test')->setDureeMinutes($dureeMinutes)->setActif($actif);

        return $service;
    }

    private function makeOpeningHour(int $weekday, \DateTimeImmutable $debut, \DateTimeImmutable $fin): OpeningHour
    {
        return (new OpeningHour())->setJourSemaine($weekday)->setHeureDebut($debut)->setHeureFin($fin)->setActif(true);
    }

    /** Une fenetre d'ouverture de 60 minutes avec une prestation de 30 minutes doit produire exactement 2 creneaux. */
    public function testGetAvailableSlotsRespectsServiceDurationWithinOpeningWindow(): void
    {
        $garage = $this->makeGarage();
        $service = $this->makeService_(30);
        $day = new \DateTimeImmutable('+30 days');
        $weekday = (int) $day->format('N');
        $opening = $this->makeOpeningHour($weekday, new \DateTimeImmutable('09:00'), new \DateTimeImmutable('10:00'));

        $this->garageRepository->method('findActiveGarageById')->willReturn($garage);
        $this->serviceRepository->method('findOneByGarageAndId')->willReturn($service);
        $this->openingHourRepository->method('findActiveByGarageAndWeekday')->willReturn([$opening]);
        $this->unavailabilityRepository->method('findForGarageBetween')->willReturn([]);
        $this->appointmentRepository->method('findBlockingAppointmentsForGarageBetweenExcludingAppointment')->willReturn([]);

        $slots = $this->makeService()->getAvailableSlots(1, 1, $day->format('Y-m-d'));

        self::assertCount(2, $slots);
        self::assertStringContainsString('09:00:00', $slots[0]['dateDebut']);
        self::assertStringContainsString('09:30:00', $slots[0]['dateFin']);
        self::assertStringContainsString('09:30:00', $slots[1]['dateDebut']);
        self::assertStringContainsString('10:00:00', $slots[1]['dateFin']);
    }

    /** Si la duree de la prestation ne rentre plus dans le reste de la fenetre, aucun creneau supplementaire n'est propose (cas limite). */
    public function testGetAvailableSlotsStopsWhenServiceDurationDoesNotFitRemainingWindow(): void
    {
        $garage = $this->makeGarage();
        $service = $this->makeService_(30);
        $day = new \DateTimeImmutable('+30 days');
        $weekday = (int) $day->format('N');
        // Fenetre de 45 minutes : un seul creneau de 30 minutes rentre, le second depasserait la fermeture.
        $opening = $this->makeOpeningHour($weekday, new \DateTimeImmutable('09:00'), new \DateTimeImmutable('09:45'));

        $this->garageRepository->method('findActiveGarageById')->willReturn($garage);
        $this->serviceRepository->method('findOneByGarageAndId')->willReturn($service);
        $this->openingHourRepository->method('findActiveByGarageAndWeekday')->willReturn([$opening]);
        $this->unavailabilityRepository->method('findForGarageBetween')->willReturn([]);
        $this->appointmentRepository->method('findBlockingAppointmentsForGarageBetweenExcludingAppointment')->willReturn([]);

        $slots = $this->makeService()->getAvailableSlots(1, 1, $day->format('Y-m-d'));

        self::assertCount(1, $slots);
    }

    /** Les creneaux deja passes par rapport a l'instant present ne doivent jamais etre proposes. */
    public function testGetAvailableSlotsExcludesPastSlotsRelativeToNow(): void
    {
        $now = new \DateTimeImmutable();
        $weekday = (int) $now->format('N');
        // Fenetre bornee a la journee en cours (jamais a cheval sur minuit) pour rester deterministe
        // quelle que soit l'heure d'execution des tests.
        $windowStart = $now->modify('-3 hours')->format('Y-m-d') === $now->format('Y-m-d') ? $now->modify('-3 hours') : $now->setTime(0, 0);
        $windowEnd = $now->modify('+3 hours')->format('Y-m-d') === $now->format('Y-m-d') ? $now->modify('+3 hours') : $now->setTime(23, 45);
        $opening = $this->makeOpeningHour($weekday, $windowStart, $windowEnd);
        $garage = $this->makeGarage();
        $service = $this->makeService_(30);

        $this->garageRepository->method('findActiveGarageById')->willReturn($garage);
        $this->serviceRepository->method('findOneByGarageAndId')->willReturn($service);
        $this->openingHourRepository->method('findActiveByGarageAndWeekday')->willReturn([$opening]);
        $this->unavailabilityRepository->method('findForGarageBetween')->willReturn([]);
        $this->appointmentRepository->method('findBlockingAppointmentsForGarageBetweenExcludingAppointment')->willReturn([]);

        $slots = $this->makeService()->getAvailableSlots(1, 1, $now->format('Y-m-d'));

        self::assertNotEmpty($slots, 'des creneaux futurs doivent rester disponibles dans la seconde moitie de la fenetre');
        foreach ($slots as $slot) {
            self::assertGreaterThan($now->format(DATE_ATOM), $slot['dateDebut']);
        }
    }

    /** Un creneau qui chevauche une indisponibilite du garage doit etre exclu du resultat. */
    public function testGetAvailableSlotsSkipsSlotOverlappingUnavailability(): void
    {
        $garage = $this->makeGarage();
        $service = $this->makeService_(30);
        $day = new \DateTimeImmutable('+30 days');
        $weekday = (int) $day->format('N');
        $opening = $this->makeOpeningHour($weekday, new \DateTimeImmutable('09:00'), new \DateTimeImmutable('10:00'));

        $this->garageRepository->method('findActiveGarageById')->willReturn($garage);
        $this->serviceRepository->method('findOneByGarageAndId')->willReturn($service);
        $this->openingHourRepository->method('findActiveByGarageAndWeekday')->willReturn([$opening]);
        $this->appointmentRepository->method('findBlockingAppointmentsForGarageBetweenExcludingAppointment')->willReturn([]);
        // Seul le creneau 09:30-10:00 est bloque par une indisponibilite.
        $this->unavailabilityRepository->method('findForGarageBetween')->willReturnCallback(
            fn (Garage $g, \DateTimeImmutable $start, \DateTimeImmutable $end): array => '09:30:00' === $start->format('H:i:s') ? ['bloque'] : []
        );

        $slots = $this->makeService()->getAvailableSlots(1, 1, $day->format('Y-m-d'));

        self::assertCount(1, $slots);
        self::assertStringContainsString('09:00:00', $slots[0]['dateDebut']);
    }

    /** Un creneau qui chevauche un rendez-vous confirme ou en attente doit etre exclu du resultat. */
    public function testGetAvailableSlotsSkipsSlotOverlappingBlockingAppointment(): void
    {
        $garage = $this->makeGarage();
        $service = $this->makeService_(30);
        $day = new \DateTimeImmutable('+30 days');
        $weekday = (int) $day->format('N');
        $opening = $this->makeOpeningHour($weekday, new \DateTimeImmutable('09:00'), new \DateTimeImmutable('10:00'));

        $this->garageRepository->method('findActiveGarageById')->willReturn($garage);
        $this->serviceRepository->method('findOneByGarageAndId')->willReturn($service);
        $this->openingHourRepository->method('findActiveByGarageAndWeekday')->willReturn([$opening]);
        $this->unavailabilityRepository->method('findForGarageBetween')->willReturn([]);
        $this->appointmentRepository->method('findBlockingAppointmentsForGarageBetweenExcludingAppointment')->willReturnCallback(
            fn (Garage $g, \DateTimeImmutable $start, \DateTimeImmutable $end): array => '09:00:00' === $start->format('H:i:s') ? ['bloque'] : []
        );

        $slots = $this->makeService()->getAvailableSlots(1, 1, $day->format('Y-m-d'));

        self::assertCount(1, $slots);
        self::assertStringContainsString('09:30:00', $slots[0]['dateDebut']);
    }

    /** Un garage introuvable ou inactif doit lever une exception 404 dediee, sans interroger les autres repositories. */
    public function testGetAvailableSlotsThrowsWhenGarageNotFound(): void
    {
        $this->garageRepository->method('findActiveGarageById')->willReturn(null);
        $this->serviceRepository->expects(self::never())->method('findOneByGarageAndId');

        $this->expectException(GarageNotFoundException::class);

        $this->makeService()->getAvailableSlots(1, 1, '2030-01-07');
    }

    /** Une prestation inactive doit etre traitee comme indisponible, meme si elle existe toujours en base. */
    public function testGetAvailableSlotsThrowsWhenServiceIsInactive(): void
    {
        $this->garageRepository->method('findActiveGarageById')->willReturn($this->makeGarage());
        $this->serviceRepository->method('findOneByGarageAndId')->willReturn($this->makeService_(30, actif: false));

        $this->expectException(GarageResourceNotFoundException::class);

        $this->makeService()->getAvailableSlots(1, 1, '2030-01-07');
    }

    /** Une date qui ne respecte pas le format YYYY-MM-DD doit etre rejetee avant tout calcul de creneau. */
    public function testParseDayRejectsInvalidFormat(): void
    {
        $this->expectException(InvalidAppointmentRequestException::class);

        $this->makeService()->parseDay('07/01/2030');
    }

    /** Une date valide doit etre convertie en DateTimeImmutable calee sur minuit. */
    public function testParseDayReturnsMidnightForValidFormat(): void
    {
        $day = $this->makeService()->parseDay('2030-01-07');

        self::assertSame('2030-01-07 00:00:00', $day->format('Y-m-d H:i:s'));
    }

    /** Un creneau deja passe doit etre rejete immediatement, sans interroger les horaires ou les rendez-vous. */
    public function testIsSlotAvailableRejectsPastStartWithoutQueryingRepositories(): void
    {
        $this->openingHourRepository->expects(self::never())->method('findActiveByGarageAndWeekday');
        $this->unavailabilityRepository->expects(self::never())->method('findForGarageBetween');

        $available = $this->makeService()->isSlotAvailable(
            $this->makeGarage(),
            $this->makeService_(30),
            new \DateTimeImmutable('-1 hour'),
        );

        self::assertFalse($available);
    }

    /** Un creneau futur qui ne rentre dans aucune plage d'ouverture doit etre refuse. */
    public function testIsSlotAvailableRejectsSlotOutsideOpeningHours(): void
    {
        $start = new \DateTimeImmutable('+30 days 09:00');
        $this->openingHourRepository->method('findActiveByGarageAndWeekday')->willReturn([]);

        $available = $this->makeService()->isSlotAvailable($this->makeGarage(), $this->makeService_(30), $start);

        self::assertFalse($available);
    }

    /** Un creneau futur, dans les horaires d'ouverture et sans conflit, doit etre accepte. */
    public function testIsSlotAvailableReturnsTrueForFreeFutureSlotInsideOpeningHours(): void
    {
        $start = (new \DateTimeImmutable('+30 days'))->setTime(9, 0);
        $weekday = (int) $start->format('N');
        $opening = $this->makeOpeningHour($weekday, new \DateTimeImmutable('08:00'), new \DateTimeImmutable('18:00'));

        $this->openingHourRepository->method('findActiveByGarageAndWeekday')->willReturn([$opening]);
        $this->unavailabilityRepository->method('findForGarageBetween')->willReturn([]);
        $this->appointmentRepository->method('findBlockingAppointmentsForGarageBetweenExcludingAppointment')->willReturn([]);

        $available = $this->makeService()->isSlotAvailable($this->makeGarage(), $this->makeService_(30), $start);

        self::assertTrue($available);
    }
}
