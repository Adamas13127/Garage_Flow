/*
 * Ce fichier teste la page interventions du frontend GarageFlow.
 * Il existe pour verifier que la liste Atelier filtrable garde le detail, la timeline, le changement de statut et les notes.
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
  appointment: { id: 80, dateDebut: '2026-07-01T09:00:00+02:00', statut: 'CONFIRME' },
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
  { ...baseIntervention, id: 12, closedAt: '2026-07-03T15:00:00+02:00', statutActuel: { code: 'VEHICULE_RECUPERE', libelle: 'Vehicule recupere' }, vehicle: { id: 8, marque: 'Ford', modele: 'Focus', plaqueImmatriculation: 'EE-222-EE' } },
];

describe('InterventionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    interventionApiMock.getGarageInterventions.mockResolvedValue(interventions);
    interventionApiMock.getInterventionNotes.mockResolvedValue([]);
    interventionApiMock.updateInterventionStatus.mockResolvedValue(baseIntervention);
  });

  /** Ce test verifie que les compteurs atelier restent visibles. */
  it('affiche les compteurs atelier', async () => {
    render(<InterventionsPage />);

    expect(await screen.findByText('Vehicules en atelier')).toBeInTheDocument();
    expect(screen.getByText('Prets a restituer')).toBeInTheDocument();
    expect(screen.getByText('En reparation')).toBeInTheDocument();
    expect(screen.getByText('En attente client')).toBeInTheDocument();
  });

  /** Ce test verifie que les filtres de liste sont disponibles. */
  it('affiche les filtres de statut', async () => {
    render(<InterventionsPage />);

    expect(await screen.findByRole('button', { name: 'Tous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'A traiter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'En cours' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prets' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Termines' })).toBeInTheDocument();
  });

  /** Ce test verifie que le filtre En cours masque les interventions pretes ou terminees. */
  it('filtre les interventions en cours avec les donnees mockees', async () => {
    const user = userEvent.setup();
    render(<InterventionsPage />);

    await user.click(await screen.findByRole('button', { name: 'En cours' }));

    expect(screen.getByText(/Renault Clio/i)).toBeInTheDocument();
    expect(screen.getByText(/Citroen C3/i)).toBeInTheDocument();
    expect(screen.queryByText(/Peugeot 308/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ford Focus/i)).not.toBeInTheDocument();
  });

  /** Ce test verifie que la carte affiche les informations metier principales. */
  it('affiche vehicule client prestation et statut dans une carte', async () => {
    render(<InterventionsPage />);

    expect(await screen.findByText(/Renault Clio/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lea Martin/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Revision/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Diagnostic en cours')).toBeInTheDocument();
  });

  /** Ce test verifie que le formulaire de changement de statut est cache par defaut. */
  it('n affiche pas le formulaire de statut par defaut', async () => {
    render(<InterventionsPage />);

    expect(await screen.findByText(/Renault Clio/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Nouveau statut')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Commentaire optionnel')).not.toBeInTheDocument();
  });

  /** Ce test verifie que Changer statut affiche le select et le commentaire. */
  it('ouvre le panneau de changement de statut au clic', async () => {
    const user = userEvent.setup();
    render(<InterventionsPage />);

    await user.click((await screen.findAllByRole('button', { name: 'Changer statut' }))[0]);

    expect(screen.getByLabelText('Nouveau statut')).toBeInTheDocument();
    expect(screen.getByLabelText('Commentaire optionnel')).toBeInTheDocument();
  });

  /** Ce test verifie que Annuler referme le formulaire de statut. */
  it('ferme le panneau de statut au clic sur Annuler', async () => {
    const user = userEvent.setup();
    render(<InterventionsPage />);

    await user.click((await screen.findAllByRole('button', { name: 'Changer statut' }))[0]);
    await user.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByLabelText('Nouveau statut')).not.toBeInTheDocument();
  });

  /** Ce test verifie que la confirmation de statut utilise l'API existante. */
  it('confirme le changement de statut avec l API existante', async () => {
    const user = userEvent.setup();
    render(<InterventionsPage />);

    await user.click((await screen.findAllByRole('button', { name: 'Changer statut' }))[0]);
    await user.selectOptions(screen.getByLabelText('Nouveau statut'), 'VEHICULE_PRET');
    await user.click(screen.getByRole('button', { name: 'Confirmer' }));

    expect(interventionApiMock.updateInterventionStatus).toHaveBeenCalledWith(8, 'VEHICULE_PRET', undefined);
  });

  /** Ce test verifie que le detail affiche la timeline de reparation. */
  it('affiche le detail intervention avec la timeline', async () => {
    const user = userEvent.setup();
    render(<InterventionsPage />);

    await user.click((await screen.findAllByRole('button', { name: 'Voir detail' }))[0]);

    expect(screen.getByText('Timeline reparation')).toBeInTheDocument();
    expect(screen.getByText('Vehicule depose')).toBeInTheDocument();
    expect(screen.getAllByText('Reparation en cours').length).toBeGreaterThan(0);
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
