// Servicio de recordatorios (frontend) — conecta con InsForge
const BASE_URL = import.meta.env.VITE_INSFORGE_API_URL;
const API_KEY  = import.meta.env.VITE_INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
}

export async function getPending() {
  const res = await fetch(`${BASE_URL}/reminders?status=pending`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Error cargando recordatorios pendientes: ${res.status}`);
  return res.json();
}

export async function create(reminderData) {
  const res = await fetch(`${BASE_URL}/reminders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...reminderData, status: 'pending' }),
  });
  if (!res.ok) throw new Error(`Error creando recordatorio: ${res.status}`);
  return res.json();
}

export async function markSent(reminderId) {
  const res = await fetch(`${BASE_URL}/reminders/${reminderId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status: 'sent' }),
  });
  if (!res.ok) throw new Error(`Error marcando recordatorio como enviado: ${res.status}`);
  return res.json();
}
