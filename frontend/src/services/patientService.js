// Servicio de pacientes
import { db } from '../lib/insforge';
import { PATIENT_STATUS } from '../core/constants';

export const patientService = {
  async getAll(_branchId) {
    const { data, error } = await db.from('patients').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getById(id) {
    const { data, error } = await db.from('patients').select('*').eq('id', id);
    if (error) throw new Error(error.message);
    return data?.[0] ?? null;
  },

  async search(_branchId, query) {
    const all = await patientService.getAll();
    const q = query.toLowerCase();
    return all.filter(p => p.name?.toLowerCase().includes(q));
  },

  async create(data) {
    const { data: rows, error } = await db.from('patients').insert({
      name:   data.fullName ?? data.name ?? '',
      email:  data.email  ?? null,
      phone:  data.phone  ?? null,
      status: PATIENT_STATUS.ACTIVE,
    }).select();
    if (error) throw new Error(error.message);
    return rows?.[0];
  },

  async update(id, data) {
    const patch = {};
    if (data.fullName ?? data.name) patch.name  = data.fullName ?? data.name;
    if (data.email  !== undefined)  patch.email  = data.email;
    if (data.phone  !== undefined)  patch.phone  = data.phone;
    if (data.status !== undefined)  patch.status = data.status;
    const { error } = await db.from('patients').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async remove(id) {
    return patientService.update(id, { status: PATIENT_STATUS.INACTIVE });
  },
};
