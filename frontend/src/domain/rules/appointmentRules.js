import { APPOINTMENT_STATUS } from '../../core/constants';

export const appointmentRules = {
  isFutureDate(date, time) {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime > new Date();
  },
  // Una cita atendida o cancelada es estado final: solo se atiende si está agendada
  canBeAttended(appointment) {
    return appointment.status === APPOINTMENT_STATUS.SCHEDULED;
  },
  // Una cita atendida no puede cancelarse: solo se cancela si está agendada
  canBeCancelled(appointment) {
    return appointment.status === APPOINTMENT_STATUS.SCHEDULED;
  },
};
