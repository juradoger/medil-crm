import { IAppointmentRepository } from '../domain/repositories/IAppointmentRepository.js';
import { db }                      from '../infrastructure/insforge.js';
import { Appointment }             from '../domain/entities/Appointment.js';
import { APPOINTMENT_STATUS }      from '../core/constants.js';

export class InsForgeAppointmentRepository extends IAppointmentRepository {
  async findAll(branchId) {
    const { data, error } = await db.from('appointments').select('*').eq('branchId', branchId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(d => new Appointment(d));
  }

  async findById(id) {
    const { data, error } = await db.from('appointments').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? new Appointment(data) : null;
  }

  async findByDate(date, branchId) {
    const { data, error } = await db.from('appointments').select('*').eq('date', date).eq('branchId', branchId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(d => new Appointment(d));
  }

  async findByPatient(patientId) {
    const { data, error } = await db.from('appointments').select('*').eq('patientId', patientId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(d => new Appointment(d));
  }

  async findConflict(professionalId, date, time) {
    const { data, error } = await db.from('appointments').select('*')
      .eq('professionalId', professionalId).eq('date', date).eq('time', time)
      .eq('status', APPOINTMENT_STATUS.SCHEDULED).maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? null;
  }

  async save(appointment) {
    const { data, error } = await db.from('appointments').insert(appointment).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateStatus(id, status) {
    const { data, error } = await db.from('appointments').update({ status }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
}
