// Servicio de dominio de recordatorios
const { HOURS_BEFORE_REMINDER } = require('../../frontend/src/core/constants');
const API_URL = process.env.INSFORGE_API_URL;
const API_KEY  = process.env.INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };
}

// Calcula la fecha de envío restando HOURS_BEFORE_REMINDER horas a la cita
function calculateReminderDate(appointmentDate) {
  const date = new Date(appointmentDate);
  date.setHours(date.getHours() - HOURS_BEFORE_REMINDER);
  return date;
}

function generateMessage(patientName, appointmentDate, appointmentTime, professional) {
  return `Recordatorio: ${patientName}, tiene cita el ${appointmentDate} a las ${appointmentTime} con ${professional}.`;
}

async function createReminderForAppointment(appointment) {
  const sendAt  = calculateReminderDate(appointment.date);
  const message = generateMessage(
    appointment.patientName,
    appointment.date,
    appointment.time,
    appointment.professional
  );
  const res = await fetch(`${API_URL}/reminders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      message,
      sendAt: sendAt.toISOString(),
      status: 'pending',
    }),
  });
  if (!res.ok) throw new Error(`Error creando recordatorio: ${res.status}`);
  return res.json();
}

async function markAsSent(reminderId) {
  const res = await fetch(`${API_URL}/reminders/${reminderId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status: 'sent' }),
  });
  if (!res.ok) throw new Error(`Error marcando recordatorio como enviado: ${res.status}`);
  return res.json();
}

async function listPending() {
  const res = await fetch(`${API_URL}/reminders?status=pending`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Error listando recordatorios pendientes: ${res.status}`);
  return res.json();
}

module.exports = { createReminderForAppointment, calculateReminderDate, generateMessage, markAsSent, listPending };
