import { IReminderRepository } from '../domain/repositories/IReminderRepository.js';
import { db }                  from '../infrastructure/insforge.js';
import { Reminder }            from '../domain/entities/Reminder.js';
import { REMINDER_STATUS }     from '../core/constants.js';

export class InsForgeReminderRepository extends IReminderRepository {
  async findPending(branchId) {
    const { data, error } = await db.from('reminders').select('*')
      .eq('status', REMINDER_STATUS.PENDING);
    if (error) throw new Error(error.message);
    return (data ?? []).map(d => new Reminder(d));
  }

  async save(reminder) {
    const { data, error } = await db.from('reminders').insert(reminder).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async markAsSent(id, sentBy) {
    const { data, error } = await db.from('reminders')
      .update({ status: REMINDER_STATUS.SENT, sentBy, sentAt: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async cancelByAppointment(appointmentId) {
    const { data, error } = await db.from('reminders')
      .update({ status: REMINDER_STATUS.CANCELLED })
      .eq('appointmentId', appointmentId);
    if (error) throw new Error(error.message);
    return data;
  }
}
