// Servicio de profesionales médicos
// professionals no tiene branchId — se filtra por sucursal via appointments
import { db } from '../lib/insforge';

export const professionalService = {
  async getAll() {
    const { data, error } = await db.from('professionals').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getByBranch(branchId) {
    // 1. Traer appointments de la sucursal para extraer professionalIds únicos
    const { data: appts, error: apptErr } = await db
      .from('appointments').select('*').eq('branchId', branchId);
    if (apptErr) throw new Error(apptErr.message);

    const ids = [...new Set(
      (appts ?? []).map(a => a.professionalId).filter(Boolean)
    )];

    if (ids.length === 0) return [];

    // 2. Traer todos los professionals y filtrar por los ids encontrados
    const all = await professionalService.getAll();
    return all.filter(p => ids.includes(p.id));
  },

  async create(data) {
    const { data: rows, error } = await db.from('professionals').insert(data).select();
    if (error) throw new Error(error.message);
    return rows?.[0];
  },

  async update(id, data) {
    const { error } = await db.from('professionals').update(data).eq('id', id);
    if (error) throw new Error(error.message);
  },
};
