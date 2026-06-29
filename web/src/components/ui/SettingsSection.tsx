/*
 * Ce fichier declare le composant SettingsSection du frontend GarageFlow.
 * Il existe pour separer clairement les blocs de configuration du garage.
 * Il communique avec GarageSettingsPage.
 */
import type { PropsWithChildren } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
}

/** Cette section regroupe un formulaire ou une liste de configuration avec un titre clair. */
export function SettingsSection({ children, description, title }: PropsWithChildren<SettingsSectionProps>) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}