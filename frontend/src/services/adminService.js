// Servicio de administradores — gestión de usuarios con rol admin por sucursal
import { db } from '../lib/insforge';
import { MESSAGES } from '../core/messages';
import { USER_ROLES } from '../core/constants';
import { patientService } from './patientService';

export const adminService = {
  async getAll() {
    const { data, error } = await db.from('users').select('*').eq('role', USER_ROLES.ADMIN);
    if (error) throw new Error(MESSAGES.error.connection.server);
    return data ?? [];
  },

  // Busca a la persona por email para decidir el flujo:
  // - source 'user'    → ya tiene cuenta (se elevará al rol admin, sin pedir contraseña)
  // - source 'patient' → no tiene cuenta de usuario pero sí ficha de paciente (precarga nombre/teléfono)
  // - source null      → es nueva (se pedirán todos los datos)
  async lookup(email) {
    const clean = (email ?? '').trim().toLowerCase();
    if (!clean) return null;

    const { data: users, error } = await db.from('users').select('*').eq('email', clean);
    if (error) throw new Error(MESSAGES.error.connection.server);
    const user = users?.[0] ?? null;
    if (user) {
      return { exists: true, source: 'user', user, fullName: user.fullName ?? '', role: user.role };
    }

    const patient = await patientService.getByEmail(clean).catch(() => null);
    if (patient) {
      return { exists: false, source: 'patient', fullName: patient.name ?? '', phone: patient.phone ?? '' };
    }
    return { exists: false, source: null, fullName: '' };
  },

  // Crea un admin nuevo o eleva una cuenta existente al rol admin de una sucursal.
  // Devuelve { admin, elevated } para que la UI muestre el mensaje correcto.
  async createOrElevate({ email, fullName, password, branchId }) {
    const clean = (email ?? '').trim().toLowerCase();

    const { data: existingRows, error: findErr } = await db.from('users').select('*').eq('email', clean);
    if (findErr) throw new Error(MESSAGES.error.connection.server);
    const existing = existingRows?.[0];

    if (existing) {
      // Elevar: conserva login y datos, solo cambia rol y sucursal y reactiva la cuenta
      const { data, error } = await db.from('users')
        .update({ role: USER_ROLES.ADMIN, branchId, isActive: true })
        .eq('id', existing.id).select();
      if (error) throw new Error(MESSAGES.error.connection.server);
      return { admin: data?.[0] ?? null, elevated: true };
    }

    // Crear cuenta admin nueva
    const { data, error } = await db.from('users').insert({
      email:        clean,
      passwordHash: password,
      role:         USER_ROLES.ADMIN,
      fullName,
      branchId,
      isActive:     true,
    }).select();
    if (error) throw new Error(MESSAGES.error.connection.server);
    return { admin: data?.[0] ?? null, elevated: false };
  },
};
