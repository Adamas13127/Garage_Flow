/*
 * Ce fichier teste la route protegee du frontend GarageFlow.
 * Il existe pour verifier qu'un utilisateur non connecte est renvoye vers /login.
 * Il communique avec ProtectedRoute, AuthContext et React Router.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../contexts/authContextValue';
import { ProtectedRoute } from './ProtectedRoute';

const baseAuthValue = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

describe('ProtectedRoute', () => {
  /** Ce test verifie qu'une route protegee redirige un utilisateur anonyme. */
  it('redirige vers login quand l utilisateur n est pas connecte', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthContext.Provider value={baseAuthValue}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<p>Dashboard protege</p>} />
            </Route>
            <Route path="/login" element={<p>Page login</p>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Page login')).toBeInTheDocument();
  });
});