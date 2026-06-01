import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
      { id: 'p1', userId: 'user-1', name: 'Carlos Ramos', email: 'carlos@test.com', insuranceCode: 'X', isInsured: false }
    ],
    loading: false,
  }),
}));

vi.mock('../../hooks/useAppointments', () => ({
  useAppointments: () => ({
    appointments: [],
    loading: false,
    cancel: vi.fn(),
    createWithPaymentCheck: vi.fn(),
    createAfterPayment: vi.fn(),
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
    render(<MemoryRouter><PatientPortal /></MemoryRouter>);
    expect(await screen.findByText('¡Hola, Carlos Ramos!')).toBeTruthy();
    expect(screen.getByText('Mis próximas citas')).toBeTruthy();
    expect(screen.getByText('Mi historial médico')).toBeTruthy();
  });

  it('muestra el saludo con el nombre del paciente', async () => {
    render(<MemoryRouter><PatientPortal /></MemoryRouter>);
    expect(await screen.findByText('¡Hola, Carlos Ramos!')).toBeInTheDocument();
  });

  it('muestra el botón para agendar cita', async () => {
    render(<MemoryRouter><PatientPortal /></MemoryRouter>);
    await screen.findByText('¡Hola, Carlos Ramos!');
    expect(screen.getByText('Agendar cita')).toBeInTheDocument();
  });

  it('muestra el stepper cuando el modal está abierto', async () => {
    render(<MemoryRouter><PatientPortal /></MemoryRouter>);
    fireEvent.click(await screen.findByText('Agendá tu primera cita'));
    expect(await screen.findByTestId('stepper')).toBeInTheDocument();
    expect(await screen.findByText('Contanos cómo te sentís')).toBeInTheDocument();
  });
});
