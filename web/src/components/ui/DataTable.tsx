/*
 * Ce fichier declare le composant DataTable du frontend GarageFlow.
 * Il existe pour afficher des listes metier simples sans dupliquer la structure HTML.
 * Il communique avec les pages rendez-vous, interventions et notifications.
 */
import type { ReactNode } from 'react';

interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  items: T[];
  getKey: (item: T) => string | number;
}

/** Ce composant affiche un tableau responsive pour les donnees principales du garage. */
export function DataTable<T>({ columns, items, getKey }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3" key={column.key} scope="col">{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr className="align-top" key={getKey(item)}>
                {columns.map((column) => (
                  <td className="px-4 py-4 text-slate-700" key={column.key}>{column.render(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}