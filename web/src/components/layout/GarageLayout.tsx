/*
 * Ce fichier declare le layout garage du frontend GarageFlow.
 * Il existe pour fournir une navigation commune aux pages protegees du dashboard web.
 * Il communique avec React Router, useAuth et les pages metier garage.
 */
import { Bell, CalendarDays, Gauge, LogOut, Menu, Wrench } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/appointments', label: 'Rendez-vous', icon: CalendarDays },
  { to: '/interventions', label: 'Interventions', icon: Wrench },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

/** Ce layout encadre les pages garage avec une navigation et un bouton de deconnexion. */
export function GarageLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Menu className="h-5 w-5" aria-hidden="true" />
            GarageFlow
          </div>
          <Button variant="ghost" onClick={logout}>Deconnexion</Button>
        </div>
      </header>

      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white lg:block">
          <div className="flex h-full flex-col p-5">
            <div className="mb-8">
              <p className="text-xl font-bold text-sky-800">GarageFlow</p>
              <p className="mt-1 text-sm text-slate-500">Dashboard garage</p>
            </div>
            <nav className="space-y-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-sky-50 text-sky-800' : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto border-t border-slate-200 pt-5">
              <p className="text-sm font-medium text-slate-900">{user?.prenom} {user?.nom}</p>
              <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
              <Button className="mt-4 w-full" variant="secondary" onClick={logout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Deconnexion
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}