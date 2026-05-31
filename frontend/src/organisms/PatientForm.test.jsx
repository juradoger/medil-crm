import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientForm } from './PatientForm';

describe('PatientForm', () => {
  it('smoke test: renderiza sin errores', () => {
    render(<PatientForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Guardar')).toBeTruthy();
  });

  it('muestra los campos del schema real (name, phone, email, status)', () => {
    const { container } = render(<PatientForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(container.querySelector('#name')).toBeTruthy();
    expect(container.querySelector('#phone')).toBeTruthy();
    expect(container.querySelector('#email')).toBeTruthy();
    expect(container.querySelector('#status')).toBeTruthy();
  });

  it('no muestra campos del schema viejo (documentId, birthDate)', () => {
    const { container } = render(<PatientForm onSubmit={() => {}} onCancel={() => {}} />);
    expect(container.querySelector('#documentId')).toBeFalsy();
    expect(container.querySelector('#birthDate')).toBeFalsy();
  });

  it('botón guardar está deshabilitado cuando loading=true', () => {
    render(<PatientForm onSubmit={() => {}} onCancel={() => {}} loading={true} />);
    const btn = screen.getByRole('button', { name: /guardar/i });
    expect(btn.disabled).toBe(true);
  });

  it('muestra error de validación si se intenta guardar sin nombre', async () => {
    render(<PatientForm onSubmit={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    expect(await screen.findByText('El nombre completo es obligatorio')).toBeTruthy();
  });
});
