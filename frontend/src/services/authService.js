// Servicio de autenticación
import { db } from '../lib/insforge';
import { MESSAGES } from '../core/messages';

const TOKEN_KEY = 'medil_token';

export const authService = {
  async login(email, password) {
    const { data, error } = await db.from('users')
      .select('*')
      .eq('email', email)
      .eq('isActive', true);

    if (error) throw new Error(MESSAGES.error.connection.server);

    const user = data?.[0] ?? null;
    if (!user) throw new Error(MESSAGES.error.auth.invalidCredentials);
    if (user.passwordHash !== password) throw new Error(MESSAGES.error.auth.invalidCredentials);

    const payload = { id: user.id, email: user.email, role: user.role, branchId: user.branchId };
    localStorage.setItem(TOKEN_KEY, btoa(JSON.stringify(payload)));

    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, token: btoa(JSON.stringify(payload)) };
  },

  async getCurrentUser(token) {
    try {
      const payload = JSON.parse(atob(token));
      const { data } = await db.from('users').select('*').eq('id', payload.id);
      const user = data?.[0] ?? null;
      if (!user) return null;
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    } catch {
      return null;
    }
  },

  logout() { localStorage.removeItem(TOKEN_KEY); },
  getToken() { return localStorage.getItem(TOKEN_KEY); },

  // Actualiza el registro del usuario (tabla users) por su id real.
  // Solo columnas existentes en users: fullName, email, photoUrl.
  async updateProfile(userId, fields) {
    const { data, error } = await db.from('users').update(fields).eq('id', userId).select();
    if (error) throw new Error(MESSAGES.error.connection.server);
    return data?.[0] ?? null;
  },
};
