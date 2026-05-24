// Tests de StatusBadge — StatusBadge tests
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('muestra la etiqueta del estado — displays status label', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Activo')).toBeTruthy();
  });

  it('permite sobreescribir la etiqueta — allows custom label override', () => {
    render(<StatusBadge status="active" label="En servicio" />);
    expect(screen.getByText('En servicio')).toBeTruthy();
  });

  it('aplica clase verde para active — applies green class for active', () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByText('Activo');
    expect(badge.className).toContain('green');
  });

  it('aplica clase roja para cancelled — applies red class for cancelled', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelada').className).toContain('red');
  });

  it('aplica clase amarilla para pending — applies yellow class for pending', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pendiente').className).toContain('yellow');
  });

  it('muestra el status raw para estados desconocidos — shows raw status for unknown states', () => {
    render(<StatusBadge status="unknown_state" />);
    expect(screen.getByText('unknown_state')).toBeTruthy();
  });
});
