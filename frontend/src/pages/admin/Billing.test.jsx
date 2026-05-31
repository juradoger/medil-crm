import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Billing from './Billing';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ currentBranchId: 'branch-1' }),
}));

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: () => ({
    appointments: [
      { id: 'a1', date: '2026-05-31', time: '10:00', patientName: 'Ana García', professional: 'Dr. Solis', status: 'attended' }
    ],
    loading: false,
    reload: vi.fn(),
  }),
}));

vi.mock('../../services/paymentService', () => ({
  paymentService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
  },
}));

describe('Billing Page', () => {
  it('smoke test: renderiza sin errores', async () => {
    render(
      <MemoryRouter>
        <Billing />
      </MemoryRouter>
    );
    expect(await screen.findByText('Facturación y Cobros')).toBeTruthy();
  });
});
