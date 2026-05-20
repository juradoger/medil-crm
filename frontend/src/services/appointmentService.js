// Servicio de citas (frontend) — conecta con InsForge
const BASE_URL = import.meta.env.VITE_INSFORGE_API_URL;
const API_KEY  = import.meta.env.VITE_INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
}

export async function getAll() {
  const res = await fetch(`${BASE_URL}/appointments`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Error cargando citas: ${res.status}`);
  return res.json();
}

export async function getByDate(date) {
  const res = await fetch(`${BASE_URL}/appointments?date=${encodeURIComponent(date)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Error filtrando citas por fecha: ${res.status}`);
  return res.json();
}

export async function create(appointmentData) {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...appointmentData, status: 'scheduled' }),
  });
  if (!res.ok) throw new Error(`Error creando cita: ${res.status}`);
  return res.json();
}

export async function cancel(id) {
  const res = await fetch(`${BASE_URL}/appointments/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status: 'cancelled' }),
  });
  if (!res.ok) throw new Error(`Error cancelando cita: ${res.status}`);
  return res.json();
}

export async function markAttended(id) {
  const res = await fetch(`${BASE_URL}/appointments/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status: 'attended' }),
  });
  if (!res.ok) throw new Error(`Error marcando cita como atendida: ${res.status}`);
  return res.json();
}

// Consulta las citas del día y verifica conflicto de horario para el profesional
export async function checkConflict(professionalId, date, time) {
  const existing = await getByDate(date);
  return existing.some(
    (appt) =>
      appt.professionalId === professionalId &&
      appt.time === time &&
      appt.status !== 'cancelled'
  );
}
