import { REMINDER_STATUS, HOURS_BEFORE_REMINDER } from '../../core/constants';

export const ReminderFactory = {
  createFromAppointment(appointment) {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    // Calcula la fecha de envío restando las horas configuradas antes de la cita
    const sendAt = new Date(
      appointmentDateTime.getTime() - HOURS_BEFORE_REMINDER * 60 * 60 * 1000
    );
    return {
      appointmentId: appointment.id,
      patientId:     appointment.patientId,
      branchId:      appointment.branchId,
      message:       ReminderFactory.generateMessage(appointment),
      sendAt:        sendAt.toISOString(),
      status:        REMINDER_STATUS.PENDING,
      sentBy:        null,
      sentAt:        null,
      createdAt:     new Date().toISOString(),
    };
  },
  generateMessage(appointment) {
    return `Recordatorio: tiene una cita el ${appointment.date} a las ${appointment.time}`;
  },
};
