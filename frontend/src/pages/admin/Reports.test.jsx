import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Reports from './Reports';

vi.mock('../../hooks/useProfessionals', () => ({
  useProfessionals: () => ({ professionals: [], loading: false }),
}));

vi.mock('../../hooks/useReports', () => ({
  useReports: () => ({ report: null, loading: false, generate: vi.fn() }),
}));

describe('Reports Page', () => {
  it('smoke test: renderiza sin errores', () => {
    render(<MemoryRouter><Reports /></MemoryRouter>);
    expect(document.body).toBeTruthy();
  });

  it('muestra el título "Reportes"', () => {
    render(<MemoryRouter><Reports /></MemoryRouter>);
    expect(screen.getByText('Reportes')).toBeInTheDocument();
  });

  it('muestra los filtros de profesional y fechas', () => {
    render(<MemoryRouter><Reports /></MemoryRouter>);
    expect(screen.getByText('Profesional')).toBeInTheDocument();
    expect(screen.getByText('Desde')).toBeInTheDocument();
    expect(screen.getByText('Hasta')).toBeInTheDocument();
  });

  it('muestra el botón "Generar reporte"', () => {
    render(<MemoryRouter><Reports /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /generar reporte/i })).toBeInTheDocument();
  });

  it('oculta los botones de descarga antes de generar', () => {
    render(<MemoryRouter><Reports /></MemoryRouter>);
    expect(screen.queryByRole('button', { name: /descargar pdf/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /descargar excel/i })).not.toBeInTheDocument();
  });
});
