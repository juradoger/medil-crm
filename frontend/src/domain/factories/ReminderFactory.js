import { REMINDER_STATUS, HOURS_BEFORE_REMINDER } from '../../core/constants';

export const ReminderFactory = {
  // reminderConfig (opcional) define cuándo se envía el recordatorio:
  // { timing: '24h' | '1h' | 'now' | 'custom', customTime: 'HH:MM' | null }
  createFromAppointment(appointment, reminderConfig = null) {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);

    let sendAt;

    if (!reminderConfig || reminderConfig.timing === '24h') {
      // Default: 24 horas antes
      sendAt = new Date(appointmentDateTime.getTime() - HOURS_BEFORE_REMINDER * 3600000);
    } else if (reminderConfig.timing === '1h') {
      sendAt = new Date(appointmentDateTime.getTime() - 1 * 3600000);
    } else if (reminderConfig.timing === 'now') {
      sendAt = new Date();
    } else if (reminderConfig.timing === 'custom' && reminderConfig.customTime) {
      // Hora específica en el mismo día de la cita
      const [hours, minutes] = reminderConfig.customTime.split(':');
      sendAt = new Date(appointmentDateTime);
      sendAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    } else {
      sendAt = new Date(appointmentDateTime.getTime() - HOURS_BEFORE_REMINDER * 3600000);
    }

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
