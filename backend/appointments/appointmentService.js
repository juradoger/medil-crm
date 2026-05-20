// Servicio de dominio de citas médicas
const API_URL = process.env.INSFORGE_API_URL;
const API_KEY  = process.env.INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };
}

async function createAppointment(appointmentData) {
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...appointmentData, status: 'scheduled' }),
  });
  if (!res.ok) throw new Error(`Error creando cita: ${res.status}`);
  return res.json();
}

async function cancelAppointment(id) {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status: 'cancelled' }),
  });
  if (!res.ok) throw new Error(`Error cancelando cita: ${res.status}`);
  return res.json();
}

async function markAsAttended(id) {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status: 'attended' }),
  });
  if (!res.ok) throw new Error(`Error marcando cita como atendida: ${res.status}`);
  return res.json();
}

async function listByDate(date) {
  const res = await fetch(`${API_URL}/appointments?date=${encodeURIComponent(date)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Error listando citas: ${res.status}`);
  return res.json();
}

// Consulta las citas del día y verifica si el profesional ya tiene una en ese horario
async function checkTimeConflict(professionalId, date, time) {
  const existing = await listByDate(date);
  return existing.some(
    (appt) =>
      appt.professionalId === professionalId &&
      appt.time === time &&
      appt.status !== 'cancelled'
  );
}

module.exports = { createAppointment, cancelAppointment, markAsAttended, listByDate, checkTimeConflict };
