// Servicio de dominio de recordatorios — Reminder domain service
// Gestiona la generación y envío de recordatorios y se conecta con InsForge — Manages reminder generation and delivery and connects to InsForge
const { HOURS_BEFORE_REMINDER } = require('../../frontend/src/core/constants');

// Crea un recordatorio vinculado a una cita — Creates a reminder linked to an appointment
async function createReminderForAppointment(appointmentId) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Calcula la fecha de envío del recordatorio usando la constante HOURS_BEFORE_REMINDER — Calculates reminder send date using HOURS_BEFORE_REMINDER constant
function calculateReminderDate(appointmentDate) {
  // Usa HOURS_BEFORE_REMINDER en lugar de valor literal — Uses HOURS_BEFORE_REMINDER instead of magic number
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Genera el mensaje de texto del recordatorio — Generates the reminder text message
function generateMessage(patientName, appointmentDate) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Marca un recordatorio como enviado — Marks a reminder as sent
async function markAsSent(reminderId) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Lista todos los recordatorios pendientes de envío — Lists all pending reminders
async function listPending() {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

module.exports = { createReminderForAppointment, calculateReminderDate, generateMessage, markAsSent, listPending };
