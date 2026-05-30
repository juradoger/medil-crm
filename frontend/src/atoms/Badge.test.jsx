import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renderiza con texto correcto', () => {
    render(<Badge text="Activo" color="green" />);
    expect(screen.getByText('Activo')).toBeTruthy();
  });

  it('aplica color correcto según prop color', () => {
    render(<Badge text="Activo" color="green" />);
    expect(screen.getByText('Activo').className).toContain('green');
  });

  it('aplica color aqua', () => {
    render(<Badge text="Agendada" color="aqua" />);
    expect(screen.getByText('Agendada').className).toContain('00B4D8');
  });

  it('prueba de estrés: text null', () => {
    const { container } = render(<Badge text={null} color="gray" />);
    expect(container.firstChild).toBeTruthy();
  });
});
