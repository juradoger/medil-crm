// Servicio de profesionales médicos
import { db } from '../lib/insforge';
import { MESSAGES } from '../core/messages';
import { USER_ROLES, DEFAULT_DOCTOR_PASSWORD, DEFAULT_COMMISSION_RATE } from '../core/constants';

export const professionalService = {
  async getAll() {
    const { data, error } = await db.from('professionals').select('*');
    if (error) throw new Error(MESSAGES.error.connection.server);
    return data ?? [];
  },

  async getById(id) {
    const { data, error } = await db.from('professionals').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },

  // Resuelve el profesional por su email (vínculo con el usuario doctor)
  async getByEmail(email) {
    const { data, error } = await db.from('professionals').select('*').eq('email', email);
    if (error) return null;
    return data?.[0] ?? null;
  },

  // Deriva los profesionales de una sucursal: por branchId propio o, si no lo tienen,
  // por los profesionales con citas en esa sucursal (compatibilidad con datos previos)
  async getByBranch(branchId) {
    const all = await professionalService.getAll();
    const own = all.filter(p => p.branchId === branchId);
    if (own.length > 0) return own;

    const { data: appts, error: apptErr } = await db
      .from('appointments').select('*').eq('branchId', branchId);
    if (apptErr) return [];
    const ids = [...new Set((appts ?? []).map(a => a.professionalId).filter(Boolean))];
    return all.filter(p => ids.includes(p.id));
  },

  async create(professionalData) {
    // created_at/updated_at los gestiona InsForge automáticamente (no enviar camelCase)
    const professional = {
      ...professionalData,
      commissionRate: professionalData.commissionRate ?? DEFAULT_COMMISSION_RATE,
      isActive:  true,
    };
    const { data, error } = await db.from('professionals')
      .insert(professional).select().single();
    if (error) throw new Error(MESSAGES.error.connection.server);

    // Crear también el usuario con rol doctor (credenciales temporales)
    await professionalService.createDoctorUser(professionalData);

    return data;
  },

  // Crea el usuario doctor asociado al profesional (login con contraseña temporal)
  async createDoctorUser(professionalData) {
    const { error } = await db.from('users').insert({
      email:        professionalData.email,
      passwordHash: DEFAULT_DOCTOR_PASSWORD,
      role:         USER_ROLES.DOCTOR,
      fullName:     professionalData.fullName,
      branchId:     professionalData.branchId ?? null,
      isActive:     true,
      photoUrl:     professionalData.photoUrl ?? null,
    });
    // El profesional ya fue creado; un fallo al crear el usuario no debe revertirlo
    if (error) return null;
  },

  async update(id, professionalData) {
    // updated_at lo gestiona InsForge (no enviar camelCase inexistente)
    const { data, error } = await db.from('professionals')
      .update(professionalData)
      .eq('id', id).select();
    if (error) throw new Error(MESSAGES.error.connection.server);
    return data?.[0] ?? null;
  },

  // Actualiza el profesional resolviéndolo por email (vínculo con el usuario)
  async patchByEmail(email, fields) {
    const { data: rows, error } = await db.from('professionals').select('id').eq('email', email);
    if (error) throw new Error(MESSAGES.error.connection.server);
    const id = rows?.[0]?.id;
    if (!id) return null;
    return professionalService.update(id, fields);
  },

  async deactivate(id) {
    const { data, error } = await db.from('professionals')
      .update({ isActive: false })
      .eq('id', id).select();
    if (error) throw new Error(MESSAGES.error.connection.server);
    return data?.[0] ?? null;
  },

  // Reactiva un profesional dado de baja (el admin puede volver a activarlo)
  async activate(id) {
    const { data, error } = await db.from('professionals')
      .update({ isActive: true })
      .eq('id', id).select();
    if (error) throw new Error(MESSAGES.error.connection.server);
    return data?.[0] ?? null;
  },
};
