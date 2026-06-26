<?php

/*
 * Ce fichier declare la migration initiale du schema MVP GarageFlow.
 * Il existe pour creer les tables Doctrine correspondant aux entites du backend.
 * Il communique avec MySQL via Doctrine Migrations, sans etre execute automatiquement dans cette mission.
 */

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Cette migration cree les tables principales du MVP GarageFlow et leurs relations.
 */
final class Version20260626030000 extends AbstractMigration
{
    /** Cette methode explique le role de la migration dans l'historique Doctrine. */
    public function getDescription(): string
    {
        return 'Create GarageFlow MVP entities schema';
    }

    /** Cette methode cree les tables, index et cles etrangeres du modele MVP. */
    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE `role` (id INT AUTO_INCREMENT NOT NULL, code VARCHAR(50) NOT NULL, libelle VARCHAR(100) NOT NULL, UNIQUE INDEX uniq_role_code (code), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE garage (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(150) NOT NULL, adresse VARCHAR(255) NOT NULL, ville VARCHAR(100) NOT NULL, code_postal VARCHAR(20) NOT NULL, telephone VARCHAR(30) DEFAULT NULL, email VARCHAR(180) DEFAULT NULL, description LONGTEXT DEFAULT NULL, logo_url VARCHAR(255) DEFAULT NULL, actif TINYINT(1) DEFAULT 1 NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, role_id INT NOT NULL, garage_id INT DEFAULT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, telephone VARCHAR(30) DEFAULT NULL, actif TINYINT(1) DEFAULT 1 NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_IDENTIFIER_ROLE (role_id), INDEX idx_user_garage (garage_id), UNIQUE INDEX uniq_user_email (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE opening_hour (id INT AUTO_INCREMENT NOT NULL, garage_id INT NOT NULL, jour_semaine SMALLINT NOT NULL, heure_debut TIME NOT NULL COMMENT \'(DC2Type:time_immutable)\', heure_fin TIME NOT NULL COMMENT \'(DC2Type:time_immutable)\', actif TINYINT(1) DEFAULT 1 NOT NULL, INDEX idx_opening_hour_garage (garage_id), PRIMARY KEY(id), CONSTRAINT chk_opening_hour_day CHECK (jour_semaine BETWEEN 1 AND 7), CONSTRAINT chk_opening_hour_time CHECK (heure_debut < heure_fin)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE unavailability (id INT AUTO_INCREMENT NOT NULL, garage_id INT NOT NULL, created_by_id INT DEFAULT NULL, date_debut DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', date_fin DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', motif VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX idx_unavailability_garage (garage_id), INDEX IDX_UNAVAILABILITY_CREATED_BY (created_by_id), PRIMARY KEY(id), CONSTRAINT chk_unavailability_dates CHECK (date_debut < date_fin)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE service_prestation (id INT AUTO_INCREMENT NOT NULL, garage_id INT NOT NULL, nom VARCHAR(150) NOT NULL, description LONGTEXT DEFAULT NULL, duree_minutes INT NOT NULL, actif TINYINT(1) DEFAULT 1 NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX idx_service_prestation_garage (garage_id), PRIMARY KEY(id), CONSTRAINT chk_service_prestation_duration CHECK (duree_minutes > 0)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE vehicle (id INT AUTO_INCREMENT NOT NULL, client_id INT NOT NULL, marque VARCHAR(100) NOT NULL, modele VARCHAR(100) NOT NULL, plaque_immatriculation VARCHAR(20) NOT NULL, kilometrage INT DEFAULT NULL, annee INT DEFAULT NULL, carburant VARCHAR(50) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX idx_vehicle_client (client_id), UNIQUE INDEX uniq_vehicle_client_plate (client_id, plaque_immatriculation), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE appointment (id INT AUTO_INCREMENT NOT NULL, garage_id INT NOT NULL, client_id INT NOT NULL, vehicle_id INT NOT NULL, service_id INT NOT NULL, date_debut DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', date_fin DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', statut VARCHAR(50) NOT NULL, commentaire_client LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX idx_appointment_garage_date (garage_id, date_debut), INDEX idx_appointment_client (client_id), INDEX idx_appointment_vehicle (vehicle_id), INDEX IDX_APPOINTMENT_SERVICE (service_id), PRIMARY KEY(id), CONSTRAINT chk_appointment_dates CHECK (date_debut < date_fin)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE intervention_status (id INT AUTO_INCREMENT NOT NULL, code VARCHAR(80) NOT NULL, libelle VARCHAR(150) NOT NULL, ordre_affichage INT NOT NULL, visible_client TINYINT(1) DEFAULT 1 NOT NULL, UNIQUE INDEX uniq_intervention_status_code (code), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE intervention (id INT AUTO_INCREMENT NOT NULL, appointment_id INT NOT NULL, statut_actuel_id INT NOT NULL, notes_resume LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', closed_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX uniq_intervention_appointment (appointment_id), INDEX IDX_INTERVENTION_STATUS (statut_actuel_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE intervention_status_history (id INT AUTO_INCREMENT NOT NULL, intervention_id INT NOT NULL, status_id INT NOT NULL, changed_by_id INT NOT NULL, commentaire LONGTEXT DEFAULT NULL, changed_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX idx_intervention_status_history_intervention (intervention_id), INDEX IDX_HISTORY_STATUS (status_id), INDEX IDX_HISTORY_CHANGED_BY (changed_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE internal_note (id INT AUTO_INCREMENT NOT NULL, intervention_id INT NOT NULL, author_id INT NOT NULL, contenu LONGTEXT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX idx_internal_note_intervention (intervention_id), INDEX IDX_INTERNAL_NOTE_AUTHOR (author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE notification (id INT AUTO_INCREMENT NOT NULL, recipient_id INT NOT NULL, appointment_id INT DEFAULT NULL, intervention_id INT DEFAULT NULL, type VARCHAR(80) NOT NULL, canal VARCHAR(20) NOT NULL, contenu LONGTEXT NOT NULL, lu TINYINT(1) DEFAULT 0 NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', read_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX idx_notification_recipient (recipient_id), INDEX IDX_NOTIFICATION_APPOINTMENT (appointment_id), INDEX IDX_NOTIFICATION_INTERVENTION (intervention_id), PRIMARY KEY(id), CONSTRAINT chk_notification_context CHECK (appointment_id IS NOT NULL OR intervention_id IS NOT NULL)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE action_log (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, garage_id INT DEFAULT NULL, action VARCHAR(150) NOT NULL, entite_concernee VARCHAR(100) DEFAULT NULL, id_entite_concernee INT DEFAULT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_ACTION_LOG_USER (user_id), INDEX idx_action_log_garage (garage_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_USER_ROLE FOREIGN KEY (role_id) REFERENCES `role` (id)');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_USER_GARAGE FOREIGN KEY (garage_id) REFERENCES garage (id)');
        $this->addSql('ALTER TABLE opening_hour ADD CONSTRAINT FK_OPENING_HOUR_GARAGE FOREIGN KEY (garage_id) REFERENCES garage (id)');
        $this->addSql('ALTER TABLE unavailability ADD CONSTRAINT FK_UNAVAILABILITY_GARAGE FOREIGN KEY (garage_id) REFERENCES garage (id)');
        $this->addSql('ALTER TABLE unavailability ADD CONSTRAINT FK_UNAVAILABILITY_CREATED_BY FOREIGN KEY (created_by_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE service_prestation ADD CONSTRAINT FK_SERVICE_PRESTATION_GARAGE FOREIGN KEY (garage_id) REFERENCES garage (id)');
        $this->addSql('ALTER TABLE vehicle ADD CONSTRAINT FK_VEHICLE_CLIENT FOREIGN KEY (client_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE appointment ADD CONSTRAINT FK_APPOINTMENT_GARAGE FOREIGN KEY (garage_id) REFERENCES garage (id)');
        $this->addSql('ALTER TABLE appointment ADD CONSTRAINT FK_APPOINTMENT_CLIENT FOREIGN KEY (client_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE appointment ADD CONSTRAINT FK_APPOINTMENT_VEHICLE FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)');
        $this->addSql('ALTER TABLE appointment ADD CONSTRAINT FK_APPOINTMENT_SERVICE FOREIGN KEY (service_id) REFERENCES service_prestation (id)');
        $this->addSql('ALTER TABLE intervention ADD CONSTRAINT FK_INTERVENTION_APPOINTMENT FOREIGN KEY (appointment_id) REFERENCES appointment (id)');
        $this->addSql('ALTER TABLE intervention ADD CONSTRAINT FK_INTERVENTION_STATUS FOREIGN KEY (statut_actuel_id) REFERENCES intervention_status (id)');
        $this->addSql('ALTER TABLE intervention_status_history ADD CONSTRAINT FK_HISTORY_INTERVENTION FOREIGN KEY (intervention_id) REFERENCES intervention (id)');
        $this->addSql('ALTER TABLE intervention_status_history ADD CONSTRAINT FK_HISTORY_STATUS FOREIGN KEY (status_id) REFERENCES intervention_status (id)');
        $this->addSql('ALTER TABLE intervention_status_history ADD CONSTRAINT FK_HISTORY_CHANGED_BY FOREIGN KEY (changed_by_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE internal_note ADD CONSTRAINT FK_INTERNAL_NOTE_INTERVENTION FOREIGN KEY (intervention_id) REFERENCES intervention (id)');
        $this->addSql('ALTER TABLE internal_note ADD CONSTRAINT FK_INTERNAL_NOTE_AUTHOR FOREIGN KEY (author_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_NOTIFICATION_RECIPIENT FOREIGN KEY (recipient_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_NOTIFICATION_APPOINTMENT FOREIGN KEY (appointment_id) REFERENCES appointment (id)');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_NOTIFICATION_INTERVENTION FOREIGN KEY (intervention_id) REFERENCES intervention (id)');
        $this->addSql('ALTER TABLE action_log ADD CONSTRAINT FK_ACTION_LOG_USER FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE action_log ADD CONSTRAINT FK_ACTION_LOG_GARAGE FOREIGN KEY (garage_id) REFERENCES garage (id)');
    }

    /** Cette methode supprime le schema cree si la migration doit etre annulee. */
    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE action_log DROP FOREIGN KEY FK_ACTION_LOG_GARAGE');
        $this->addSql('ALTER TABLE action_log DROP FOREIGN KEY FK_ACTION_LOG_USER');
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_NOTIFICATION_INTERVENTION');
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_NOTIFICATION_APPOINTMENT');
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_NOTIFICATION_RECIPIENT');
        $this->addSql('ALTER TABLE internal_note DROP FOREIGN KEY FK_INTERNAL_NOTE_AUTHOR');
        $this->addSql('ALTER TABLE internal_note DROP FOREIGN KEY FK_INTERNAL_NOTE_INTERVENTION');
        $this->addSql('ALTER TABLE intervention_status_history DROP FOREIGN KEY FK_HISTORY_CHANGED_BY');
        $this->addSql('ALTER TABLE intervention_status_history DROP FOREIGN KEY FK_HISTORY_STATUS');
        $this->addSql('ALTER TABLE intervention_status_history DROP FOREIGN KEY FK_HISTORY_INTERVENTION');
        $this->addSql('ALTER TABLE intervention DROP FOREIGN KEY FK_INTERVENTION_STATUS');
        $this->addSql('ALTER TABLE intervention DROP FOREIGN KEY FK_INTERVENTION_APPOINTMENT');
        $this->addSql('ALTER TABLE appointment DROP FOREIGN KEY FK_APPOINTMENT_SERVICE');
        $this->addSql('ALTER TABLE appointment DROP FOREIGN KEY FK_APPOINTMENT_VEHICLE');
        $this->addSql('ALTER TABLE appointment DROP FOREIGN KEY FK_APPOINTMENT_CLIENT');
        $this->addSql('ALTER TABLE appointment DROP FOREIGN KEY FK_APPOINTMENT_GARAGE');
        $this->addSql('ALTER TABLE vehicle DROP FOREIGN KEY FK_VEHICLE_CLIENT');
        $this->addSql('ALTER TABLE service_prestation DROP FOREIGN KEY FK_SERVICE_PRESTATION_GARAGE');
        $this->addSql('ALTER TABLE unavailability DROP FOREIGN KEY FK_UNAVAILABILITY_CREATED_BY');
        $this->addSql('ALTER TABLE unavailability DROP FOREIGN KEY FK_UNAVAILABILITY_GARAGE');
        $this->addSql('ALTER TABLE opening_hour DROP FOREIGN KEY FK_OPENING_HOUR_GARAGE');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_USER_GARAGE');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_USER_ROLE');
        $this->addSql('DROP TABLE action_log');
        $this->addSql('DROP TABLE notification');
        $this->addSql('DROP TABLE internal_note');
        $this->addSql('DROP TABLE intervention_status_history');
        $this->addSql('DROP TABLE intervention');
        $this->addSql('DROP TABLE intervention_status');
        $this->addSql('DROP TABLE appointment');
        $this->addSql('DROP TABLE vehicle');
        $this->addSql('DROP TABLE service_prestation');
        $this->addSql('DROP TABLE unavailability');
        $this->addSql('DROP TABLE opening_hour');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE garage');
        $this->addSql('DROP TABLE `role`');
    }
}