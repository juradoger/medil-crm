// Servicio de dominio de citas médicas — Medical appointment domain service
// Gestiona la lógica de negocio de citas y se conecta con InsForge — Manages appointment business logic and connects to InsForge

// Crea una nueva cita médica — Creates a new medical appointment
async function createAppointment(appointmentData) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Cancela una cita existente por su ID — Cancels an existing appointment by ID
async function cancelAppointment(id) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Marca una cita como atendida — Marks an appointment as attended
async function markAsAttended(id) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Lista las citas de una fecha específica — Lists appointments for a specific date
async function listByDate(date) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Verifica si existe conflicto de horario para una cita — Checks for time conflict for an appointment
async function checkTimeConflict(date, durationMinutes) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

module.exports = { createAppointment, cancelAppointment, markAsAttended, listByDate, checkTimeConflict };
