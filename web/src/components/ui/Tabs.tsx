/*
 * Ce fichier declare des onglets simples pour les pages de configuration.
 * Il existe pour eviter une longue page verticale et rendre les reglages du garage plus lisibles.
 * Il communique avec GarageSettingsPage qui fournit les onglets metier.
 */
import type { ReactNode } from 'react';

interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: readonly TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  children: ReactNode;
}

/** Ces onglets cachent les sections non utilisees pour que le gerant garde le contexte. */
export function Tabs<T extends string>({ tabs, activeTab, onChange, children }: TabsProps<T>) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm" role="tablist">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-sky-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            key={tab.id}
            role="tab"
            type="button"
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
