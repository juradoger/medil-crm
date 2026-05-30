import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it("renderiza texto 'Agendada' para status scheduled", () => {
    render(<StatusBadge status="scheduled" />);
    expect(screen.getByText('Agendada')).toBeTruthy();
  });

  it("renderiza texto 'Cancelada' para status cancelled", () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelada')).toBeTruthy();
  });

  it('aplica color rojo para cancelled', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelada').className).toContain('red');
  });

  it('aplica color verde para active', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Activo').className).toContain('green');
  });

  it('permite sobreescribir la etiqueta con prop label', () => {
    render(<StatusBadge status="active" label="En servicio" />);
    expect(screen.getByText('En servicio')).toBeTruthy();
  });

  it('prueba de estrés: status desconocido muestra el valor raw', () => {
    render(<StatusBadge status="unknown_xyz" />);
    expect(screen.getByText('unknown_xyz')).toBeTruthy();
  });
});
