import { IAppointmentRepository } from '../domain/repositories/IAppointmentRepository.js';
import { db }                      from '../infrastructure/insforge.js';
import { Appointment }             from '../domain/entities/Appointment.js';

export class InsForgeAppointmentRepository extends IAppointmentRepository {
  async findAll(branchId) {
    const data = await db.from('appointments').select('*').eq('branchId', branchId);
    return (data ?? []).map(d => new Appointment(d));
  }

  async findById(id) {
    const data = await db.from('appointments').select('*').eq('id', id).single();
    return data ? new Appointment(data) : null;
  }

  async findByDate(date, branchId) {
    const data = await db.from('appointments').select('*').eq('date', date).eq('branchId', branchId);
    return (data ?? []).map(d => new Appointment(d));
  }

  async findByPatient(patientId) {
    const data = await db.from('appointments').select('*').eq('patientId', patientId);
    return (data ?? []).map(d => new Appointment(d));
  }

  async findConflict(professionalId, date, time) {
    const data = await db.from('appointments').select('*')
      .eq('professionalId', professionalId).eq('date', date).eq('time', time)
      .eq('status', 'scheduled').maybeSingle();
    return data ?? null;
  }

  async save(appointment) {
    return await db.from('appointments').insert(appointment).select().single();
  }

  async updateStatus(id, status) {
    return await db.from('appointments').update({ status }).eq('id', id).select().single();
  }
}
