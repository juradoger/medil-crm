// Servicio de historiales médicos
import { db } from '../lib/insforge';

export const recordService = {
  async getByPatient(patientId) {
    const { data, error } = await db.from('medical_records').select('*').eq('patientId', patientId);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(data) {
    const { data: rows, error } = await db.from('medical_records').insert({
      patientId:     data.patientId     ?? null,
      appointmentId: data.appointmentId ?? null,
      diagnosis:     data.diagnosis     ?? null,
      notes:         data.notes         ?? null,
    }).select();
    if (error) throw new Error(error.message);
    return rows?.[0];
  },
};
