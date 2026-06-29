/*
 * Ce fichier teste la page rendez-vous du frontend GarageFlow.
 * Il existe pour verifier les demandes, le planning et les actions sans appeler le vrai backend.
 * Il communique avec AppointmentsPage et appointmentApi.ts mocke.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentsPage } from './AppointmentsPage';

const appointmentApiMock = vi.hoisted(() => ({
  acceptAppointment: vi.fn(),
  getGarageAppointments: vi.fn(),
  refuseAppointment: vi.fn(),
}));

vi.mock('../api/appointmentApi', () => appointmentApiMock);

const pendingAppointment = { id: 1, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T09:00:00+02:00', commentaireClient: 'Besoin rapide', client: { id: 2, prenom: 'Lea', nom: 'Martin', email: 'lea@example.test' }, vehicle: { id: 3, marque: 'Renault', modele: 'Clio' }, service: { id: 4, nom: 'Revision' } };
const confirmedAppointment = { ...pendingAppointment, id: 2, statut: 'CONFIRME', dateDebut: '2026-07-02T10:00:00+02:00', commentaireClient: null };
const refusedAppointment = { ...pendingAppointment, id: 3, statut: 'REFUSE', dateDebut: '2026-06-28T10:00:00+02:00' };

describe('AppointmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appointmentApiMock.acceptAppointment.mockResolvedValue(pendingAppointment);
    appointmentApiMock.refuseAppointment.mockResolvedValue(pendingAppointment);
    appointmentApiMock.getGarageAppointments.mockResolvedValue([]);
  });

  /** Ce test verifie que la page explique proprement l'absence de rendez-vous. */
  it('affiche un etat vide si aucun rendez-vous existe', async () => {
    render(<AppointmentsPage />);

    expect(await screen.findByText('Aucun rendez-vous')).toBeInTheDocument();
  });

  /** Ce test verifie que les demandes en attente sont separees du planning. */
  it('affiche les demandes EN_ATTENTE separement', async () => {
    appointmentApiMock.getGarageAppointments.mockResolvedValue([pendingAppointment, confirmedAppointment]);

    render(<AppointmentsPage />);

    expect(await screen.findByText('Demandes a traiter')).toBeInTheDocument();
    expect(screen.getByText('Besoin rapide')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accepter' })).toBeInTheDocument();
  });

  /** Ce test verifie que le clic sur accepter appelle bien l'API front. */
  it('appelle acceptAppointment au clic sur accepter', async () => {
    appointmentApiMock.getGarageAppointments.mockResolvedValue([pendingAppointment]);
    const user = userEvent.setup();

    render(<AppointmentsPage />);
    await user.click(await screen.findByRole('button', { name: 'Accepter' }));

    expect(appointmentApiMock.acceptAppointment).toHaveBeenCalledWith(1);
    expect(await screen.findByText('Le rendez-vous a ete accepte.')).toBeInTheDocument();
  });

  /** Ce test verifie que l'action accepter existe seulement pour EN_ATTENTE. */
  it('ne propose pas accepter pour un rendez-vous CONFIRME', async () => {
    appointmentApiMock.getGarageAppointments.mockResolvedValue([confirmedAppointment]);

    render(<AppointmentsPage />);

    expect(await screen.findByText('Aucune demande en attente')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accepter' })).not.toBeInTheDocument();
  });

  /** Ce test verifie que le planning affiche les rendez-vous confirmes groupes par jour. */
  it('affiche un planning groupe par jour pour CONFIRME', async () => {
    appointmentApiMock.getGarageAppointments.mockResolvedValue([confirmedAppointment, refusedAppointment]);

    render(<AppointmentsPage />);

    expect(await screen.findByText('Planning')).toBeInTheDocument();
    expect(screen.getByText(/jeudi 2 juillet/i)).toBeInTheDocument();
    expect(screen.getByText(/Revision - Lea Martin - Renault Clio/i)).toBeInTheDocument();
  });

  /** Ce test verifie qu'une erreur API d'action est affichee clairement. */
  it('affiche une erreur si acceptAppointment echoue', async () => {
    appointmentApiMock.getGarageAppointments.mockResolvedValue([pendingAppointment]);
    appointmentApiMock.acceptAppointment.mockRejectedValue(new Error('Ce rendez-vous a deja ete traite.'));
    const user = userEvent.setup();

    render(<AppointmentsPage />);
    await user.click(await screen.findByRole('button', { name: 'Accepter' }));

    expect(await screen.findByText('Ce rendez-vous a deja ete traite.')).toBeInTheDocument();
  });
});
