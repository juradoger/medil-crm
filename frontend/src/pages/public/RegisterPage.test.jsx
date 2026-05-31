import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import RegisterPage from './RegisterPage';

// Mockear backendService para evitar llamadas reales
vi.mock('../../services/backendService', () => ({
  publicApi: {
    getBranches: vi.fn().mockResolvedValue({ branches: [
      { id: 'b1', name: 'Clínica Central', city: 'La Paz' },
    ]}),
    register: vi.fn().mockResolvedValue({ message: 'OK' }),
  },
  uploadApi: { publicRegisterPhoto: vi.fn() },
}));

function Wrapper({ children }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  it('smoke test: renderiza sin errores', () => {
    render(<Wrapper><RegisterPage /></Wrapper>);
    expect(screen.getByText('Crear cuenta de paciente')).toBeTruthy();
  });

  it('muestra todos los campos del formulario', () => {
    render(<Wrapper><RegisterPage /></Wrapper>);
    expect(screen.getByText('Nombre completo')).toBeTruthy();
    expect(screen.getByText('Teléfono')).toBeTruthy();
    expect(screen.getByText('Correo electrónico')).toBeTruthy();
    expect(screen.getByText('Contraseña')).toBeTruthy();
    expect(screen.getByText('Confirmar contraseña')).toBeTruthy();
    expect(screen.getByText('Clínica')).toBeTruthy();
  });

  it('muestra error cuando las contraseñas no coinciden', async () => {
    render(<Wrapper><RegisterPage /></Wrapper>);
    const inputs = screen.getAllByRole('textbox');
    // name, phone, email
    fireEvent.change(inputs[0], { target: { value: 'Ana García' } });
    fireEvent.change(inputs[1], { target: { value: '+591 70001234' } });
    fireEvent.change(inputs[2], { target: { value: 'ana@example.com' } });
    // password fields son type="password", no son textbox
    const allInputs = document.querySelectorAll('input');
    const pwdInput  = Array.from(allInputs).find(i => i.type === 'password');
    const cpwdInput = Array.from(allInputs).filter(i => i.type === 'password')[1];
    if (pwdInput)  fireEvent.change(pwdInput,  { target: { value: 'pass123' } });
    if (cpwdInput) fireEvent.change(cpwdInput, { target: { value: 'otraclave' } });
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(await screen.findByText('Las contraseñas no coinciden')).toBeTruthy();
  });

  it('muestra error cuando la contraseña es muy corta', async () => {
    render(<Wrapper><RegisterPage /></Wrapper>);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Ana García' } });
    fireEvent.change(inputs[1], { target: { value: '+591 70001234' } });
    fireEvent.change(inputs[2], { target: { value: 'ana@example.com' } });
    const pwdInput = Array.from(document.querySelectorAll('input')).find(i => i.type === 'password');
    if (pwdInput) fireEvent.change(pwdInput, { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(await screen.findByText('Mínimo 6 caracteres')).toBeTruthy();
  });
});
