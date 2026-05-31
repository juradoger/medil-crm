import { IPatientRepository } from '../domain/repositories/IPatientRepository.js';
import { db }                  from '../infrastructure/insforge.js';
import { Patient }             from '../domain/entities/Patient.js';

export class InsForgePatientRepository extends IPatientRepository {
  async findAll(branchId) {
    const { data, error } = await db.from('patients').select('*').eq('branchId', branchId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(d => new Patient(d));
  }

  async findById(id) {
    const { data, error } = await db.from('patients').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? new Patient(data) : null;
  }

  async findByDocumentId(documentId) {
    const { data, error } = await db.from('patients').select('*').eq('documentId', documentId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? new Patient(data) : null;
  }

  async save(patient) {
    const { data, error } = await db.from('patients').insert(patient).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id, patch) {
    const { data, error } = await db.from('patients').update(patch).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
}
