// Servicio de pacientes
import { db } from '../lib/insforge';
import { PATIENT_STATUS } from '../core/constants';
import { MESSAGES } from '../core/messages';

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

  // Resuelve el paciente por su email (los pacientes se vinculan al usuario por email)
  async getByEmail(email) {
    const { data, error } = await db.from('patients').select('*').eq('email', email);
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
      ci:     data.ci     ?? null,
      email:  data.email  ?? null,
      phone:  data.phone  ?? null,
      status: PATIENT_STATUS.ACTIVE,
    }).select();
    if (error) throw new Error(error.message);
    return rows?.[0];
  },

  // Actualiza el registro del paciente resolviéndolo por email (los pacientes
  // se vinculan al usuario por email, no por id). Escribe los campos tal cual.
  async patchByEmail(email, fields) {
    const { data: rows, error } = await db.from('patients').select('id').eq('email', email);
    if (error) throw new Error(MESSAGES.error.connection.server);
    const id = rows?.[0]?.id;
    if (!id) return null;
    const { data, error: updateErr } = await db.from('patients').update(fields).eq('id', id).select();
    if (updateErr) throw new Error(MESSAGES.error.connection.server);
    return data?.[0] ?? null;
  },

  async update(id, data) {
    const patch = {};
    if (data.fullName ?? data.name) patch.name  = data.fullName ?? data.name;
    if (data.ci     !== undefined)  patch.ci     = data.ci;
    if (data.email  !== undefined)  patch.email  = data.email;
    if (data.phone  !== undefined)  patch.phone  = data.phone;
    if (data.status !== undefined)  patch.status = data.status;
    const { error } = await db.from('patients').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async remove(id) {
    return patientService.update(id, { status: PATIENT_STATUS.INACTIVE });
  },

  // Actualiza el seguro médico del paciente — isInsured se deriva del código
  async updateInsurance(id, insuranceCode) {
    const isInsured = insuranceCode
      ? (insuranceCode.toUpperCase().endsWith('MED') ||
         insuranceCode.toUpperCase().endsWith('SAL'))
      : false;

    const { data, error } = await db.from('patients')
      .update({ insuranceCode, isInsured, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(MESSAGES.error.connection.server);
    return data;
  },

  // Consulta el estado de afiliación de un paciente
  async checkInsurance(patientId) {
    const { data, error } = await db.from('patients')
      .select('insuranceCode, isInsured')
      .eq('id', patientId)
      .single();

    if (error) return { isInsured: false, insuranceCode: null };
    return data;
  },
};
