export const appointmentRules = {
  isFutureDate(date, time) {
    return new Date(`${date}T${time}`) > new Date();
  },

  async hasNoConflict(professionalId, date, time, repository) {
    const conflict = await repository.findConflict(professionalId, date, time);
    return !conflict;
  },

  async patientIsActive(patientId, patientRepository) {
    const patient = await patientRepository.findById(patientId);
    return patient?.isActive() ?? false;
  },
};
