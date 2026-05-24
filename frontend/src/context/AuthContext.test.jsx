// Tests del contexto de autenticación — Authentication context tests
import React from 'react';
import { vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock del servicio de autenticación — Auth service mock
vi.mock('../services/authService', () => ({
  authService: {
    getToken:       vi.fn().mockReturnValue(null),
    getCurrentUser: vi.fn().mockResolvedValue(null),
    logout:         vi.fn(),
    login:          vi.fn(),
  },
}));

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  it('isAuthenticated es false por defecto — isAuthenticated is false by default', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('hasRole retorna false sin usuario — hasRole returns false without user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(result.current.hasRole('admin')).toBe(false);
    });
  });
});
