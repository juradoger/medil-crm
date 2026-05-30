import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renderiza sin errores', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('aplica tamaño sm correctamente', () => {
    render(<Spinner size="sm" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('h-4');
  });

  it('aplica tamaño lg correctamente', () => {
    render(<Spinner size="lg" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('h-10');
  });

  it('aplica tamaño md por defecto', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('h-6');
  });
});
