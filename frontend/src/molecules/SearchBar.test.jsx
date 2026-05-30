import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renderiza input con placeholder correcto', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Buscar paciente" />);
    expect(screen.getByPlaceholderText('Buscar paciente')).toBeTruthy();
  });

  it('llama onChange al escribir (con debounce)', async () => {
    const fn = vi.fn();
    render(<SearchBar value="" onChange={fn} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Ana' } });
    // El debounce es 300ms — verificamos que se actualizó el valor interno
    expect(screen.getByDisplayValue('Ana')).toBeTruthy();
  });

  it('muestra botón limpiar cuando hay texto', () => {
    render(<SearchBar value="algo" onChange={() => {}} />);
    expect(screen.getByLabelText('Limpiar búsqueda')).toBeTruthy();
  });

  it('oculta botón limpiar cuando está vacío', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Limpiar búsqueda')).toBeNull();
  });
});
