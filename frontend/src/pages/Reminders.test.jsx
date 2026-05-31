import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Reminders from './Reminders';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentBranchId: 'branch-1' }),
}));

vi.mock('../hooks/useReminders', () => ({
  useReminders: () => ({
    reminders: [
      { id: 'r1', sendAt: '2099-12-31T10:00:00.000Z', message: 'Recordatorio test', patientId: 'p1', status: 'pending' }
    ],
    loading: false,
    markSent: vi.fn(),
  }),
}));

describe('Reminders Page', () => {
  it('smoke test: renderiza sin errores', () => {
    render(
      <MemoryRouter>
        <Reminders />
      </MemoryRouter>
    );
    expect(screen.getByText('Recordatorios')).toBeTruthy();
    expect(screen.getByText('Recordatorio test')).toBeTruthy();
  });
});
