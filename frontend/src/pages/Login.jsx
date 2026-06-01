// Página de inicio de sesión
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../core/constants';
import { AuthLayout } from '../templates/AuthLayout';
import { FormField } from '../molecules/FormField';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { MESSAGES } from '../core/messages';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Errores de validación locales
  const [emailError, setEmailError]       = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleTestUser = (role) => {
    setError('');
    setEmailError('');
    setPasswordError('');
    // Credenciales reales insertadas por scripts/seed-insforge.js
    if (role === 'admin') {
      setEmail('admin.lapaz@medil.com');
      setPassword('admin123');
    } else if (role === 'doctor') {
      setEmail('mamani.marco@medil.com');
      setPassword('doctor123');
    } else if (role === 'patient') {
      setEmail('marco.antonio.mamani.0@gmail.com');
      setPassword('paciente123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    let isValid = true;
    if (!email.trim()) {
      setEmailError(MESSAGES.error.validation.required('Correo electrónico'));
      isValid = false;
    }
    if (!password) {
      setPasswordError(MESSAGES.error.validation.required('Contraseña'));
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === USER_ROLES.ADMIN) {
        navigate('/', { replace: true });
      } else if (user.role === USER_ROLES.DOCTOR) {
        navigate('/doctor/console', { replace: true });
      } else {
        navigate('/patient/portal', { replace: true });
      }
    } catch (err) {
      setError(err.message || MESSAGES.error.auth.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-center text-navy mb-6">
        Iniciar sesión
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Correo electrónico" error={emailError}>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value.trim()) setEmailError('');
            }}
            placeholder="correo@medil.com"
            error={!!emailError}
            disabled={loading}
          />
        </FormField>

        <FormField label="Contraseña" error={passwordError}>
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value) setPasswordError('');
            }}
            placeholder="••••••••"
            error={!!passwordError}
            disabled={loading}
          />
        </FormField>

        <Button
          type="submit"
          label="Ingresar"
          loading={loading}
          fullWidth
        />

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400 text-center my-4">
            Acceso de prueba — elegí un rol
          </span>
          <div className="flex justify-center gap-2 w-full">
            <Button
              type="button"
              label="Administrador"
              variant="ghost"
              size="sm"
              onClick={() => handleTestUser('admin')}
              disabled={loading}
            />
            <Button
              type="button"
              label="Médico"
              variant="ghost"
              size="sm"
              onClick={() => handleTestUser('doctor')}
              disabled={loading}
            />
            <Button
              type="button"
              label="Paciente"
              variant="ghost"
              size="sm"
              onClick={() => handleTestUser('patient')}
              disabled={loading}
            />
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
