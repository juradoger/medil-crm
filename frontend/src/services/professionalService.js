// Servicio de profesionales médicos
import { db } from '../lib/insforge';

export const professionalService = {
  async getByBranch(_branchId) {
    const { data, error } = await db.from('professionals').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
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
