// Servicio de sucursales
import { db } from '../lib/insforge';
import { BRANCH_STATUS } from '../core/constants';

export const branchService = {
  async getAll() {
    const { data, error } = await db.from('branches').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getById(id) {
    const { data, error } = await db.from('branches').select('*').eq('id', id);
    if (error) throw new Error(error.message);
    return data?.[0] ?? null;
  },

  async create(data) {
    // Toda sucursal nueva nace activa para que aparezca en el portal público
    // (que filtra por status = 'active'); si se pasa status explícito, ese gana.
    const { data: rows, error } = await db.from('branches')
      .insert({ status: BRANCH_STATUS.ACTIVE, ...data }).select();
    if (error) throw new Error(error.message);
    return rows?.[0];
  },

  async update(id, data) {
    const { error } = await db.from('branches').update(data).eq('id', id);
    if (error) throw new Error(error.message);
  },
};
