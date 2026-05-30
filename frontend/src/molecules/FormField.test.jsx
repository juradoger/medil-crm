import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renderiza label con texto correcto', () => {
    render(<FormField label="Nombre" htmlFor="nombre"><input id="nombre" /></FormField>);
    expect(screen.getByText('Nombre')).toBeTruthy();
  });

  it('muestra mensaje de error cuando error tiene valor', () => {
    render(<FormField label="Email" error="El correo es inválido"><input /></FormField>);
    expect(screen.getByText('El correo es inválido')).toBeTruthy();
  });

  it('muestra asterisco cuando required=true', () => {
    render(<FormField label="Nombre" required={true}><input /></FormField>);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('no muestra error cuando error es null', () => {
    render(<FormField label="Campo" error={null}><input /></FormField>);
    expect(screen.queryByRole('paragraph')).toBeNull();
  });
});
