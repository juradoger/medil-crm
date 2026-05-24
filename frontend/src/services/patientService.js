// Servicio de pacientes — Patient service
import { db } from '../lib/insforge';
import { PATIENT_STATUS } from '../core/constants';

const COL = 'patients'; // Nombre de colección — Collection name

export const patientService = {
  /** Lista todos los pacientes de una sucursal — Lists all patients for a branch */
  async getAll(branchId) {
    const result = await db.collection(COL).where('branchId', '==', branchId).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Obtiene un paciente por ID — Gets a patient by ID */
  async getById(id) {
    const result = await db.collection(COL).where('id', '==', id).find();
    const rows = Array.isArray(result) ? result : (result.data ?? []);
    return rows[0] ?? null;
  },

  /** Busca pacientes por nombre o CI — Searches patients by name or ID number */
  async search(branchId, query) {
    const all = await patientService.getAll(branchId);
    const q = query.toLowerCase();
    return all.filter(p =>
      p.fullName?.toLowerCase().includes(q) ||
      p.ci?.toLowerCase().includes(q)
    );
  },

  /** Crea un paciente nuevo — Creates a new patient */
  async create(data) {
    const patient = {
      ...data,
      status: PATIENT_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection(COL).create(patient);
    return result;
  },

  /** Actualiza datos de un paciente — Updates patient data */
  async update(id, data) {
    const result = await db.collection(COL).where('id', '==', id).update(data);
    return result;
  },

  /** Elimina un paciente (soft delete: marca inactivo) — Soft-deletes a patient */
  async remove(id) {
    return patientService.update(id, { status: PATIENT_STATUS.INACTIVE });
  },
};
