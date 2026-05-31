import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DoctorConsole from './DoctorConsole';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ currentBranchId: 'branch-1' }),
}));

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: () => ({
    appointments: [],
    loading: false,
    markAttended: vi.fn(),
  }),
}));

vi.mock('../../hooks/useMedicalRecords', () => ({
  useMedicalRecords: () => ({
    records: [],
    loading: false,
    create: vi.fn(),
  }),
}));

describe('DoctorConsole Page', () => {
  it('smoke test: renderiza sin errores', () => {
    render(
      <MemoryRouter>
        <DoctorConsole />
      </MemoryRouter>
    );
    expect(screen.getByText('Agenda del día')).toBeTruthy();
  });
});
