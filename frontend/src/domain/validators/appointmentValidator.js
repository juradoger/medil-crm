export const appointmentValidator = {
  validate(data) {
    const errors = {};
    if (!data.patientId)          errors.patientId      = 'Seleccioná un paciente';
    if (!data.professionalId)     errors.professionalId = 'Seleccioná un profesional';
    if (!data.date)               errors.date           = 'La fecha es obligatoria';
    else if (new Date(data.date) < new Date(new Date().setHours(0, 0, 0, 0)))
      errors.date = 'La fecha debe ser a partir de hoy';
    if (!data.time)               errors.time           = 'La hora es obligatoria';
    if (!data.reason?.trim())     errors.reason         = 'El motivo es obligatorio';
    return { isValid: Object.keys(errors).length === 0, errors };
  },
};
