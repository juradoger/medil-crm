// Contexto global de autenticación — Global authentication context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Proveedor de autenticación — Authentication provider
 * Provee: user, login, logout, isAuthenticated, hasRole, currentBranchId
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sesión desde localStorage al montar — Restores session from localStorage on mount
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      authService.getCurrentUser(token)
        .then(u => setUser(u))
        .catch(() => authService.logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Inicia sesión y guarda el usuario en estado — Logs in and saves user to state
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} user
   */
  const login = async (email, password) => {
    const { user: u } = await authService.login(email, password);
    setUser(u);
    return u;
  };

  // Cierra sesión y limpia estado — Logs out and clears state
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /**
   * Verifica si el usuario tiene alguno de los roles dados — Checks if user has any of the given roles
   * @param {string|string[]} roles
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated:  !!user,
      hasRole,
      currentBranchId:  user?.branchId ?? null,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación — Hook to access auth context
 * @returns {{ user, login, logout, isAuthenticated, hasRole, currentBranchId, loading }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider — must be used within AuthProvider');
  return ctx;
}
