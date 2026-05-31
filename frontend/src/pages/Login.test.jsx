import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

const mockLogin = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mockear useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('smoke test: renderiza sin errores', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
  });

  it('muestra campo email y password', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('correo@medil.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy();
  });

  it('muestra botón Ingresar', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeTruthy();
  });

  it('muestra 3 botones de acceso rápido', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: 'Administrador' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Médico' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Paciente' })).toBeTruthy();
  });

  it('llama login al hacer submit', async () => {
    mockLogin.mockResolvedValue({ role: 'admin' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('correo@medil.com');
    const pwdInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: 'Ingresar' });

    fireEvent.change(emailInput, { target: { value: 'admin@medil.com' } });
    fireEvent.change(pwdInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@medil.com', 'admin123');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
