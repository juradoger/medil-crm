import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('muestra imagen cuando hay photoUrl', () => {
    const { container } = render(
      <Avatar name="Ana García" photoUrl="https://example.com/ana.jpg" />
    );
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toBe('https://example.com/ana.jpg');
  });

  it('muestra iniciales cuando no hay photoUrl', () => {
    const { container } = render(<Avatar name="Ana García" />);
    expect(container.querySelector('img')).toBeFalsy();
    expect(screen.getByText('AG')).toBeTruthy();
  });

  it('prueba de estrés: photoUrl inválida (imagen rota) cae a iniciales', () => {
    const { container } = render(
      <Avatar name="Ana García" photoUrl="https://example.com/rota.jpg" />
    );
    // Simula el fallo de carga de la imagen
    fireEvent.error(container.querySelector('img'));
    expect(container.querySelector('img')).toBeFalsy();
    expect(screen.getByText('AG')).toBeTruthy();
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
