import { ReminderFactory } from '../domain/factories/ReminderFactory.js';

export class GenerateReminder {
  constructor(reminderRepository) {
    this.reminderRepo = reminderRepository;
  }

  async execute(appointment) {
    const reminder = ReminderFactory.createFromAppointment(appointment);
    return await this.reminderRepo.save(reminder);
  }
}
