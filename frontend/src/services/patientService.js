// Servicio de pacientes — Patient service
import { db } from '../lib/insforge';
import { PATIENT_STATUS } from '../core/constants';

const COL = 'patients'; // Nombre de colección — Collection name

// Campos reales en InsForge: id, name, email, phone, status, createdAt
// Real InsForge fields: id, name, email, phone, status, createdAt

export const patientService = {
  /** Lista todos los pacientes activos — Lists all active patients */
  async getAll(_branchId) {
    const result = await db.collection(COL).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Obtiene un paciente por ID — Gets a patient by ID */
  async getById(id) {
    const result = await db.collection(COL).where('id', '==', id).find();
    const rows = Array.isArray(result) ? result : (result.data ?? []);
    return rows[0] ?? null;
  },

  /** Busca pacientes por nombre — Searches patients by name */
  async search(_branchId, query) {
    const all = await patientService.getAll();
    const q = query.toLowerCase();
    return all.filter(p => p.name?.toLowerCase().includes(q));
  },

  /** Crea un paciente nuevo — Creates a new patient */
  async create(data) {
    const patient = {
      name:   data.fullName ?? data.name ?? '',
      email:  data.email  ?? null,
      phone:  data.phone  ?? null,
      status: PATIENT_STATUS.ACTIVE,
    };
    return db.collection(COL).create(patient);
  },

  /** Actualiza datos de un paciente — Updates patient data */
  async update(id, data) {
    const patch = {};
    if (data.fullName ?? data.name) patch.name  = data.fullName ?? data.name;
    if (data.email  !== undefined)  patch.email  = data.email;
    if (data.phone  !== undefined)  patch.phone  = data.phone;
    if (data.status !== undefined)  patch.status = data.status;
    return db.collection(COL).where('id', '==', id).update(patch);
  },

  /** Desactiva un paciente — Deactivates a patient */
  async remove(id) {
    return patientService.update(id, { status: PATIENT_STATUS.INACTIVE });
  },
};
