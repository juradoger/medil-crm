import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Appointments from './Appointments';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentBranchId: 'branch-1' }),
}));

vi.mock('../hooks/useAppointments', () => ({
  useAppointments: () => ({
    appointments: [
      { id: 'a1', date: '2099-12-31', time: '10:00', patientName: 'Ana García', professional: 'Dr. Solis', reason: 'Control', status: 'scheduled' }
    ],
    loading: false,
    create: vi.fn(),
    cancel: vi.fn(),
    markAttended: vi.fn(),
  }),
}));

vi.mock('../hooks/usePatients', () => ({
  usePatients: () => ({
    patients: [],
    loading: false,
  }),
}));

vi.mock('../hooks/useProfessionals', () => ({
  useProfessionals: () => ({
    professionals: [
      { id: 'prof1', fullName: 'Dr. Solis', email: 'solis@medil.com', branchId: 'branch-1' },
    ],
    loading: false,
  }),
}));

describe('Appointments Page', () => {
  it('smoke test: renderiza sin errores', () => {
    render(
      <MemoryRouter>
        <Appointments />
      </MemoryRouter>
    );
    expect(screen.getByText('Citas')).toBeTruthy();
    expect(screen.getByText('Ana García')).toBeTruthy();
  });
});
