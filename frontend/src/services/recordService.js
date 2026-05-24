// Servicio de historiales médicos — Medical record service
import { db } from '../lib/insforge';

const COL = 'medical_records'; // Nombre de colección — Collection name

export const recordService = {
  /** Lista el historial médico de un paciente — Lists medical history for a patient */
  async getByPatient(patientId) {
    const result = await db.collection(COL).where('patientId', '==', patientId).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Crea un registro médico — Creates a medical record */
  async create(data) {
    const record = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    return db.collection(COL).create(record);
  },
};
