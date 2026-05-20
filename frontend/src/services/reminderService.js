// Servicio de recordatorios (frontend) — Reminder service (frontend)
// Usa @insforge/sdk — fluent API igual que Supabase — Uses @insforge/sdk — fluent API like Supabase
import { db } from '../lib/insforge';

export async function getPending() {
  const { data, error } = await db.from('reminders').select().eq('status', 'pending');
  if (error) throw new Error(error.message);
  return data;
}

export async function create(reminderData) {
  const { data, error } = await db
    .from('reminders')
    .insert({ ...reminderData, status: 'pending' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function markSent(reminderId) {
  const { data, error } = await db
    .from('reminders')
    .update({ status: 'sent' })
    .eq('id', reminderId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
