/*
 * Ce fichier teste la page interventions du frontend GarageFlow.
 * Il existe pour verifier que le pipeline atelier affiche les colonnes et garde la mise a jour de statut.
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

const intervention = {
  id: 8,
  createdAt: '2026-07-01T11:00:00+02:00',
  closedAt: null,
  statutActuel: { code: 'DIAGNOSTIC_EN_COURS', libelle: 'Diagnostic en cours' },
  client: { id: 2, prenom: 'Lea', nom: 'Martin', email: 'lea@example.test' },
  vehicle: { id: 3, marque: 'Renault', modele: 'Clio' },
  service: { id: 4, nom: 'Revision' },
};

describe('InterventionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    interventionApiMock.getGarageInterventions.mockResolvedValue([intervention]);
    interventionApiMock.getInterventionNotes.mockResolvedValue([]);
    interventionApiMock.updateInterventionStatus.mockResolvedValue(intervention);
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

  /** Ce test verifie que le select de statut pilote l'appel API de mise a jour. */
  it('permet de selectionner un statut et de le soumettre', async () => {
    const user = userEvent.setup();

    render(<InterventionsPage />);

    const select = await screen.findByLabelText('Nouveau statut');
    await user.selectOptions(select, 'VEHICULE_PRET');
    await user.click(screen.getByRole('button', { name: 'Mettre a jour' }));

    expect(interventionApiMock.updateInterventionStatus).toHaveBeenCalledWith(8, 'VEHICULE_PRET', undefined);
  });
});
