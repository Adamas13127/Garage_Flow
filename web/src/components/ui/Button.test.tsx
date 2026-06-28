/*
 * Ce fichier teste les composants UI de base du frontend GarageFlow.
 * Il existe pour verifier que les composants reutilisables s'affichent correctement.
 * Il communique avec Vitest et Testing Library.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';
import { Card } from './Card';

describe('composants UI', () => {
  /** Ce test verifie que le bouton affiche son libelle. */
  it('affiche un bouton', () => {
    render(<Button>Valider</Button>);

    expect(screen.getByRole('button', { name: /valider/i })).toBeInTheDocument();
  });

  /** Ce test verifie qu'une carte peut afficher un titre et du contenu. */
  it('affiche une carte', () => {
    render(<Card title="Rendez-vous">Contenu test</Card>);

    expect(screen.getByText('Rendez-vous')).toBeInTheDocument();
    expect(screen.getByText('Contenu test')).toBeInTheDocument();
  });
});