export class CancelAppointment {
  constructor(appointmentRepository, reminderRepository) {
    this.appointmentRepo = appointmentRepository;
    this.reminderRepo    = reminderRepository;
  }

  async execute(id) {
    const appointment = await this.appointmentRepo.findById(id);
    if (!appointment.canBeCancelled()) {
      throw new Error('Esta cita no puede cancelarse');
    }
    await this.appointmentRepo.updateStatus(id, 'cancelled');
    // Cancelar recordatorio asociado
    await this.reminderRepo.cancelByAppointment(id);
    return { success: true };
  }
}
