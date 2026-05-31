import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

// Mockear publicApi
vi.mock('../../services/backendService', () => ({
  publicApi: {
    getBranches: vi.fn().mockResolvedValue({
      branches: [
        { id: 'b1', name: 'Clínica Central', city: 'La Paz', address: 'Calle 1 #123', coverPhoto: null, description: 'Test desc' }
      ]
    }),
  },
}));

describe('LandingPage Page', () => {
  it('smoke test: renderiza sin errores', async () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Muestra sección hero
    expect(screen.getByText('La plataforma médica', { exact: false })).toBeTruthy();
    // Muestra sección características
    expect(screen.getByText('Todo lo que tu clínica necesita')).toBeTruthy();
    // Muestra sección clínicas tras cargar
    await waitFor(() => {
      expect(screen.getByText('Clínica Central')).toBeTruthy();
    });
  });
});
