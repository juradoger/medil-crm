import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mockear hooks de contexto y datos
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentBranchId: 'branch-1' }),
}));

vi.mock('../hooks/usePatients', () => ({
  usePatients: () => ({ patients: [], loading: false }),
}));

vi.mock('../hooks/useAppointments', () => ({
  useAppointments: () => ({ appointments: [], loading: false }),
}));

vi.mock('../hooks/useReminders', () => ({
  useReminders: () => ({ reminders: [], loading: false }),
}));

describe('Dashboard Page', () => {
  it('smoke test: renderiza sin errores', () => {
    render(<Dashboard />);
    expect(screen.getByText('Panel de Control')).toBeTruthy();
  });
});
