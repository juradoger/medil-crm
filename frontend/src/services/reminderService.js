// Servicio de recordatorios — Reminder service
import { db } from '../lib/insforge';
import { REMINDER_STATUS } from '../core/constants';

const COL = 'reminders'; // Nombre de colección — Collection name

export const reminderService = {
  /** Lista recordatorios pendientes de una sucursal — Lists pending reminders for a branch */
  async getPending(branchId) {
    const result = await db.collection(COL)
      .where('branchId', '==', branchId)
      .where('status', '==', REMINDER_STATUS.PENDING)
      .find();
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /** Crea un recordatorio — Creates a reminder */
  async create(data) {
    const reminder = {
      ...data,
      status: REMINDER_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    };
    return db.collection(COL).create(reminder);
  },

  /** Marca un recordatorio como enviado — Marks a reminder as sent */
  async markSent(id) {
    return db.collection(COL).where('id', '==', id).update({
      status: REMINDER_STATUS.SENT,
      sentAt: new Date().toISOString(),
    });
  },
};
