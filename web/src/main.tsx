/*
 * Ce fichier monte l'application React du frontend web GarageFlow.
 * Il existe pour brancher le routeur, l'authentification et les styles globaux.
 * Il communique avec AppRouter, AuthProvider et le DOM de index.html.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './routes/AppRouter';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);