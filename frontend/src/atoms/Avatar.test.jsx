import React from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renderiza con iniciales correctas del nombre completo', () => {
    render(<Avatar name="Ana García" />);
    expect(screen.getByText('AG')).toBeTruthy();
  });

  it('renderiza inicial única para nombre de una sola palabra', () => {
    render(<Avatar name="Carlos" />);
    expect(screen.getByText('C')).toBeTruthy();
  });

  it('aplica tamaño sm correctamente', () => {
    render(<Avatar name="Ana García" size="sm" />);
    const el = screen.getByText('AG');
    expect(el.className).toContain('h-7');
  });

  it('aplica tamaño lg correctamente', () => {
    render(<Avatar name="Ana García" size="lg" />);
    const el = screen.getByText('AG');
    expect(el.className).toContain('h-12');
  });

  it('prueba de estrés: name vacío muestra signo de pregunta', () => {
    render(<Avatar name="" />);
    expect(screen.getByText('?')).toBeTruthy();
  });

  it('prueba de estrés: name con un solo carácter', () => {
    render(<Avatar name="X" />);
    expect(screen.getByText('X')).toBeTruthy();
  });
});
