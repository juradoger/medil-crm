// Interfaz del repositorio de pacientes — el dominio no conoce la implementación
export class IPatientRepository {
  async findAll(branchId)            { throw new Error('No implementado'); }
  async findById(id)                 { throw new Error('No implementado'); }
  async findByDocumentId(documentId) { throw new Error('No implementado'); }
  async save(patient)                { throw new Error('No implementado'); }
  async update(id, data)             { throw new Error('No implementado'); }
}
