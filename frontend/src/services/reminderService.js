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
