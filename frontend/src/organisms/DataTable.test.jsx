import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'age',  label: 'Edad' },
];
const DATA = [
  { id: '1', name: 'Ana García', age: 30 },
  { id: '2', name: 'Luis Pérez', age: 45 },
];

describe('DataTable', () => {
  it('smoke test: renderiza sin errores', () => {
    render(<DataTable columns={COLUMNS} data={DATA} />);
    expect(screen.getByText('Nombre')).toBeTruthy();
  });

  it('muestra Spinner cuando loading=true', () => {
    render(<DataTable columns={COLUMNS} data={[]} loading={true} />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('muestra EmptyState cuando data=[]', () => {
    render(<DataTable columns={COLUMNS} data={[]} emptyMessage="Sin resultados" />);
    expect(screen.getByText('Sin resultados')).toBeTruthy();
  });

  it('renderiza filas cuando data tiene elementos', () => {
    render(<DataTable columns={COLUMNS} data={DATA} />);
    expect(screen.getByText('Ana García')).toBeTruthy();
    expect(screen.getByText('Luis Pérez')).toBeTruthy();
  });

  it('llama onRowClick al hacer click en fila', () => {
    const fn = vi.fn();
    render(<DataTable columns={COLUMNS} data={DATA} onRowClick={fn} />);
    fireEvent.click(screen.getByText('Ana García'));
    expect(fn).toHaveBeenCalledWith(DATA[0]);
  });
});
