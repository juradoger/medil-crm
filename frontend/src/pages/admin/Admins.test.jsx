import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Admins from './Admins';

vi.mock('../../hooks/useAdmins', () => ({
  useAdmins: () => ({
    admins: [
      { id: 'u1', email: 'admin.lapaz@medil.com', fullName: 'Rodrigo García', role: 'admin', branchId: 'b1' },
    ],
    loading: false,
    addAdmin: vi.fn(),
    lookup: vi.fn(),
  }),
}));

vi.mock('../../hooks/useBranches', () => ({
  useBranches: () => ({
    branches: [{ id: 'b1', name: 'Clínica Central' }],
    loading: false,
  }),
}));

describe('Admins Page', () => {
  it('smoke test: renderiza el título y el botón de agregar', () => {
    render(<MemoryRouter><Admins /></MemoryRouter>);
    expect(screen.getByText('Administradores')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar admin/i })).toBeInTheDocument();
  });

  it('muestra la tarjeta del administrador con su email y sucursal', () => {
    render(<MemoryRouter><Admins /></MemoryRouter>);
    expect(screen.getByText('Rodrigo García')).toBeInTheDocument();
    expect(screen.getByText('admin.lapaz@medil.com')).toBeInTheDocument();
    // 'Clínica Central' aparece en la tarjeta y en el filtro de sucursales
    expect(screen.getAllByText('Clínica Central').length).toBeGreaterThan(0);
  });
});
