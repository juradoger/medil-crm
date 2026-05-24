// Servicio de autenticación
import { db } from '../lib/insforge';

const TOKEN_KEY = 'medil_token';

export const authService = {
  async login(email, password) {
    const { data, error } = await db.from('users')
      .select('*')
      .eq('email', email)
      .eq('isActive', true);

    if (error) throw new Error('Error de conexión');

    const user = data?.[0] ?? null;
    if (!user) throw new Error('Credenciales inválidas');
    if (user.passwordHash !== password) throw new Error('Credenciales inválidas');

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
};
