import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Professionals from './Professionals';

vi.mock('../../hooks/useProfessionals', () => ({
  useProfessionals: () => ({
    professionals: [
      { id: 'prof1', fullName: 'Dra. Carmen Solís', specialty: 'Pediatría', email: 'carmen@medil.com', phone: '+591 71234567', branchId: 'b1', isActive: true, commissionRate: 0.15 },
    ],
    loading: false,
    createProfessional: vi.fn(),
    updateProfessional: vi.fn(),
    deactivateProfessional: vi.fn(),
  }),
}));

vi.mock('../../hooks/useBranches', () => ({
  useBranches: () => ({
    branches: [{ id: 'b1', name: 'Clínica Central' }],
    loading: false,
  }),
}));

describe('Professionals Page', () => {
  it('smoke test: renderiza sin errores', () => {
    render(<MemoryRouter><Professionals /></MemoryRouter>);
    expect(document.body).toBeTruthy();
  });

  it('muestra el título "Profesionales"', () => {
    render(<MemoryRouter><Professionals /></MemoryRouter>);
    expect(screen.getByText('Profesionales')).toBeInTheDocument();
  });

  it('muestra el botón de nuevo profesional', () => {
    render(<MemoryRouter><Professionals /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /nuevo profesional/i })).toBeInTheDocument();
  });

  it('muestra la tarjeta del profesional', () => {
    render(<MemoryRouter><Professionals /></MemoryRouter>);
    expect(screen.getByText('Dra. Carmen Solís')).toBeInTheDocument();
    expect(screen.getByText('Pediatría')).toBeInTheDocument();
  });
});
