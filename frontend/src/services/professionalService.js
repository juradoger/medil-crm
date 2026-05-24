// Servicio de profesionales médicos — Medical professional service
import { db } from '../lib/insforge';

const COL = 'professionals'; // Nombre de colección — Collection name

export const professionalService = {
  /** Lista profesionales de una sucursal — Lists professionals for a branch */
  async getByBranch(branchId) {
    const result = await db.collection(COL).where('branchId', '==', branchId).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Crea un profesional — Creates a professional */
  async create(data) {
    const professional = { ...data, createdAt: new Date().toISOString() };
    return db.collection(COL).create(professional);
  },

  /** Actualiza un profesional — Updates a professional */
  async update(id, data) {
    return db.collection(COL).where('id', '==', id).update(data);
  },
};
