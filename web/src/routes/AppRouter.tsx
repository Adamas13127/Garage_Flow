/*
 * Ce fichier declare le routeur principal du frontend web GarageFlow.
 * Il existe pour organiser les routes publiques et protegees du dashboard garage.
 * Il communique avec ProtectedRoute, GarageLayout et les pages React.
 */
import { Navigate, Route, Routes } from 'react-router-dom';
import { GarageLayout } from '../components/layout/GarageLayout';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { InterventionsPage } from '../pages/InterventionsPage';
import { GarageSettingsPage } from '../pages/GarageSettingsPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { ProtectedRoute } from './ProtectedRoute';

/** Ce routeur separe la connexion publique des pages garage protegees. */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<GarageLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/interventions" element={<InterventionsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/garage-settings" element={<GarageSettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}