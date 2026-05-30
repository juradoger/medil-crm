// Tabla de datos con búsqueda, ordenamiento y estado vacío
import React, { useState, useMemo } from 'react';
import { Spinner } from '../atoms/Spinner';
import { SearchBar } from '../molecules/SearchBar';
import { EmptyState } from './EmptyState';

export function DataTable({
  columns,
  data,
  rows,         // alias backward-compat (páginas existentes usan rows)
  loading = false,
  emptyMessage,
  emptyTitle,   // alias backward-compat
  onRowClick,
  searchable = false,
  sortable = false,
}) {
  // Estabiliza el array fuente — evita que useMemo cambie en cada render
  const items = useMemo(() => data ?? rows ?? [], [data, rows]);
  const emptyText  = emptyMessage ?? emptyTitle ?? 'Sin datos';

  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(row =>
      columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
    );
  }, [items, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key) {
    if (!sortable) return;
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {searchable && (
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar en tabla…" />
      )}

      {sorted.length === 0 ? (
        <EmptyState title={emptyText} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                  >
                    {col.label}
                    {sortable && sortKey === col.key && (
                      <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {sorted.map((row, i) => (
                <tr
                  key={row.id ?? row._id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-blue-50/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
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
      )}
    </div>
  );
}
