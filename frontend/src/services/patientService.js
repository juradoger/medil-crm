// Servicio de pacientes (frontend) — conecta con InsForge
const BASE_URL = import.meta.env.VITE_INSFORGE_API_URL;
const API_KEY  = import.meta.env.VITE_INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
}

export async function getPatients() {
  const res = await fetch(`${BASE_URL}/patients`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Error cargando pacientes: ${res.status}`);
  return res.json();
}

export async function getPatientById(id) {
  const res = await fetch(`${BASE_URL}/patients/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Paciente no encontrado: ${res.status}`);
  return res.json();
}

export async function createPatient(patientData) {
  const res = await fetch(`${BASE_URL}/patients`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(patientData),
  });
  if (!res.ok) throw new Error(`Error creando paciente: ${res.status}`);
  return res.json();
}

export async function updatePatient(id, patientData) {
  const res = await fetch(`${BASE_URL}/patients/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(patientData),
  });
  if (!res.ok) throw new Error(`Error actualizando paciente: ${res.status}`);
  return res.json();
}

export async function searchPatients(query) {
  const res = await fetch(`${BASE_URL}/patients?search=${encodeURIComponent(query)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Error buscando pacientes: ${res.status}`);
  return res.json();
}
