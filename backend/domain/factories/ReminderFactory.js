import { REMINDER_STATUS, HOURS_BEFORE_REMINDER } from '../../core/constants.js';

export const ReminderFactory = {
  createFromAppointment(appointment) {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const sendAt = new Date(
      appointmentDateTime.getTime() - HOURS_BEFORE_REMINDER * 60 * 60 * 1000
    );
    return {
      appointmentId: appointment.id,
      patientId:     appointment.patientId,
      message:       ReminderFactory.generateMessage(appointment),
      sendAt:        sendAt.toISOString(),
      status:        REMINDER_STATUS.PENDING,
    };
  },
  generateMessage(appointment) {
    return `Recordatorio: tiene una cita el ${appointment.date} a las ${appointment.time}`;
  },
};
