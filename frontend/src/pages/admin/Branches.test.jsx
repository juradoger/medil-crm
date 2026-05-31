import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Branches from './Branches';

vi.mock('../../hooks/useBranches', () => ({
  useBranches: () => ({
    branches: [
      { id: 'b1', name: 'Sucursal Central', city: 'La Paz', address: 'Av. Principal 123', phone: '2222222' }
    ],
    loading: false,
    create: vi.fn(),
    update: vi.fn(),
  }),
}));

describe('Branches Page', () => {
  it('smoke test: renderiza sin errores', () => {
    render(
      <MemoryRouter>
        <Branches />
      </MemoryRouter>
    );
    expect(screen.getByText('Sucursales')).toBeTruthy();
    expect(screen.getByText('Sucursal Central')).toBeTruthy();
  });
});
