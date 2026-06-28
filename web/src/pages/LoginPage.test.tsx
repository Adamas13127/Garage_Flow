/*
 * Ce fichier teste le rendu de la page de connexion GarageFlow.
 * Il existe pour verifier que le formulaire de login reste disponible.
 * Il communique avec AuthContext, React Router et Testing Library.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../contexts/authContextValue';
import { LoginPage } from './LoginPage';

const authValue = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

describe('LoginPage', () => {
  /** Ce test verifie que les champs de connexion sont visibles. */
  it('affiche le formulaire de connexion', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /connexion garage/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });
});