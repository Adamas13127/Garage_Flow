<?php

/*
 * Ce fichier declare une migration ajoutant des declencheurs SQL au schema GarageFlow.
 * Il existe pour satisfaire l'exigence du referentiel RNCP36463 de garantir l'acces aux
 * donnees par l'usage de contraintes d'integrite ET de declencheurs, pas seulement l'un ou l'autre.
 * Il communique avec les tables notification, user et action_log via MySQL.
 */

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260816200000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add SQL triggers: notification link check, user sensitive-change audit';
    }

    public function up(Schema $schema): void
    {
        // Declencheur de controle : une notification doit toujours etre rattachee a un rendez-vous
        // ou a une intervention. Cette regle figure dans le MLD mais n'etait appliquee que par
        // App\Service\NotificationService::createForUser() (les deux parametres y sont optionnels) --
        // un insert ou update SQL direct pouvait donc la contourner.
        $this->addSql(<<<'SQL'
            CREATE TRIGGER trg_notification_check_link_insert
            BEFORE INSERT ON notification
            FOR EACH ROW
            BEGIN
                IF NEW.appointment_id IS NULL AND NEW.intervention_id IS NULL THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'notification.appointment_id ou notification.intervention_id doit etre renseigne.';
                END IF;
            END
            SQL);

        $this->addSql(<<<'SQL'
            CREATE TRIGGER trg_notification_check_link_update
            BEFORE UPDATE ON notification
            FOR EACH ROW
            BEGIN
                IF NEW.appointment_id IS NULL AND NEW.intervention_id IS NULL THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'notification.appointment_id ou notification.intervention_id doit etre renseigne.';
                END IF;
            END
            SQL);

        // Declencheur d'audit : toute modification du role ou de l'etat actif d'un utilisateur est
        // journalisee dans action_log automatiquement, quel que soit le chemin d'acces emprunte
        // (ORM applicatif, script de maintenance, requete SQL directe). Aucun service applicatif
        // n'ecrivait dans action_log avant ce declencheur : la table existait sans etre alimentee.
        // Le declencheur ne connait pas l'utilisateur applicatif a l'origine du changement (JWT) --
        // seule la connexion MySQL le sait -- donc action_log.user_id reste NULL ; l'entite modifiee
        // et l'ancienne/nouvelle valeur suffisent a la tracabilite recherchee ici.
        $this->addSql(<<<'SQL'
            CREATE TRIGGER trg_user_audit_sensitive_changes
            AFTER UPDATE ON `user`
            FOR EACH ROW
            BEGIN
                IF NOT (OLD.role_id <=> NEW.role_id) OR NOT (OLD.actif <=> NEW.actif) THEN
                    INSERT INTO action_log (garage_id, action, entite_concernee, id_entite_concernee, description, created_at)
                    VALUES (
                        NEW.garage_id,
                        'USER_SENSITIVE_UPDATE',
                        'User',
                        NEW.id,
                        CONCAT(
                            'role_id: ', IFNULL(OLD.role_id, 'NULL'), ' -> ', IFNULL(NEW.role_id, 'NULL'),
                            ' ; actif: ', OLD.actif, ' -> ', NEW.actif
                        ),
                        NOW()
                    );
                END IF;
            END
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TRIGGER IF EXISTS trg_user_audit_sensitive_changes');
        $this->addSql('DROP TRIGGER IF EXISTS trg_notification_check_link_update');
        $this->addSql('DROP TRIGGER IF EXISTS trg_notification_check_link_insert');
    }
}
