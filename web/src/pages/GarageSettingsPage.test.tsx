/*
 * Ce fichier teste la page Configuration garage du frontend GarageFlow.
 * Il existe pour verifier les formulaires de gestion sans appeler le vrai backend.
 * Il communique avec GarageSettingsPage et les modules API mockes par Vitest.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GarageSettingsPage } from './GarageSettingsPage';

const apiMocks = vi.hoisted(() => ({
  getMyGarage: vi.fn(),
  updateMyGarage: vi.fn(),
  getMyGarageServices: vi.fn(),
  createServicePrestation: vi.fn(),
  updateServicePrestation: vi.fn(),
  disableServicePrestation: vi.fn(),
  getOpeningHours: vi.fn(),
  createOpeningHour: vi.fn(),
  updateOpeningHour: vi.fn(),
  disableOpeningHour: vi.fn(),
  getUnavailabilities: vi.fn(),
  createUnavailability: vi.fn(),
  updateUnavailability: vi.fn(),
  deleteUnavailability: vi.fn(),
}));

vi.mock('../api/garageApi', () => ({ getMyGarage: apiMocks.getMyGarage, updateMyGarage: apiMocks.updateMyGarage }));
vi.mock('../api/servicePrestationApi', () => ({ getMyGarageServices: apiMocks.getMyGarageServices, createServicePrestation: apiMocks.createServicePrestation, updateServicePrestation: apiMocks.updateServicePrestation, disableServicePrestation: apiMocks.disableServicePrestation }));
vi.mock('../api/openingHourApi', () => ({ getOpeningHours: apiMocks.getOpeningHours, createOpeningHour: apiMocks.createOpeningHour, updateOpeningHour: apiMocks.updateOpeningHour, disableOpeningHour: apiMocks.disableOpeningHour }));
vi.mock('../api/unavailabilityApi', () => ({ getUnavailabilities: apiMocks.getUnavailabilities, createUnavailability: apiMocks.createUnavailability, updateUnavailability: apiMocks.updateUnavailability, deleteUnavailability: apiMocks.deleteUnavailability }));

const garage = { id: 1, nom: 'Garage Central', adresse: '1 rue Test', ville: 'Paris', codePostal: '75000', telephone: '0102030405', email: 'contact@garage.test', description: 'Garage de test', logoUrl: '', actif: true };
const service = { id: 2, nom: 'Revision', description: 'Controle complet', dureeMinutes: 60, actif: true };
const unavailability = { id: 3, dateDebut: '2026-07-01T09:00:00', dateFin: '2026-07-01T12:00:00', motif: 'Formation' };

function prepareMocks({ services = [service], unavailabilities = [unavailability] } = {}) {
  apiMocks.getMyGarage.mockResolvedValue(garage);
  apiMocks.updateMyGarage.mockResolvedValue(garage);
  apiMocks.getMyGarageServices.mockResolvedValue(services);
  apiMocks.createServicePrestation.mockResolvedValue(service);
  apiMocks.updateServicePrestation.mockResolvedValue(service);
  apiMocks.disableServicePrestation.mockResolvedValue(undefined);
  apiMocks.getOpeningHours.mockResolvedValue([]);
  apiMocks.createOpeningHour.mockResolvedValue({ id: 4, jourSemaine: 1, heureDebut: '09:00', heureFin: '12:00', actif: true });
  apiMocks.updateOpeningHour.mockResolvedValue({ id: 4, jourSemaine: 1, heureDebut: '09:00', heureFin: '12:00', actif: true });
  apiMocks.disableOpeningHour.mockResolvedValue(undefined);
  apiMocks.getUnavailabilities.mockResolvedValue(unavailabilities);
  apiMocks.createUnavailability.mockResolvedValue(unavailability);
  apiMocks.updateUnavailability.mockResolvedValue(unavailability);
  apiMocks.deleteUnavailability.mockResolvedValue(undefined);
}

describe('GarageSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepareMocks();
  });

  /** Ce test verifie que la page passe du chargement aux informations du garage. */
  it('affiche un loading puis les informations garage mockees', async () => {
    render(<GarageSettingsPage />);

    expect(screen.getByText(/chargement de la configuration garage/i)).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Garage Central')).toBeInTheDocument();
  });

  /** Ce test verifie que le formulaire garage appelle l'API de mise a jour. */
  it('appelle updateMyGarage quand le formulaire garage est enregistre', async () => {
    const user = userEvent.setup();
    render(<GarageSettingsPage />);

    await screen.findByDisplayValue('Garage Central');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(apiMocks.updateMyGarage).toHaveBeenCalled();
  });

  /** Ce test verifie que la duree 0 est refusee avant l'appel API. */
  it('refuse la creation prestation avec une duree a 0', async () => {
    const user = userEvent.setup();
    render(<GarageSettingsPage />);

    await screen.findByDisplayValue('Garage Central');
    await user.type(screen.getByLabelText('Nom de la prestation'), 'Diagnostic');
    await user.type(screen.getByLabelText('Duree en minutes'), '0');
    await user.click(screen.getByRole('button', { name: 'Creer la prestation' }));

    expect(await screen.findByText('La duree doit etre superieure a 0.')).toBeInTheDocument();
    expect(apiMocks.createServicePrestation).not.toHaveBeenCalled();
  });

  /** Ce test verifie que la creation horaire bloque une plage incoherente. */
  it('refuse la creation horaire si heureDebut est apres heureFin', async () => {
    const user = userEvent.setup();
    render(<GarageSettingsPage />);

    await screen.findByDisplayValue('Garage Central');
    await user.type(screen.getByLabelText('Heure debut'), '18:00');
    await user.type(screen.getByLabelText('Heure fin'), '09:00');
    await user.click(screen.getByRole('button', { name: 'Creer la plage horaire' }));

    expect(await screen.findByText('L heure de debut doit etre avant l heure de fin.')).toBeInTheDocument();
    expect(apiMocks.createOpeningHour).not.toHaveBeenCalled();
  });

  /** Ce test verifie que la creation d'indisponibilite bloque une periode incoherente. */
  it('refuse la creation indisponibilite si dateDebut est apres dateFin', async () => {
    const user = userEvent.setup();
    render(<GarageSettingsPage />);

    await screen.findByDisplayValue('Garage Central');
    await user.type(screen.getAllByLabelText('Date debut')[0], '2026-07-02T10:00');
    await user.type(screen.getAllByLabelText('Date fin')[0], '2026-07-01T10:00');
    await user.click(screen.getByRole('button', { name: "Creer l'indisponibilite" }));

    expect(await screen.findByText('La date de debut doit etre avant la date de fin.')).toBeInTheDocument();
    expect(apiMocks.createUnavailability).not.toHaveBeenCalled();
  });

  /** Ce test verifie l'etat vide des prestations. */
  it('affiche un etat vide si aucune prestation existe', async () => {
    prepareMocks({ services: [] });

    render(<GarageSettingsPage />);

    expect(await screen.findByText('Aucune prestation')).toBeInTheDocument();
  });

  /** Ce test verifie que la desactivation de prestation appelle l'API attendue. */
  it('appelle disableServicePrestation apres confirmation', async () => {
    const user = userEvent.setup();
    render(<GarageSettingsPage />);

    await screen.findByText('Revision');
    await user.click(screen.getAllByRole('button', { name: 'Desactiver' })[0]);
    await user.click(screen.getByRole('button', { name: 'Confirmer' }));

    expect(apiMocks.disableServicePrestation).toHaveBeenCalledWith(2);
  });

  /** Ce test verifie que la suppression d'indisponibilite appelle l'API attendue. */
  it('appelle deleteUnavailability apres confirmation', async () => {
    const user = userEvent.setup();
    render(<GarageSettingsPage />);

    await screen.findByText('Formation');
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    await user.click(screen.getByRole('button', { name: 'Confirmer' }));

    expect(apiMocks.deleteUnavailability).toHaveBeenCalledWith(3);
  });
});