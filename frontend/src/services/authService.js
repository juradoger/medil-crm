// Servicio de autenticación — Authentication service
import { db } from '../lib/insforge';

const TOKEN_KEY = 'medil_token';

export const authService = {
  /**
   * Autentica al usuario por email y password — Authenticates user by email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login(email, password) {
    const result = await db.collection('users')
      .where('email', '==', email)
      .where('isActive', '==', true)
      .find();

    const users = Array.isArray(result) ? result : (result.data ?? []);
    const user  = users[0] ?? null;

    if (!user) {
      throw new Error('Credenciales inválidas — Invalid credentials');
    }

    // Comparación simple — Simple comparison (producción usa bcrypt — production uses bcrypt)
    if (user.passwordHash !== password) {
      throw new Error('Credenciales inválidas — Invalid credentials');
    }

    const payload = { id: user.id, email: user.email, role: user.role, branchId: user.branchId };
    const token   = btoa(JSON.stringify(payload));
    localStorage.setItem(TOKEN_KEY, token);

    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, token };
  },

  /**
   * Obtiene el usuario actual desde el token — Gets current user from token
   * @param {string} token
   * @returns {Promise<object|null>}
   */
  async getCurrentUser(token) {
    try {
      const payload = JSON.parse(atob(token));
      const result  = await db.collection('users').where('id', '==', payload.id).find();
      const users   = Array.isArray(result) ? result : (result.data ?? []);
      const user    = users[0] ?? null;
      if (!user) return null;
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    } catch {
      return null;
    }
  },

  // Cierra sesión limpiando localStorage — Logs out by clearing localStorage
  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Retorna el token almacenado — Returns stored token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};
