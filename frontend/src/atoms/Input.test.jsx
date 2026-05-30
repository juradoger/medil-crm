import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renderiza con value correcto', () => {
    render(<Input value="hola" onChange={() => {}} />);
    expect(screen.getByDisplayValue('hola')).toBeTruthy();
  });

  it('llama onChange al escribir', () => {
    const fn = vi.fn();
    render(<Input value="" onChange={fn} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(fn).toHaveBeenCalled();
  });

  it('aplica clase de error cuando error=true', () => {
    render(<Input value="" onChange={() => {}} error={true} />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-400');
  });

  it('prueba de estrés: value vacío', () => {
    render(<Input value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('prueba de estrés: value de 500 caracteres', () => {
    const longValue = 'x'.repeat(500);
    render(<Input value={longValue} onChange={() => {}} />);
    expect(screen.getByDisplayValue(longValue)).toBeTruthy();
  });
});
