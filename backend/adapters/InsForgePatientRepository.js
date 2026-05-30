import { IPatientRepository } from '../domain/repositories/IPatientRepository.js';
import { db }                  from '../infrastructure/insforge.js';
import { Patient }             from '../domain/entities/Patient.js';

export class InsForgePatientRepository extends IPatientRepository {
  async findAll(branchId) {
    const data = await db.from('patients').select('*').eq('branchId', branchId);
    return (data ?? []).map(d => new Patient(d));
  }

  async findById(id) {
    const data = await db.from('patients').select('*').eq('id', id).single();
    return data ? new Patient(data) : null;
  }

  async findByDocumentId(documentId) {
    const data = await db.from('patients').select('*').eq('documentId', documentId).maybeSingle();
    return data ? new Patient(data) : null;
  }

  async save(patient) {
    return await db.from('patients').insert(patient).select().single();
  }

  async update(id, data) {
    return await db.from('patients').update(data).eq('id', id).select().single();
  }
}
