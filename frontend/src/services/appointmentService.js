// Servicio de citas
import { db } from '../lib/insforge';
import { APPOINTMENT_STATUS } from '../core/constants';
import { reminderService } from './reminderService';

function toDate(dt) { return dt?.slice(0, 10) ?? ''; }
function toTime(dt) { return dt?.slice(11, 16) || '00:00'; }

function overlaps(dateA, timeA, dateB, timeB) {
  if (dateA !== dateB) return false;
  const [hA, mA] = timeA.split(':').map(Number);
  const [hB, mB] = timeB.split(':').map(Number);
  return Math.abs(hA * 60 + mA - (hB * 60 + mB)) < 30;
}

export const appointmentService = {
  async getAll(_branchId) {
    const { data, error } = await db.from('appointments').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getByDate(_branchId, date) {
    const { data, error } = await db.from('appointments').select('*').eq('date', date);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getByPatient(patientId) {
    const { data, error } = await db.from('appointments').select('*').eq('patientId', patientId);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async checkConflict(_branchId, professionalId, scheduledAt) {
    const date = toDate(scheduledAt);
    const time = toTime(scheduledAt);
    const dayAppts = await appointmentService.getByDate(null, date);
    return dayAppts
      .filter(a => a.professionalId === professionalId && a.status !== APPOINTMENT_STATUS.CANCELLED)
      .some(a => overlaps(date, time, a.date, a.time?.slice(0, 5)));
  },

  async create(data) {
    const scheduledAt = data.scheduledAt ?? '';
    const conflict = await appointmentService.checkConflict(null, data.professionalId, scheduledAt);
    if (conflict) throw new Error('Conflicto de horario: el profesional ya tiene una cita en ese horario');

    const { data: rows, error } = await db.from('appointments').insert({
      patientId:      data.patientId      ?? null,
      patientName:    data.patientName    ?? null,
      professionalId: data.professionalId ?? null,
      professional:   data.professionalName ?? data.professional ?? null,
      date:           toDate(scheduledAt),
      time:           toTime(scheduledAt),
      reason:         data.reason ?? null,
    }).select();
    if (error) throw new Error(error.message);

    const created = rows?.[0];
    const date = toDate(scheduledAt);
    const time = toTime(scheduledAt);
    const sendAt = new Date(new Date(`${date}T${time}`).getTime() - 24 * 3_600_000).toISOString();
    await reminderService.create({
      appointmentId: created?.id,
      patientId: data.patientId,
      message: `Recuerde su cita el ${date} a las ${time}`,
      sendAt,
    }).catch(() => {});

    return created;
  },

  async cancel(id) {
    const { error } = await db.from('appointments').update({ status: APPOINTMENT_STATUS.CANCELLED }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async markAttended(id) {
    const { error } = await db.from('appointments').update({ status: APPOINTMENT_STATUS.ATTENDED }).eq('id', id);
    if (error) throw new Error(error.message);
  },
};
