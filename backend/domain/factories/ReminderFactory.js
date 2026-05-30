const HOURS_BEFORE_REMINDER = 24;

export const ReminderFactory = {
  createFromAppointment(appointment) {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const scheduledDate = new Date(
      appointmentDateTime.getTime() - HOURS_BEFORE_REMINDER * 60 * 60 * 1000
    );
    return {
      appointmentId: appointment.id,
      patientId:     appointment.patientId,
      branchId:      appointment.branchId,
      message:       ReminderFactory.generateMessage(appointment),
      scheduledDate: scheduledDate.toISOString(),
      status:        'pending',
      createdAt:     new Date().toISOString(),
    };
  },
  generateMessage(appointment) {
    return `Recordatorio: tiene una cita el ${appointment.date} a las ${appointment.time}`;
  },
};
