// Tests de DataTable — DataTable tests
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataTable } from './DataTable';

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'age', label: 'Edad' },
];

const ROWS = [
  { id: '1', name: 'Ana García', age: 30 },
  { id: '2', name: 'Luis Pérez', age: 45 },
];

describe('DataTable', () => {
  it('renderiza encabezados — renders column headers', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} />);
    expect(screen.getByText('Nombre')).toBeTruthy();
    expect(screen.getByText('Edad')).toBeTruthy();
  });

  it('renderiza filas con datos — renders rows with data', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} />);
    expect(screen.getByText('Ana García')).toBeTruthy();
    expect(screen.getByText('Luis Pérez')).toBeTruthy();
  });

  it('muestra estado vacío cuando no hay filas — shows empty state when no rows', () => {
    render(<DataTable columns={COLUMNS} rows={[]} emptyTitle="Sin datos" />);
    expect(screen.getByText('Sin datos')).toBeTruthy();
  });

  it('usa render personalizado de celda — uses custom cell renderer', () => {
    const columns = [
      ...COLUMNS,
      { key: 'custom', label: 'Custom', render: r => <span>custom-{r.id}</span> },
    ];
    render(<DataTable columns={columns} rows={ROWS} />);
    expect(screen.getByText('custom-1')).toBeTruthy();
  });

  it('muestra — cuando el campo es null — shows — when field is null', () => {
    const rows = [{ id: '1', name: null, age: 25 }];
    render(<DataTable columns={COLUMNS} rows={rows} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});
