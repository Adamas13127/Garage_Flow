/*
 * Ce fichier teste le dashboard cockpit garage connecte a des donnees mockees.
 * Il existe pour verifier que la page affiche les priorites metier et les listes utiles au gerant.
 * Il communique avec DashboardPage et les modules API mockes par Vitest.
 */
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, prenom: 'Yannis', nom: 'Semmache', email: 'yannis@example.test', roles: ['ROLE_GERANT'] } }),
}));

vi.mock('../api/garageApi', () => ({
  getMyGarage: vi.fn(async () => ({ id: 1, nom: 'Garage Central', adresse: '1 rue Test', codePostal: '75000', ville: 'Paris' })),
}));

vi.mock('../api/appointmentApi', () => ({
  getGarageAppointments: vi.fn(async () => [
    { id: 1, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T09:00:00+02:00', client: { id: 2, prenom: 'Lea', nom: 'Martin', email: 'lea@example.test' }, vehicle: { id: 3, marque: 'Renault', modele: 'Clio' }, service: { id: 4, nom: 'Revision' } },
    { id: 2, statut: 'CONFIRME', dateDebut: '2026-07-02T10:00:00+02:00', client: { id: 5, prenom: 'Paul', nom: 'Durand', email: 'paul@example.test' }, vehicle: { id: 6, marque: 'Peugeot', modele: '208' }, service: { id: 7, nom: 'Freinage' } },
  ]),
}));

vi.mock('../api/interventionApi', () => ({
  getGarageInterventions: vi.fn(async () => [
    { id: 8, createdAt: '2026-07-01T11:00:00+02:00', closedAt: null, statutActuel: { code: 'REPARATION_EN_COURS', libelle: 'Reparation en cours' }, client: { id: 2, prenom: 'Lea', nom: 'Martin', email: 'lea@example.test' }, vehicle: { id: 3, marque: 'Renault', modele: 'Clio' }, service: { id: 4, nom: 'Revision' } },
  ]),
}));

vi.mock('../api/notificationApi', () => ({
  getNotifications: vi.fn(async () => [
    { id: 9, type: 'RENDEZ_VOUS', contenu: 'Nouveau rendez-vous', lu: false, createdAt: '2026-07-01T12:00:00+02:00' },
  ]),
}));

describe('DashboardPage', () => {
  /** Ce test verifie que le dashboard affiche les actions prioritaires avec donnees mockees. */
  it('affiche les actions prioritaires avec les donnees mockees', async () => {
    render(<DashboardPage />);

    expect(screen.getByText(/chargement du dashboard garage/i)).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText(/chargement du dashboard garage/i));

    expect(screen.getByText('Cockpit garage')).toBeInTheDocument();
    expect(screen.getByText('Demandes a valider')).toBeInTheDocument();
    expect(screen.getByText('Planning du jour')).toBeInTheDocument();
    expect(screen.getAllByText('Vehicules en atelier').length).toBeGreaterThan(0);
    expect(screen.getByText(/1 demande\(s\) de RDV a valider/i)).toBeInTheDocument();
  });
});
