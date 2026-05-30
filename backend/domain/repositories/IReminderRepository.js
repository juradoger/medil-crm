// Interfaz del repositorio de recordatorios
export class IReminderRepository {
  async findPending(branchId)        { throw new Error('No implementado'); }
  async save(reminder)               { throw new Error('No implementado'); }
  async markAsSent(id, sentBy)       { throw new Error('No implementado'); }
  async cancelByAppointment(apptId)  { throw new Error('No implementado'); }
}
