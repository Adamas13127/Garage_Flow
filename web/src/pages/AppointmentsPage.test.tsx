/*
 * Ce fichier teste la page rendez-vous du frontend GarageFlow.
 * Il existe pour verifier que l'etat vide reste clair quand l'API ne renvoie aucun rendez-vous.
 * Il communique avec AppointmentsPage et appointmentApi.ts mocke.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppointmentsPage } from './AppointmentsPage';

vi.mock('../api/appointmentApi', () => ({
  getGarageAppointments: vi.fn(async () => []),
}));

describe('AppointmentsPage', () => {
  /** Ce test verifie que la page explique proprement l'absence de rendez-vous. */
  it('affiche un etat vide si aucun rendez-vous existe', async () => {
    render(<AppointmentsPage />);

    expect(await screen.findByText('Aucun rendez-vous')).toBeInTheDocument();
  });
});