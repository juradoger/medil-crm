import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Patients from './Patients';

// Mockear hooks de contexto y datos
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentBranchId: 'branch-1' }),
}));

vi.mock('../hooks/usePatients', () => ({
  usePatients: () => ({
    patients: [{ id: 'p1', name: 'Ana García', phone: '123456', email: 'ana@test.com', status: 'active' }],
    loading: false,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }),
}));

describe('Patients Page', () => {
  it('smoke test: renderiza sin errores', () => {
    render(
      <MemoryRouter>
        <Patients />
      </MemoryRouter>
    );
    expect(screen.getByText('Pacientes')).toBeTruthy();
    expect(screen.getByText('Ana García')).toBeTruthy();
  });
});
