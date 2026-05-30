export const appointmentRules = {
  isFutureDate(date, time) {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime > new Date();
  },
  canBeAttended(appointment) {
    return appointment.status === 'scheduled';
  },
  canBeCancelled(appointment) {
    return appointment.status === 'scheduled';
  },
};
