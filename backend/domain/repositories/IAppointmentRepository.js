// Interfaz del repositorio de citas
export class IAppointmentRepository {
  async findAll(branchId)                          { throw new Error('No implementado'); }
  async findById(id)                               { throw new Error('No implementado'); }
  async findByDate(date, branchId)                 { throw new Error('No implementado'); }
  async findByPatient(patientId)                   { throw new Error('No implementado'); }
  async findConflict(professionalId, date, time)   { throw new Error('No implementado'); }
  async save(appointment)                          { throw new Error('No implementado'); }
  async updateStatus(id, status)                   { throw new Error('No implementado'); }
}
