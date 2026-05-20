// Servicio de historial clínico (frontend) — Medical record service (frontend)
// Usa @insforge/sdk — política append-only, sin edición ni eliminación — Uses @insforge/sdk — append-only policy, no edits or deletes
import { db } from '../lib/insforge';

export async function getByPatient(patientId) {
  const { data, error } = await db
    .from('medical_records')
    .select()
    .eq('patientId', patientId)
    .order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// Política append-only: solo se crean entradas, nunca se editan ni eliminan — Append-only policy: entries are only created, never edited or deleted
export async function create(recordData) {
  const { data, error } = await db
    .from('medical_records')
    .insert({ ...recordData, createdAt: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Ordena descendente por fecha (más reciente primero) — Sorts descending by date (most recent first)
export function sortByDate(entries) {
  return [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
