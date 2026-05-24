// Servicio de recordatorios — Reminder service
import { db } from '../lib/insforge';
import { REMINDER_STATUS } from '../core/constants';

const COL = 'reminders'; // Nombre de colección — Collection name

// Campos reales en InsForge: id, appointmentId, patientId, message, sendAt, status
// Real InsForge fields: id, appointmentId, patientId, message, sendAt, status

export const reminderService = {
  /** Lista recordatorios pendientes — Lists pending reminders */
  async getPending(_branchId) {
    const result = await db.collection(COL).where('status', '==', REMINDER_STATUS.PENDING).find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Crea un recordatorio — Creates a reminder */
  async create(data) {
    const reminder = {
      appointmentId: data.appointmentId ?? null,
      patientId:     data.patientId     ?? null,
      message:       data.message       ?? null,
      sendAt:        data.sendAt        ?? data.reminderAt ?? null,
    };
    return db.collection(COL).create(reminder);
  },

  /** Marca un recordatorio como enviado — Marks a reminder as sent */
  async markSent(id) {
    return db.collection(COL).where('id', '==', id).update({ status: REMINDER_STATUS.SENT });
  },
};
