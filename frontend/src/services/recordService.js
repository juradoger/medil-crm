// Servicio de historial clínico (frontend) — conecta con InsForge
const BASE_URL = import.meta.env.VITE_INSFORGE_API_URL;
const API_KEY  = import.meta.env.VITE_INSFORGE_API_KEY;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };
}

export async function getByPatient(patientId) {
  const res = await fetch(`${BASE_URL}/records?patientId=${encodeURIComponent(patientId)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Error obteniendo historial: ${res.status}`);
  const entries = await res.json();
  return sortByDate(entries);
}

// Política append-only: solo se crean entradas, nunca se editan ni eliminan
export async function create(data) {
  const res = await fetch(`${BASE_URL}/records`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Error creando entrada de historial: ${res.status}`);
  return res.json();
}

// Ordena descendente por fecha (más reciente primero)
export function sortByDate(entries) {
  return [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
