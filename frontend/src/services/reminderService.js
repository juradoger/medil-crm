// Servicio de recordatorios
import { db } from '../lib/insforge';
import { REMINDER_STATUS } from '../core/constants';

export const reminderService = {
  async getAll(_branchId) {
    const { data, error } = await db.from('reminders').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getPending(_branchId) {
    const { data, error } = await db.from('reminders').select('*').eq('status', REMINDER_STATUS.PENDING);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(data) {
    const { data: rows, error } = await db.from('reminders').insert({
      appointmentId: data.appointmentId ?? null,
      patientId:     data.patientId     ?? null,
      message:       data.message       ?? null,
      sendAt:        data.sendAt        ?? data.reminderAt ?? null,
    }).select();
    if (error) throw new Error(error.message);
    return rows?.[0];
  },

  async markSent(id) {
    const { error } = await db.from('reminders').update({ status: REMINDER_STATUS.SENT }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Cancela los recordatorios asociados a una cita (al cancelar la cita)
  async cancelByAppointment(appointmentId) {
    if (!appointmentId) return;
    const { error } = await db.from('reminders')
      .update({ status: REMINDER_STATUS.CANCELLED })
      .eq('appointmentId', appointmentId);
    if (error) throw new Error(error.message);
  },
};
