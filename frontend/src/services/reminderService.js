// Servicio de recordatorios
import { db } from '../lib/insforge';
import { REMINDER_STATUS } from '../core/constants';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('medil_token')}`,
  };
}

export const reminderService = {
  async getAll(_branchId) {
    const { data, error } = await db.from('reminders').select('*');
    if (error) throw new Error(error.message);
    const reminders = data ?? [];

    // Enriquecer con el nombre del paciente para no mostrar el id crudo en la UI
    const ids = [...new Set(reminders.map(r => r.patientId).filter(Boolean))];
    if (ids.length === 0) return reminders;

    const { data: patients } = await db.from('patients').select('id, name');
    const nameById = new Map((patients ?? []).map(p => [p.id, p.name]));
    return reminders.map(r => ({ ...r, patientName: nameById.get(r.patientId) ?? r.patientName }));
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
      status:        data.status        ?? REMINDER_STATUS.PENDING,
    }).select();
    if (error) throw new Error(error.message);
    return rows?.[0];
  },

  async markSent(id, sentBy = null) {
    // Registrar también la fecha de envío para mostrarla en la lista de enviados
    const { error } = await db.from('reminders')
      .update({ status: REMINDER_STATUS.SENT, sentAt: new Date().toISOString(), sentBy })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Reprograma la fecha/hora de envío de un recordatorio (lo deja pendiente)
  async reschedule(id, sendAt) {
    const { error } = await db.from('reminders')
      .update({ sendAt, status: REMINDER_STATUS.PENDING })
      .eq('id', id);
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

  // Envía un recordatorio por WhatsApp vía el servidor Express (Twilio)
  async sendWhatsApp(reminder, patient, appointment, professional) {
    const response = await fetch(`${BACKEND_URL}/api/notify/reminder`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({
        reminderId:       reminder.id,
        patientPhone:     patient?.whatsappPhone || patient?.phone,
        patientName:      patient?.name,
        appointmentDate:  appointment?.date,
        appointmentTime:  appointment?.time,
        professionalName: professional?.fullName || 'Tu médico',
      }),
    });

    const result = await response.json();

    if (!response.ok && !result.simulated) {
      throw new Error(result.message || 'Error al enviar WhatsApp');
    }
    return result;
  },

  // Reúne los datos del paciente/cita/profesional y envía el WhatsApp
  async sendWhatsAppForReminder(reminder) {
    const { data: patient } = await db.from('patients')
      .select('name, whatsappPhone, phone')
      .eq('id', reminder.patientId)
      .single();

    const { data: appointment } = await db.from('appointments')
      .select('date, time, reason, professionalId')
      .eq('id', reminder.appointmentId)
      .single();

    let professional = null;
    if (appointment?.professionalId) {
      const { data } = await db.from('professionals')
        .select('fullName')
        .eq('id', appointment.professionalId)
        .maybeSingle();
      professional = data;
    }

    return reminderService.sendWhatsApp(reminder, patient, appointment, professional);
  },

  // Programa el recordatorio con una fecha específica de envío
  async scheduleReminder(reminderId, sendAt) {
    const response = await fetch(`${BACKEND_URL}/api/notify/schedule`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({ reminderId, sendAt }),
    });
    return response.json();
  },
};
