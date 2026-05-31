import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Supplies from './Supplies';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ currentBranchId: 'branch-1' }),
}));

vi.mock('../../hooks/useSupplies', () => ({
  useSupplies: () => ({
    supplies: [
      { id: 's1', name: 'Jeringas 5ml', stockCurrent: 10, stockMinimum: 15, unit: 'unidades', status: 'low' }
    ],
    loading: false,
    create: vi.fn(),
    update: vi.fn(),
    adjustStock: vi.fn(),
    remove: vi.fn(),
  }),
}));

describe('Supplies Page', () => {
  it('smoke test: renderiza sin errores', () => {
    render(
      <MemoryRouter>
        <Supplies />
      </MemoryRouter>
    );
    expect(screen.getByText('Insumos y Suministros')).toBeTruthy();
    expect(screen.getByText('Jeringas 5ml')).toBeTruthy();
  });
});
