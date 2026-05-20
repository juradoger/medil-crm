// Servicio de dominio de pacientes
const API_URL = process.env.INSFORGE_API_URL;
const API_KEY  = process.env.INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };
}

async function createPatient(patientData) {
  const res = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(patientData),
  });
  if (!res.ok) throw new Error(`Error creando paciente: ${res.status}`);
  return res.json();
}

async function updatePatient(id, patientData) {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(patientData),
  });
  if (!res.ok) throw new Error(`Error actualizando paciente: ${res.status}`);
  return res.json();
}

async function getPatientById(id) {
  const res = await fetch(`${API_URL}/patients/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Paciente no encontrado: ${res.status}`);
  return res.json();
}

async function searchPatients(query) {
  const res = await fetch(`${API_URL}/patients?search=${encodeURIComponent(query)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Error buscando pacientes: ${res.status}`);
  return res.json();
}

// Valida que los campos requeridos existan antes de persistir
function validatePatientData(patientData) {
  const required = ['name', 'email', 'phone'];
  for (const field of required) {
    if (!patientData[field]) throw new Error(`Campo requerido faltante: ${field}`);
  }
  return true;
}

module.exports = { createPatient, updatePatient, getPatientById, searchPatients, validatePatientData };
