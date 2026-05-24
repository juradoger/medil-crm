// Servicio de sucursales — Branch service
import { db } from '../lib/insforge';

const COL = 'branches'; // Nombre de colección — Collection name

export const branchService = {
  /** Lista todas las sucursales — Lists all branches */
  async getAll() {
    const result = await db.collection(COL).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Obtiene una sucursal por ID — Gets a branch by ID */
  async getById(id) {
    const result = await db.collection(COL).where('id', '==', id).find();
    const rows = Array.isArray(result) ? result : (result.data ?? []);
    return rows[0] ?? null;
  },

  /** Crea una sucursal — Creates a branch */
  async create(data) {
    const branch = { ...data, createdAt: new Date().toISOString() };
    return db.collection(COL).create(branch);
  },

  /** Actualiza una sucursal — Updates a branch */
  async update(id, data) {
    return db.collection(COL).where('id', '==', id).update(data);
  },
};
