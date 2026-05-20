// Servicio de dominio de historial clínico — Medical record domain service
// Gestiona entradas del historial y se conecta con InsForge — Manages history entries and connects to InsForge

// Crea una nueva entrada en el historial clínico de un paciente — Creates a new entry in a patient's medical history
async function createEntry(patientId, entryData) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Obtiene el historial clínico completo de un paciente — Fetches the complete medical history of a patient
async function getPatientHistory(patientId) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

// Ordena las entradas del historial por fecha descendente — Sorts history entries by descending date
function sortByDate(entries) {
  // TODO Etapa 1 — conectar con InsForge / connect to InsForge
}

module.exports = { createEntry, getPatientHistory, sortByDate };
