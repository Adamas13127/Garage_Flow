/*
 * Ce fichier teste la page rendez-vous du frontend GarageFlow.
 * Il existe pour verifier les actions accepter/refuser sans appeler le vrai backend.
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

const pendingAppointment = { id: 1, statut: 'EN_ATTENTE', dateDebut: '2026-07-01T09:00:00+02:00', client: { id: 2, prenom: 'Lea', nom: 'Martin', email: 'lea@example.test' }, vehicle: { id: 3, marque: 'Renault', modele: 'Clio' }, service: { id: 4, nom: 'Revision' } };
const confirmedAppointment = { ...pendingAppointment, id: 2, statut: 'CONFIRME' };

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

  /** Ce test verifie que les actions sont visibles pour un rendez-vous en attente. */
  it('affiche les boutons accepter et refuser pour un rendez-vous EN_ATTENTE', async () => {
    appointmentApiMock.getGarageAppointments.mockResolvedValue([pendingAppointment]);

    render(<AppointmentsPage />);

    expect(await screen.findByRole('button', { name: 'Accepter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refuser' })).toBeInTheDocument();
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

  /** Ce test verifie qu'un rendez-vous deja confirme ne propose plus les actions de decision. */
  it('n affiche pas les boutons accepter/refuser pour un rendez-vous CONFIRME', async () => {
    appointmentApiMock.getGarageAppointments.mockResolvedValue([confirmedAppointment]);

    render(<AppointmentsPage />);

    expect(await screen.findByText('Aucune action')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accepter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Refuser' })).not.toBeInTheDocument();
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