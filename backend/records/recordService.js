// Servicio de dominio de historial clínico
const API_URL = process.env.INSFORGE_API_URL;
const API_KEY  = process.env.INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };
}

// Política append-only: solo se crean entradas, nunca se editan ni eliminan
async function createEntry(data) {
  const res = await fetch(`${API_URL}/records`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Error creando entrada de historial: ${res.status}`);
  return res.json();
}

async function getPatientHistory(patientId) {
  const res = await fetch(`${API_URL}/records?patientId=${encodeURIComponent(patientId)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Error obteniendo historial: ${res.status}`);
  const entries = await res.json();
  return sortByDate(entries);
}

// Ordena descendente por fecha (más reciente primero)
function sortByDate(entries) {
  return [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = { createEntry, getPatientHistory, sortByDate };
