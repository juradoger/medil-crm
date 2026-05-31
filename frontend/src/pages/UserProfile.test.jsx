import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const state = vi.hoisted(() => ({ user: null }));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: state.user,
    updateUser: vi.fn(),
    currentBranchId: 'b1',
  }),
}));
vi.mock('../hooks/useAppointments', () => ({
  useAppointments: () => ({ appointments: [], loading: false, error: null }),
}));
vi.mock('../services/patientService', () => ({ patientService: { update: vi.fn() } }));
vi.mock('../services/professionalService', () => ({ professionalService: { update: vi.fn() } }));
vi.mock('../services/backendService', () => ({ BACKEND_URL: 'http://localhost:3001' }));

import UserProfile from './UserProfile';

function renderWith(user) {
  state.user = user;
  return render(<MemoryRouter><UserProfile /></MemoryRouter>);
}

const ADMIN   = { id: 'u1', role: 'admin',   fullName: 'Admin Uno',  email: 'a@a.com' };
const PATIENT = { id: 'p1', role: 'patient', fullName: 'Pac Uno',    email: 'p@p.com' };
const DOCTOR  = { id: 'd1', role: 'doctor',  fullName: 'Doc Uno',    email: 'd@d.com' };

describe('UserProfile', () => {
  it('smoke test: renderiza sin errores', () => {
    renderWith(ADMIN);
    expect(screen.getByText('Mi perfil')).toBeTruthy();
  });

  it('muestra la sección de foto de perfil', () => {
    renderWith(ADMIN);
    expect(screen.getByText('Foto de perfil')).toBeTruthy();
  });

  it('muestra la sección de datos personales', () => {
    renderWith(ADMIN);
    expect(screen.getByText('Datos personales')).toBeTruthy();
  });

  it('muestra la sección de seguro solo para patient', () => {
    renderWith(PATIENT);
    expect(screen.getByText('Seguro médico')).toBeTruthy();
  });

  it('no muestra la sección de seguro para admin', () => {
    renderWith(ADMIN);
    expect(screen.queryByText('Seguro médico')).toBeNull();
  });

  it('muestra la sección profesional solo para doctor', () => {
    renderWith(DOCTOR);
    expect(screen.getByText('Perfil profesional')).toBeTruthy();
  });

  it('no muestra la sección profesional para patient', () => {
    renderWith(PATIENT);
    expect(screen.queryByText('Perfil profesional')).toBeNull();
  });
});
