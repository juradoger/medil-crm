import { AppointmentFactory } from '../domain/factories/AppointmentFactory.js';
import { ReminderFactory }    from '../domain/factories/ReminderFactory.js';
import { appointmentRules }   from '../domain/rules/appointmentRules.js';

export class CreateAppointment {
  constructor(appointmentRepository, patientRepository, reminderRepository) {
    this.appointmentRepo = appointmentRepository;
    this.patientRepo     = patientRepository;
    this.reminderRepo    = reminderRepository;
  }

  async execute(data) {
    // Regla 1: la fecha debe ser futura
    if (!appointmentRules.isFutureDate(data.date, data.time)) {
      throw new Error('La fecha de la cita debe ser a partir de hoy');
    }

    // Regla 2: el paciente debe estar activo
    const patientActive = await appointmentRules.patientIsActive(
      data.patientId, this.patientRepo
    );
    if (!patientActive) {
      throw new Error('Este paciente está inactivo');
    }

    // Regla 3: no debe haber conflicto de horario
    const noConflict = await appointmentRules.hasNoConflict(
      data.professionalId, data.date, data.time, this.appointmentRepo
    );
    if (!noConflict) {
      throw new Error('El profesional ya tiene una cita a esa hora');
    }

    // Crear y guardar la cita
    const appointment = AppointmentFactory.create(data);
    const saved = await this.appointmentRepo.save(appointment);

    // Generar recordatorio automático
    const reminder = ReminderFactory.createFromAppointment(saved);
    await this.reminderRepo.save(reminder);

    return saved;
  }
}
