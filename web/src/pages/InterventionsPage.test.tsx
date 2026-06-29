/*
 * Ce fichier teste la page interventions du frontend GarageFlow.
 * Il existe pour verifier que le pipeline atelier reste lisible et que les actions s'ouvrent seulement a la demande.
 * Il communique avec InterventionsPage et interventionApi.ts mocke.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InterventionsPage } from './InterventionsPage';

const interventionApiMock = vi.hoisted(() => ({
  createInterventionNote: vi.fn(),
  deleteInterventionNote: vi.fn(),
  getGarageInterventions: vi.fn(),
  getInterventionNotes: vi.fn(),
  updateInterventionNote: vi.fn(),
  updateInterventionStatus: vi.fn(),
}));

vi.mock('../api/interventionApi', () => interventionApiMock);

const baseIntervention = {
  id: 8,
  createdAt: '2026-07-01T11:00:00+02:00',
  closedAt: null,
  statutActuel: { code: 'DIAGNOSTIC_EN_COURS', libelle: 'Diagnostic en cours' },
  client: { id: 2, prenom: 'Lea', nom: 'Martin', email: 'lea@example.test' },
  vehicle: { id: 3, marque: 'Renault', modele: 'Clio', plaqueImmatriculation: 'AA-123-AA' },
  service: { id: 4, nom: 'Revision' },
};

const interventions = [
  baseIntervention,
  { ...baseIntervention, id: 9, statutActuel: { code: 'VEHICULE_PRET', libelle: 'Vehicule pret' }, vehicle: { id: 5, marque: 'Peugeot', modele: '308', plaqueImmatriculation: 'BB-456-BB' } },
  { ...baseIntervention, id: 10, statutActuel: { code: 'REPARATION_EN_COURS', libelle: 'Reparation en cours' }, vehicle: { id: 6, marque: 'Citroen', modele: 'C3', plaqueImmatriculation: 'CC-789-CC' } },
  { ...baseIntervention, id: 11, statutActuel: { code: 'ATTENTE_VALIDATION_CLIENT', libelle: 'Attente validation client' }, vehicle: { id: 7, marque: 'Toyota', modele: 'Yaris', plaqueImmatriculation: 'DD-111-DD' } },
];

describe('InterventionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    interventionApiMock.getGarageInterventions.mockResolvedValue(interventions);
    interventionApiMock.getInterventionNotes.mockResolvedValue([]);
    interventionApiMock.updateInterventionStatus.mockResolvedValue(baseIntervention);
  });

  /** Ce test verifie que les colonnes du pipeline atelier sont visibles. */
  it('affiche les colonnes du pipeline', async () => {
    render(<InterventionsPage />);

    expect((await screen.findAllByText('Depose')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Diagnostic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Validation client').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reparation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pret').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Recupere').length).toBeGreaterThan(0);
  });

  /** Ce test verifie que le resume haut de page affiche les bons compteurs. */
  it('affiche le resume atelier avec les bons compteurs', async () => {
    render(<InterventionsPage />);

    expect(await screen.findByText('Vehicules en atelier')).toBeInTheDocument();
    expect(screen.getByText('Prets a restituer')).toBeInTheDocument();
    expect(screen.getByText('En reparation')).toBeInTheDocument();
    expect(screen.getByText('En attente client')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  /** Ce test verifie que les cartes ne montrent pas le formulaire de statut par defaut. */
  it('n affiche pas le formulaire de statut par defaut', async () => {
    render(<InterventionsPage />);

    expect(await screen.findByText(/Renault Clio/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Nouveau statut')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Commentaire optionnel')).not.toBeInTheDocument();
  });

  /** Ce test verifie que le clic sur Changer statut ouvre le select et le commentaire. */
  it('ouvre le panneau de changement de statut au clic', async () => {
    const user = userEvent.setup();
    render(<InterventionsPage />);

    await user.click((await screen.findAllByRole('button', { name: 'Changer statut' }))[0]);

    expect(screen.getByLabelText('Nouveau statut')).toBeInTheDocument();
    expect(screen.getByLabelText('Commentaire optionnel')).toBeInTheDocument();
  });

  /** Ce test verifie que le bouton Annuler referme le panneau. */
  it('ferme le panneau de changement de statut au clic sur Annuler', async () => {
    const user = userEvent.setup();
    render(<InterventionsPage />);

    await user.click((await screen.findAllByRole('button', { name: 'Changer statut' }))[0]);
    await user.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByLabelText('Nouveau statut')).not.toBeInTheDocument();
  });

  /** Ce test verifie que la mise a jour de statut appelle l'API existante. */
  it('confirme le changement de statut avec l API existante', async () => {
    const user = userEvent.setup();
    render(<InterventionsPage />);

    await user.click((await screen.findAllByRole('button', { name: 'Changer statut' }))[0]);
    await user.selectOptions(screen.getByLabelText('Nouveau statut'), 'VEHICULE_PRET');
    await user.click(screen.getByRole('button', { name: 'Confirmer' }));

    expect(interventionApiMock.updateInterventionStatus).toHaveBeenCalledWith(8, 'VEHICULE_PRET', undefined);
  });

  /** Ce test verifie que le clic sur Notes ouvre le panneau de notes internes. */
  it('ouvre les notes internes au clic sur Notes', async () => {
    const user = userEvent.setup();
    render(<InterventionsPage />);

    await user.click((await screen.findAllByRole('button', { name: 'Notes' }))[0]);

    expect(screen.getByText('Notes internes - non visibles par le client')).toBeInTheDocument();
    expect(interventionApiMock.getInterventionNotes).toHaveBeenCalledWith(8);
  });
});
