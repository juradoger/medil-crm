import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// Componente que lanza un error de renderizado
function Boom() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renderiza children cuando no hay error', () => {
    render(<ErrorBoundary><p>contenido ok</p></ErrorBoundary>);
    expect(screen.getByText('contenido ok')).toBeInTheDocument();
  });

  it('muestra la pantalla de error cuando un hijo lanza', () => {
    // Silencia el console.error esperado del error capturado
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    spy.mockRestore();
  });
});
