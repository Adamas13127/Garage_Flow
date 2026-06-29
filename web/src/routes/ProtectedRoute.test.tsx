/*
 * Ce fichier teste la route protegee du frontend GarageFlow.
 * Il existe pour verifier qu'un utilisateur non connecte est renvoye vers /login et qu'un client est bloque cote web.
 * Il communique avec ProtectedRoute, AuthContext et React Router.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../contexts/authContextValue';
import type { AuthContextValue } from '../contexts/authContextValue';
import { ProtectedRoute } from './ProtectedRoute';

const baseAuthValue: AuthContextValue = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

function renderProtected(value: AuthContextValue) {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthContext.Provider value={value}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<p>Dashboard protege</p>} />
          </Route>
          <Route path="/login" element={<p>Page login</p>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  /** Ce test verifie qu'une route protegee redirige un utilisateur anonyme. */
  it('redirige vers login quand l utilisateur n est pas connecte', () => {
    renderProtected(baseAuthValue);

    expect(screen.getByText('Page login')).toBeInTheDocument();
  });

  /** Ce test verifie qu'un compte client connecte voit un message dedie au mobile. */
  it('bloque un utilisateur ROLE_CLIENT sur le dashboard web', () => {
    renderProtected({
      ...baseAuthValue,
      token: 'token-client',
      isAuthenticated: true,
      user: { id: 3, prenom: 'Demo', nom: 'Client', email: 'client.demo@garageflow.local', roles: ['ROLE_CLIENT'] },
    });

    expect(screen.getByText('Compte client detecte')).toBeInTheDocument();
    expect(screen.getByText(/Ce compte client est reserve a l'application mobile GarageFlow/i)).toBeInTheDocument();
    expect(screen.queryByText('Dashboard protege')).not.toBeInTheDocument();
  });
});
