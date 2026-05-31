import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PatientDetail from './PatientDetail';

// Mockear params y router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'patient-1' }),
  };
});

// Mockear hooks y servicios
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentBranchId: 'branch-1' }),
}));

vi.mock('../services/patientService', () => ({
  patientService: {
    getById: vi.fn().mockResolvedValue({
      id: 'patient-1',
      name: 'Ana García',
      phone: '123456',
      email: 'ana@test.com',
      status: 'active',
    }),
  },
}));

vi.mock('../hooks/useAppointments', () => ({
  useAppointments: () => ({
    appointments: [],
    loading: false,
  }),
}));

vi.mock('../hooks/useMedicalRecords', () => ({
  useMedicalRecords: () => ({
    records: [],
    loading: false,
    create: vi.fn(),
  }),
}));

describe('PatientDetail Page', () => {
  it('smoke test: renderiza sin errores', async () => {
    render(
      <MemoryRouter>
        <PatientDetail />
      </MemoryRouter>
    );
    // Como es asíncrono el fetch de paciente, podemos usar findByText
    expect(await screen.findByText('Ana García')).toBeTruthy();
  });
});
