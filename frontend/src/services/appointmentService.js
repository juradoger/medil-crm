// Servicio de citas (frontend) — Appointment service (frontend)
// Usa @insforge/sdk — fluent API igual que Supabase — Uses @insforge/sdk — fluent API like Supabase
import { db } from '../lib/insforge';

export async function getAll() {
  const { data, error } = await db.from('appointments').select().order('date', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getByDate(date) {
  const { data, error } = await db.from('appointments').select().eq('date', date);
  if (error) throw new Error(error.message);
  return data;
}

export async function create(appointmentData) {
  const { data, error } = await db
    .from('appointments')
    .insert({ ...appointmentData, status: 'scheduled' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function cancel(id) {
  const { data, error } = await db
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function markAttended(id) {
  const { data, error } = await db
    .from('appointments')
    .update({ status: 'attended' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Consulta las citas del día y verifica conflicto de horario para el profesional — Queries day's appointments and checks time slot conflict for the professional
export async function checkConflict(professionalId, date, time) {
  const existing = await getByDate(date);
  return existing.some(
    (appt) =>
      appt.professionalId === professionalId &&
      appt.time === time &&
      appt.status !== 'cancelled'
  );
}
