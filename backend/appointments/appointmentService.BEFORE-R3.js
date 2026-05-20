// EVIDENCIA ANTES — R3 Decompose Conditional — Etapa 2
// BEFORE EVIDENCE — R3 Decompose Conditional — Stage 2
//
// Problema: createAppointment concentra múltiples validaciones y lógica de creación — Problem: createAppointment concentrates multiple validations and creation logic
// Las condiciones son largas y no comunican su propósito con claridad — Conditions are long and don't clearly communicate their purpose
// La lógica de validación está acoplada a la lógica de persistencia — Validation logic is coupled to persistence logic

const API_URL = process.env.INSFORGE_API_URL;
const API_KEY  = process.env.INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };
}

// ANTES — validaciones mezcladas directamente en createAppointment — BEFORE — validations mixed directly inside createAppointment
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
