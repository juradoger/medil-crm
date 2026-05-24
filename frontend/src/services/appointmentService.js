// Servicio de citas — Appointment service
import { db } from '../lib/insforge';
import { APPOINTMENT_STATUS, DEFAULT_APPOINTMENT_DURATION_MINUTES, HOURS_BEFORE_REMINDER } from '../core/constants';
import { reminderService } from './reminderService';

const COL = 'appointments'; // Nombre de colección — Collection name

/** Convierte fecha ISO a fecha sin hora — Strips time from ISO date string */
function toDateStr(iso) {
  return iso.slice(0, 10);
}

/** Retorna true si dos intervalos se solapan — Returns true if two intervals overlap */
function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

export const appointmentService = {
  /** Lista todas las citas de una sucursal — Lists all appointments for a branch */
  async getAll(branchId) {
    const result = await db.collection(COL).where('branchId', '==', branchId).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Lista citas de una fecha específica — Lists appointments for a specific date */
  async getByDate(branchId, date) {
    const all = await appointmentService.getAll(branchId);
    return all.filter(a => toDateStr(a.scheduledAt) === date);
  },

  /** Lista citas de un paciente — Lists appointments for a patient */
  async getByPatient(patientId) {
    const result = await db.collection(COL).where('patientId', '==', patientId).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /**
   * Verifica conflicto de horario para un profesional — Checks schedule conflict for a professional
   * @returns {boolean} true si hay conflicto — true if conflict exists
   */
  async checkConflict(branchId, professionalId, scheduledAt, durationMinutes = DEFAULT_APPOINTMENT_DURATION_MINUTES) {
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    const existing = await appointmentService.getByDate(branchId, toDateStr(scheduledAt));

    return existing
      .filter(a => a.professionalId === professionalId && a.status !== APPOINTMENT_STATUS.CANCELLED)
      .some(a => {
        const aStart = new Date(a.scheduledAt);
        const aEnd = new Date(aStart.getTime() + (a.durationMinutes ?? DEFAULT_APPOINTMENT_DURATION_MINUTES) * 60_000);
        return intervalsOverlap(start, end, aStart, aEnd);
      });
  },

  /**
   * Crea una cita y genera recordatorio automático — Creates appointment and auto-generates reminder
   * Lanza error si hay conflicto de horario — Throws if schedule conflict
   */
  async create(data) {
    const { branchId, professionalId, scheduledAt, durationMinutes = DEFAULT_APPOINTMENT_DURATION_MINUTES } = data;

    const conflict = await appointmentService.checkConflict(branchId, professionalId, scheduledAt, durationMinutes);
    if (conflict) throw new Error('Conflicto de horario — Schedule conflict: professional is busy at that time');

    const appointment = {
      ...data,
      durationMinutes,
      status: APPOINTMENT_STATUS.SCHEDULED,
      createdAt: new Date().toISOString(),
    };
    const created = await db.collection(COL).create(appointment);

    // Recordatorio automático 24h antes — Auto reminder 24h before
    const reminderAt = new Date(new Date(scheduledAt).getTime() - HOURS_BEFORE_REMINDER * 3_600_000).toISOString();
    await reminderService.create({
      appointmentId: created.id ?? created._id,
      patientId: data.patientId,
      branchId,
      scheduledAt,
      reminderAt,
    });

    return created;
  },

  /** Cancela una cita — Cancels an appointment */
  async cancel(id) {
    return db.collection(COL).where('id', '==', id).update({ status: APPOINTMENT_STATUS.CANCELLED });
  },

  /** Marca una cita como atendida — Marks appointment as attended */
  async markAttended(id) {
    return db.collection(COL).where('id', '==', id).update({
      status: APPOINTMENT_STATUS.ATTENDED,
      attendedAt: new Date().toISOString(),
    });
  },
};
