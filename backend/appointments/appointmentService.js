// Servicio de dominio de citas médicas — Medical appointment domain service
// R3 Decompose Conditional: validaciones extraídas a funciones expresivas — validations extracted to expressive functions
const reminderService = require('../reminders/reminderService');

const API_URL = process.env.INSFORGE_API_URL;
const API_KEY  = process.env.INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
}

// ─── Funciones de validación descompuestas / Decomposed validation functions ───

// Verifica si la fecha y hora de la cita son futuras — Checks if appointment date and time are in the future
function isFutureDate(date, time) {
  const appointmentDateTime = new Date(`${date}T${time}`);
  return appointmentDateTime > new Date();
}

// Verifica si el horario está libre para el profesional — Checks if time slot is free for the professional
async function isTimeSlotFree(professionalId, date, time) {
  const conflict = await checkTimeConflict(professionalId, date, time);
  return !conflict;
}

// Verifica si el paciente existe y está activo — Checks if patient exists and is active
async function isPatientActive(patientId) {
  const res = await fetch(`${API_URL}/patients/${patientId}`, { headers: getHeaders() });
  if (!res.ok) return false;
  const patient = await res.json();
  return patient.status === 'active';
}

// ─── Operaciones CRUD / CRUD Operations ───────────────────────────────────────

async function createAppointment(data) {
  // Validación de campos obligatorios — Required fields validation
  const { patientId, professionalId, date, time, reason } = data;
  if (!patientId || !professionalId || !date || !time || !reason) {
    throw new Error('Todos los campos son obligatorios — All fields are required');
  }

  // Validación descompuesta — Decomposed validation
  if (!isFutureDate(date, time)) {
    throw new Error('La fecha de la cita debe ser futura — Appointment date must be in the future');
  }

  if (!await isPatientActive(patientId)) {
    throw new Error('El paciente no existe o está inactivo — Patient does not exist or is inactive');
  }

  if (!await isTimeSlotFree(professionalId, date, time)) {
    throw new Error('El profesional ya tiene una cita en ese horario — Professional already has an appointment at that time');
  }

  // Crear la cita — Create the appointment
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...data, status: 'scheduled', createdAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Error creando cita: ${res.status}`);
  const appointment = await res.json();

  // Generar recordatorio automático — Auto-generate reminder
  await reminderService.createReminderForAppointment(appointment);

  return appointment;
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

// Consulta las citas del día y verifica si el profesional ya tiene una en ese horario — Queries day's appointments and checks if professional has one at that time
async function checkTimeConflict(professionalId, date, time) {
  const existing = await listByDate(date);
  return existing.some(
    (appt) =>
      appt.professionalId === professionalId &&
      appt.time === time &&
      appt.status !== 'cancelled'
  );
}

module.exports = {
  createAppointment,
  cancelAppointment,
  markAsAttended,
  listByDate,
  checkTimeConflict,
  isFutureDate,
  isPatientActive,
};
