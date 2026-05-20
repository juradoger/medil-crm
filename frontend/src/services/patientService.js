// Servicio de pacientes (frontend) — Patient service (frontend)
// Usa @insforge/sdk — fluent API igual que Supabase — Uses @insforge/sdk — fluent API like Supabase
import { db } from '../lib/insforge';

export async function getPatients() {
  const { data, error } = await db.from('patients').select();
  if (error) throw new Error(error.message);
  return data;
}

export async function getPatientById(id) {
  const { data, error } = await db.from('patients').select().eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createPatient(patientData) {
  const { data, error } = await db.from('patients').insert(patientData).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePatient(id, patientData) {
  const { data, error } = await db.from('patients').update(patientData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function searchPatients(query) {
  const { data, error } = await db.from('patients').select().ilike('name', `%${query}%`);
  if (error) throw new Error(error.message);
  return data;
}
