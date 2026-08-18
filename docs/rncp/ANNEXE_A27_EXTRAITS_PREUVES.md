<!--
Ce fichier est le recueil d'extraits de preuve du projet GarageFlow, annexe A27 du dossier RNCP36463.
Il existe pour rassembler, dans un document imprimable, des extraits courts de code et des sorties
d'outils reelles servant de preuve aux competences du referentiel.
Il communique avec le code source backend/src, les migrations, et les sorties reelles des outils
qualite executees le 18 aout 2026.
-->

# Annexe A27 — Extraits de code et sorties d'outils

Tous les extraits ci-dessous sont des copies verbatim du code réel du dépôt ou des sorties réelles
d'outils exécutés le 18 août 2026, sur `feat/rncp-triggers-i18n-export`. Chaque extrait est précédé
d'une phrase indiquant ce qu'il prouve.

---

## 1. Découpage de plage et exclusions — calcul de disponibilité

Cet extrait prouve que le calcul des créneaux disponibles découpe une plage d'ouverture par pas de
30 minutes selon la durée de la prestation, puis exclut les créneaux passés, en conflit avec une
indisponibilité, ou avec un rendez-vous existant, avant de les proposer au client.

`backend/src/Service/AvailabilityService.php`, méthode `getAvailableSlots()` :

```php
public function getAvailableSlots(int $garageId, int $serviceId, string $date): array
{
    $garage = $this->getActiveGarage($garageId);
    $service = $this->getActiveServiceForGarage($garage, $serviceId);
    $day = $this->parseDay($date);
    $weekday = (int) $day->format('N');
    $slots = [];
    $now = new \DateTimeImmutable();

    foreach ($this->openingHourRepository->findActiveByGarageAndWeekday($garage, $weekday) as $openingHour) {
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
```

---

## 2. Requête métier d'un dépôt (repository)

Cet extrait prouve l'usage du QueryBuilder Doctrine pour une requête métier à jointures et filtres
optionnels : la liste des interventions d'un garage, filtrable par code de statut et par date de
rendez-vous.

`backend/src/Repository/InterventionRepository.php`, méthode `findByGarageWithFilters()` :

```php
public function findByGarageWithFilters(Garage $garage, ?string $statusCode, ?\DateTimeImmutable $date): array
{
    $queryBuilder = $this->createQueryBuilder('intervention')
        ->join('intervention.appointment', 'appointment')
        ->join('intervention.statutActuel', 'status')
        ->andWhere('appointment.garage = :garage')
        ->setParameter('garage', $garage)
        ->orderBy('appointment.dateDebut', 'DESC');

    if (null !== $statusCode && '' !== $statusCode) {
        $queryBuilder
            ->andWhere('status.code = :statusCode')
            ->setParameter('statusCode', $statusCode);
    }

    if ($date instanceof \DateTimeImmutable) {
        $queryBuilder
            ->andWhere('appointment.dateDebut >= :dayStart')
            ->andWhere('appointment.dateDebut < :dayEnd')
            ->setParameter('dayStart', $date->setTime(0, 0))
            ->setParameter('dayEnd', $date->setTime(0, 0)->modify('+1 day'));
    }

    return $queryBuilder->getQuery()->getResult();
}
```

---

## 3. Test unitaire avec doublures (mocks)

Cet extrait prouve qu'un test unitaire du calcul de disponibilité s'exécute sans base de données ni
conteneur Symfony : les cinq dépôts dont dépend `AvailabilityService` sont remplacés par des doublures
PHPUnit (`createMock`), dont une pilotée par un `willReturnCallback` pour ne bloquer qu'un seul des
deux créneaux testés.

`backend/tests/Unit/AvailabilityServiceTest.php` :

```php
protected function setUp(): void
{
    $this->garageRepository = $this->createMock(GarageRepository::class);
    $this->serviceRepository = $this->createMock(ServicePrestationRepository::class);
    $this->openingHourRepository = $this->createMock(OpeningHourRepository::class);
    $this->unavailabilityRepository = $this->createMock(UnavailabilityRepository::class);
    $this->appointmentRepository = $this->createMock(AppointmentRepository::class);
}

/** Un creneau qui chevauche une indisponibilite du garage doit etre exclu du resultat. */
public function testGetAvailableSlotsSkipsSlotOverlappingUnavailability(): void
{
    // ... garage, service et horaire 09:00-10:00 construits en memoire ...
    $this->appointmentRepository->method('findBlockingAppointmentsForGarageBetweenExcludingAppointment')->willReturn([]);
    // Seul le creneau 09:30-10:00 est bloque par une indisponibilite.
    $this->unavailabilityRepository->method('findForGarageBetween')->willReturnCallback(
        fn (Garage $g, \DateTimeImmutable $start, \DateTimeImmutable $end): array => '09:30:00' === $start->format('H:i:s') ? ['bloque'] : []
    );

    $slots = $this->makeService()->getAvailableSlots(1, 1, $day->format('Y-m-d'));

    self::assertCount(1, $slots);
    self::assertStringContainsString('09:00:00', $slots[0]['dateDebut']);
}
```

---

## 4. Séparation client / garage dans la sérialisation d'un rendez-vous

Ce backend n'a pas de couche de DTO de sortie dédiée (voir `docs/technique/DICTIONNAIRE_DONNEES.md`) :
la séparation entre ce que voit le client et ce que voit le garage est appliquée par deux méthodes de
sérialisation distinctes. Cet extrait prouve que les coordonnées du client (nom, email, téléphone) ne
sont jamais renvoyées au client lui-même (elles seraient redondantes), mais le sont au garage qui a
besoin de le contacter.

`ClientAppointmentController::serializeAppointment()` (le client voit son propre rendez-vous) :

```php
return [
    'id' => $appointment->getId(),
    'garage' => ['id' => $appointment->getGarage()?->getId(), 'nom' => $appointment->getGarage()?->getNom()],
    'vehicle' => ['id' => ..., 'marque' => ..., 'modele' => ..., 'plaqueImmatriculation' => ...],
    // pas de champ "client" : c'est l'utilisateur authentifie lui-meme
];
```

`GarageAppointmentController::serializeAppointment()` (le garage voit la demande d'un client) :

```php
return [
    'id' => $appointment->getId(),
    'statut' => $appointment->getStatut(),
    'client' => [
        'id' => $appointment->getClient()?->getId(),
        'nom' => $appointment->getClient()?->getNom(),
        'prenom' => $appointment->getClient()?->getPrenom(),
        'email' => $appointment->getClient()?->getEmail(),
        'telephone' => $appointment->getClient()?->getTelephone(),
    ],
    // ...
];
```

---

## 5. Script SQL des déclencheurs

Cet extrait est le script SQL réel exécuté par la migration `Version20260816200000.php`, qui crée les
deux déclencheurs exigés par le référentiel (le déclencheur de contrôle sur `notification` est posé en
double, `INSERT` et `UPDATE`, pour couvrir les deux chemins d'écriture ; seul le corps `INSERT` est
reproduit ici, celui d'`UPDATE` est identique).

```sql
CREATE TRIGGER trg_notification_check_link_insert
BEFORE INSERT ON notification
FOR EACH ROW
BEGIN
    IF NEW.appointment_id IS NULL AND NEW.intervention_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'notification.appointment_id ou notification.intervention_id doit etre renseigne.';
    END IF;
END

CREATE TRIGGER trg_user_audit_sensitive_changes
AFTER UPDATE ON `user`
FOR EACH ROW
BEGIN
    IF NOT (OLD.role_id <=> NEW.role_id) OR NOT (OLD.actif <=> NEW.actif) THEN
        INSERT INTO action_log (garage_id, action, entite_concernee, id_entite_concernee, description, created_at)
        VALUES (
            NEW.garage_id, 'USER_SENSITIVE_UPDATE', 'User', NEW.id,
            CONCAT('role_id: ', IFNULL(OLD.role_id, 'NULL'), ' -> ', IFNULL(NEW.role_id, 'NULL'),
                   ' ; actif: ', OLD.actif, ' -> ', NEW.actif),
            NOW()
        );
    END IF;
END
```

---

## 6. Sortie complète de la suite de tests

Cette sortie prouve que les 65 tests automatisés du backend passent, exécutés le 18 août 2026 contre
une base MySQL 8.0 réelle (Docker).

```
PHPUnit 11.5.55 by Sebastian Bergmann and contributors.

Runtime:       PHP 8.2.12
Configuration: C:\Users\ysemm\Documents\Projet_Semmache_Yannis\backend\phpunit.dist.xml

......................................................................... 65 / 65 (100%)

Time: 00:42.375, Memory: 48.00 MB

OK (65 tests, 359 assertions)
```

---

## 7. Sortie de l'analyse statique

Cette sortie prouve que PHPStan niveau 6 (avec l'extension `phpstan-doctrine`) ne relève aucune
erreur sur l'ensemble du code source backend.

```
Note: Using configuration file backend/phpstan.neon.

 [OK] No errors
```

---

## 8. Sortie du contrôle de formatage

Cette sortie prouve que PHP-CS-Fixer (jeu de règles `@Symfony`), exécuté en mode `--dry-run` sur les
112 fichiers PHP du backend, n'a rien à corriger.

```
PHP CS Fixer 3.95.18 Adalbertus by Fabien Potencier, Dariusz Ruminski and contributors.
PHP runtime: 8.2.12
Loaded config default from ".php-cs-fixer.dist.php".
Running analysis on 11 cores with 10 files per process.

Found 0 of 112 files that can be fixed in 3.671 seconds, 40.00 MB memory used
```

---

## 9. Résultat de `SHOW TRIGGERS`

Cette sortie prouve que les deux déclencheurs sont réellement créés dans la base `garageflow` en
cours d'exécution (Docker, MySQL 8.0), et pas seulement écrits dans une migration jamais appliquée.

```
Trigger: trg_notification_check_link_insert | Event: INSERT | Table: notification | Timing: BEFORE
Trigger: trg_notification_check_link_update | Event: UPDATE | Table: notification | Timing: BEFORE
Trigger: trg_user_audit_sensitive_changes    | Event: UPDATE | Table: user         | Timing: AFTER
Definer (les trois) : garageflow@%
```

---

## 10. Tentative d'insertion invalide et message de rejet

Cette sortie prouve, par une exécution réelle et non par lecture du code, que le déclencheur de
contrôle rejette bien une notification sans rendez-vous ni intervention associés, avec le message
personnalisé défini dans le trigger — pas un message MySQL générique.

```
mysql> INSERT INTO notification (recipient_id, appointment_id, intervention_id, type, canal, contenu, lu, created_at)
    -> VALUES (1, NULL, NULL, 'RDV_DEMANDE', 'APP', 'Test invalide', 0, NOW());
ERROR 1644 (45000) at line 3: notification.appointment_id ou notification.intervention_id doit etre renseigne.
```

---

Branche courante : `feat/rncp-triggers-i18n-export`.
