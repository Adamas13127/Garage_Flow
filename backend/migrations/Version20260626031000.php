<?php

/*
 * Ce fichier declare une migration de synchronisation du schema GarageFlow.
 * Il existe pour aligner la base MySQL avec le mapping Doctrine valide des entites.
 * Il communique avec Doctrine Migrations et ne change aucune fonctionnalite metier.
 */

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Cette migration corrige les ecarts techniques detectes par doctrine:schema:validate.
 */
final class Version20260626031000 extends AbstractMigration
{
    /** Cette methode decrit la synchronisation technique appliquee au schema. */
    public function getDescription(): string
    {
        return 'Synchronize MySQL schema with Doctrine entity mapping';
    }

    /** Cette methode aligne les colonnes DateTimeImmutable et les noms d index attendus par Doctrine. */
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE action_log CHANGE created_at created_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE action_log RENAME INDEX idx_action_log_user TO IDX_B2C5F685A76ED395');
        $this->addSql('ALTER TABLE appointment CHANGE date_debut date_debut DATETIME NOT NULL, CHANGE date_fin date_fin DATETIME NOT NULL, CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE appointment RENAME INDEX idx_appointment_service TO IDX_FE38F844ED5CA9E6');
        $this->addSql('ALTER TABLE garage CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE internal_note CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE internal_note RENAME INDEX idx_internal_note_author TO IDX_233D6BDFF675F31B');
        $this->addSql('ALTER TABLE intervention CHANGE created_at created_at DATETIME NOT NULL, CHANGE closed_at closed_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE intervention RENAME INDEX idx_intervention_status TO IDX_D11814ABA831773D');
        $this->addSql('ALTER TABLE intervention_status_history CHANGE changed_at changed_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE intervention_status_history RENAME INDEX idx_history_status TO IDX_BDA68DD96BF700BD');
        $this->addSql('ALTER TABLE intervention_status_history RENAME INDEX idx_history_changed_by TO IDX_BDA68DD9828AD0A0');
        $this->addSql('ALTER TABLE notification CHANGE created_at created_at DATETIME NOT NULL, CHANGE read_at read_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE notification RENAME INDEX idx_notification_appointment TO IDX_BF5476CAE5B533F9');
        $this->addSql('ALTER TABLE notification RENAME INDEX idx_notification_intervention TO IDX_BF5476CA8EAE3863');
        $this->addSql('ALTER TABLE opening_hour CHANGE heure_debut heure_debut TIME NOT NULL, CHANGE heure_fin heure_fin TIME NOT NULL');
        $this->addSql('ALTER TABLE service_prestation CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE unavailability CHANGE date_debut date_debut DATETIME NOT NULL, CHANGE date_fin date_fin DATETIME NOT NULL, CHANGE created_at created_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE unavailability RENAME INDEX idx_unavailability_created_by TO IDX_F0016D1B03A8386');
        $this->addSql('ALTER TABLE `user` CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE `user` RENAME INDEX idx_identifier_role TO IDX_8D93D649D60322AC');
        $this->addSql('ALTER TABLE vehicle CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL');
    }

    /** Cette methode inverse les changements techniques si la migration est annulee. */
    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE vehicle CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE updated_at updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE `user` RENAME INDEX IDX_8D93D649D60322AC TO idx_identifier_role');
        $this->addSql('ALTER TABLE `user` CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE updated_at updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE unavailability RENAME INDEX IDX_F0016D1B03A8386 TO idx_unavailability_created_by');
        $this->addSql('ALTER TABLE unavailability CHANGE date_debut date_debut DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE date_fin date_fin DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE service_prestation CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE updated_at updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE opening_hour CHANGE heure_debut heure_debut TIME NOT NULL COMMENT \'(DC2Type:time_immutable)\', CHANGE heure_fin heure_fin TIME NOT NULL COMMENT \'(DC2Type:time_immutable)\'');
        $this->addSql('ALTER TABLE notification RENAME INDEX IDX_BF5476CA8EAE3863 TO idx_notification_intervention');
        $this->addSql('ALTER TABLE notification RENAME INDEX IDX_BF5476CAE5B533F9 TO idx_notification_appointment');
        $this->addSql('ALTER TABLE notification CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE read_at read_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE intervention_status_history RENAME INDEX IDX_BDA68DD9828AD0A0 TO idx_history_changed_by');
        $this->addSql('ALTER TABLE intervention_status_history RENAME INDEX IDX_BDA68DD96BF700BD TO idx_history_status');
        $this->addSql('ALTER TABLE intervention_status_history CHANGE changed_at changed_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE intervention RENAME INDEX IDX_D11814ABA831773D TO idx_intervention_status');
        $this->addSql('ALTER TABLE intervention CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE closed_at closed_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE internal_note RENAME INDEX IDX_233D6BDFF675F31B TO idx_internal_note_author');
        $this->addSql('ALTER TABLE internal_note CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE updated_at updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE garage CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE updated_at updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE appointment RENAME INDEX IDX_FE38F844ED5CA9E6 TO idx_appointment_service');
        $this->addSql('ALTER TABLE appointment CHANGE date_debut date_debut DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE date_fin date_fin DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE updated_at updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE action_log RENAME INDEX IDX_B2C5F685A76ED395 TO idx_action_log_user');
        $this->addSql('ALTER TABLE action_log CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }
}