// Tabla de datos reutilizable
import React from 'react';
import { EmptyState } from './EmptyState';

export function DataTable({ columns, rows, emptyTitle = 'Sin datos' }) {
  if (rows.length === 0) return <EmptyState title={emptyTitle} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {rows.map((row, i) => (
            <tr key={row.id ?? row._id ?? i} className="hover:bg-blue-50/30 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
