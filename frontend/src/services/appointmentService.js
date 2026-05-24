// Servicio de citas — Appointment service
import { db } from '../lib/insforge';
import { APPOINTMENT_STATUS } from '../core/constants';
import { reminderService } from './reminderService';

const COL = 'appointments'; // Nombre de colección — Collection name

// Campos reales en InsForge: id, patientId, patientName, professionalId, professional, date, time, reason, status, createdAt
// Real InsForge fields: id, patientId, patientName, professionalId, professional, date, time, reason, status, createdAt

/** Extrae YYYY-MM-DD de un datetime-local o ISO — Extracts YYYY-MM-DD from datetime-local or ISO */
function toDate(dt) { return dt?.slice(0, 10) ?? ''; }

/** Extrae HH:MM de un datetime-local o ISO — Extracts HH:MM from datetime-local or ISO */
function toTime(dt) {
  if (!dt) return '00:00';
  const t = dt.slice(11, 16); // 'HH:MM'
  return t || '00:00';
}

/** Convierte date+time a ISO para comparar — Converts date+time to ISO for comparison */
function toISO(date, time) { return `${date}T${time}:00`; }

/** Retorna true si dos intervalos de 30 min se solapan — True if two 30-min intervals overlap */
function overlaps(dateA, timeA, dateB, timeB) {
  if (dateA !== dateB) return false;
  const [hA, mA] = timeA.split(':').map(Number);
  const [hB, mB] = timeB.split(':').map(Number);
  const minA = hA * 60 + mA;
  const minB = hB * 60 + mB;
  return Math.abs(minA - minB) < 30;
}

export const appointmentService = {
  /** Lista todas las citas — Lists all appointments */
  async getAll(_branchId) {
    const result = await db.collection(COL).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Lista citas de una fecha — Lists appointments for a date */
  async getByDate(_branchId, date) {
    const all = await appointmentService.getAll();
    return all.filter(a => a.date === date);
  },

  /** Lista citas de un paciente — Lists appointments for a patient */
  async getByPatient(patientId) {
    const result = await db.collection(COL).where('patientId', '==', patientId).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Verifica conflicto de horario — Checks schedule conflict */
  async checkConflict(_branchId, professionalId, scheduledAt) {
    const date = toDate(scheduledAt);
    const time = toTime(scheduledAt);
    const dayAppts = await appointmentService.getByDate(null, date);
    return dayAppts
      .filter(a => a.professionalId === professionalId && a.status !== APPOINTMENT_STATUS.CANCELLED)
      .some(a => overlaps(date, time, a.date, a.time?.slice(0, 5)));
  },

  /**
   * Crea una cita y recordatorio automático — Creates appointment + auto reminder
   * Lanza error si hay conflicto — Throws on schedule conflict
   */
  async create(data) {
    const scheduledAt = data.scheduledAt ?? '';
    const date = toDate(scheduledAt);
    const time = toTime(scheduledAt);

    const conflict = await appointmentService.checkConflict(null, data.professionalId, scheduledAt);
    if (conflict) throw new Error('Conflicto de horario — Schedule conflict: professional is busy at that time');

    const appointment = {
      patientId:      data.patientId      ?? null,
      patientName:    data.patientName    ?? null,
      professionalId: data.professionalId ?? null,
      professional:   data.professionalName ?? data.professional ?? null,
      date,
      time,
      reason:         data.reason ?? null,
    };
    const created = await db.collection(COL).create(appointment);

    // Recordatorio 24h antes — Auto reminder 24h before
    const apptISO = toISO(date, time);
    const sendAt = new Date(new Date(apptISO).getTime() - 24 * 3_600_000).toISOString();
    await reminderService.create({
      appointmentId: created.id ?? created._id,
      patientId: data.patientId,
      message: `Recuerde su cita el ${date} a las ${time}`,
      sendAt,
    }).catch(() => {}); // no bloquea si falla — don't block if reminder fails

    return created;
  },

  /** Cancela una cita — Cancels an appointment */
  async cancel(id) {
    return db.collection(COL).where('id', '==', id).update({ status: APPOINTMENT_STATUS.CANCELLED });
  },

  /** Marca cita como atendida — Marks appointment as attended */
  async markAttended(id) {
    return db.collection(COL).where('id', '==', id).update({ status: APPOINTMENT_STATUS.ATTENDED });
  },
};
