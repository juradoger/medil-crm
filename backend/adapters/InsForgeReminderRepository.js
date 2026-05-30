import { IReminderRepository } from '../domain/repositories/IReminderRepository.js';
import { db }                  from '../infrastructure/insforge.js';
import { Reminder }            from '../domain/entities/Reminder.js';

export class InsForgeReminderRepository extends IReminderRepository {
  async findPending(branchId) {
    const data = await db.from('reminders').select('*')
      .eq('branchId', branchId).eq('status', 'pending');
    return (data ?? []).map(d => new Reminder(d));
  }

  async save(reminder) {
    return await db.from('reminders').insert(reminder).select().single();
  }

  async markAsSent(id, sentBy) {
    return await db.from('reminders').update({ status: 'sent', sentBy }).eq('id', id).select().single();
  }

  async cancelByAppointment(appointmentId) {
    return await db.from('reminders').update({ status: 'cancelled' }).eq('appointmentId', appointmentId);
  }
}
