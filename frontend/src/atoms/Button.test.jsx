import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza con label correcto', () => {
    render(<Button label="Guardar" />);
    expect(screen.getByText('Guardar')).toBeTruthy();
  });

  it('aplica clase primary por defecto', () => {
    render(<Button label="Guardar" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-[#00B4D8]');
  });

  it('llama onClick al hacer click', () => {
    const fn = vi.fn();
    render(<Button label="Click" onClick={fn} />);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('muestra Spinner cuando loading=true', () => {
    render(<Button label="Cargando" loading={true} />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('no llama onClick cuando disabled=true', () => {
    const fn = vi.fn();
    render(<Button label="Deshabilitado" onClick={fn} disabled={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('prueba de estrés: label de 500 caracteres', () => {
    const longLabel = 'a'.repeat(500);
    render(<Button label={longLabel} />);
    expect(screen.getByText(longLabel)).toBeTruthy();
  });

  it('prueba de estrés: label null', () => {
    render(<Button label={null} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });
});
