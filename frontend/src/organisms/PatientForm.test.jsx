import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientForm } from './PatientForm';

describe('PatientForm', () => {
  it('smoke test: renderiza sin errores', () => {
    render(<PatientForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Guardar')).toBeTruthy();
  });

  it('muestra todos los campos requeridos', () => {
    const { container } = render(<PatientForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(container.querySelector('#fullName')).toBeTruthy();
    expect(container.querySelector('#documentId')).toBeTruthy();
    expect(container.querySelector('#phone')).toBeTruthy();
    expect(container.querySelector('#email')).toBeTruthy();
    expect(container.querySelector('#birthDate')).toBeTruthy();
  });

  it('botón guardar está deshabilitado cuando loading=true', () => {
    render(<PatientForm onSubmit={() => {}} onCancel={() => {}} loading={true} />);
    const btn = screen.getByRole('button', { name: /guardar/i });
    expect(btn.disabled).toBe(true);
  });

  it('muestra errores de validación si se intenta guardar sin datos', async () => {
    render(<PatientForm onSubmit={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    expect(await screen.findByText('El nombre completo es obligatorio')).toBeTruthy();
  });
});
