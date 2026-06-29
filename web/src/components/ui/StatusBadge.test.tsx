/*
 * Ce fichier teste le composant StatusBadge du frontend GarageFlow.
 * Il existe pour verifier que les statuts metier restent lisibles dans l'interface.
 * Il communique avec Testing Library et le composant StatusBadge.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  /** Ce test verifie qu'un statut technique est transforme en libelle lisible. */
  it('affiche correctement un statut de rendez-vous', () => {
    render(<StatusBadge status="EN_ATTENTE" />);

    expect(screen.getByText('En attente')).toBeInTheDocument();
  });
});