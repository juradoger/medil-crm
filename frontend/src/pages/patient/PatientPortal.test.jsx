import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PatientPortal from './PatientPortal';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', fullName: 'Carlos Ramos', email: 'carlos@test.com', role: 'patient' },
    currentBranchId: 'branch-1',
  }),
}));

vi.mock('../../hooks/usePatients', () => ({
  usePatients: () => ({
    patients: [
      { id: 'p1', userId: 'user-1', name: 'Carlos Ramos', email: 'carlos@test.com' }
    ],
    loading: false,
  }),
}));

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: () => ({
    appointments: [],
    loading: false,
    create: vi.fn(),
    cancel: vi.fn(),
  }),
}));

vi.mock('../../services/recordService', () => ({
  recordService: {
    getByPatient: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../services/professionalService', () => ({
  professionalService: {
    getAll: vi.fn().mockResolvedValue([]),
  },
}));

describe('PatientPortal Page', () => {
  it('smoke test: renderiza sin errores', async () => {
    render(
      <MemoryRouter>
        <PatientPortal />
      </MemoryRouter>
    );
    expect(await screen.findByText('¡Hola, Carlos Ramos!')).toBeTruthy();
    expect(screen.getByText('Mis próximas citas')).toBeTruthy();
    expect(screen.getByText('Mi historial médico')).toBeTruthy();
  });
});
