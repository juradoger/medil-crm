// Servicio de citas
import { db } from '../lib/insforge';
import { APPOINTMENT_STATUS, PATIENT_STATUS } from '../core/constants';
import { MESSAGES } from '../core/messages';
import { appointmentRules } from '../domain/rules/appointmentRules';
import { ReminderFactory } from '../domain/factories/ReminderFactory';
import { reminderService } from './reminderService';
import { patientService } from './patientService';

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

  async getById(id) {
    const { data, error } = await db.from('appointments').select('*').eq('id', id);
    if (error) throw new Error(error.message);
    return data?.[0] ?? null;
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

  // Verifica que el paciente exista y esté activo (un paciente inactivo no puede tener nuevas citas)
  async isPatientActive(patientId) {
    if (!patientId) return false;
    const patient = await patientService.getById(patientId);
    return patient?.status !== PATIENT_STATUS.INACTIVE;
  },

  async create(data) {
    const scheduledAt = data.scheduledAt ?? '';
    const date = toDate(scheduledAt);
    const time = toTime(scheduledAt);
    const reminderConfig = data.reminderConfig ?? null; // timing del recordatorio (AppointmentForm)

    // 1. La cita no puede crearse en el pasado
    if (!appointmentRules.isFutureDate(date, time)) {
      throw new Error(MESSAGES.error.validation.futureDate);
    }
    // 2. Un paciente inactivo no puede tener nuevas citas
    if (!await appointmentService.isPatientActive(data.patientId)) {
      throw new Error(MESSAGES.error.validation.inactivePatient);
    }
    // 3. Un profesional no puede tener dos citas en el mismo horario
    if (await appointmentService.checkConflict(null, data.professionalId, scheduledAt)) {
      throw new Error(MESSAGES.error.validation.timeConflict);
    }

    const { data: rows, error } = await db.from('appointments').insert({
      patientId:      data.patientId      ?? null,
      patientName:    data.patientName    ?? null,
      professionalId: data.professionalId ?? null,
      professional:   data.professionalName ?? data.professional ?? null,
      date,
      time,
      reason:         data.reason ?? null,
    }).select();
    if (error) throw new Error(error.message);

    const created = rows?.[0];

    // 4. Efecto secundario: generar recordatorio automático vía ReminderFactory
    if (created) {
      const reminder = ReminderFactory.createFromAppointment({
        id:        created.id,
        patientId: data.patientId,
        branchId:  data.branchId,
        date,
        time,
      }, reminderConfig);
      await reminderService.create(reminder).catch(() => {});
    }

    return created;
  },

  async cancel(id) {
    // Una cita atendida o ya cancelada no puede cancelarse
    const appointment = await appointmentService.getById(id);
    if (appointment && !appointmentRules.canBeCancelled(appointment)) {
      throw new Error('Solo se pueden cancelar citas agendadas');
    }
    const { error } = await db.from('appointments').update({ status: APPOINTMENT_STATUS.CANCELLED }).eq('id', id);
    if (error) throw new Error(error.message);
    // Al cancelar la cita su recordatorio se cancela también
    await reminderService.cancelByAppointment(id).catch(() => {});
  },

  async markAttended(id) {
    // Una cita cancelada no puede marcarse como atendida
    const appointment = await appointmentService.getById(id);
    if (appointment && !appointmentRules.canBeAttended(appointment)) {
      throw new Error('Solo se pueden atender citas agendadas');
    }
    const { error } = await db.from('appointments').update({ status: APPOINTMENT_STATUS.ATTENDED }).eq('id', id);
    if (error) throw new Error(error.message);
  },
};
