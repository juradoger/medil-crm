// Servicio de IA — habla con los endpoints /api/ai del servidor Express
// La IA nunca se llama desde el frontend directamente, siempre vía Express
import { BACKEND_URL } from './backendService.js';

function getAuthHeaders() {
  const token = localStorage.getItem('medil_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function callAI(endpoint, body) {
  const response = await fetch(`${BACKEND_URL}/api/ai${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await response.json();
  // Las respuestas simuladas (sin API key) no se tratan como error
  if (!response.ok && !data.simulated) {
    throw new Error(data.message || 'Error del asistente IA');
  }
  return data;
}

export const aiService = {
  // Sugerir diagnóstico basado en síntomas
  suggestDiagnosis: (symptoms, patientId, doctorSpecialty) =>
    callAI('/suggest-diagnosis', { symptoms, patientId, doctorSpecialty }),

  // Resumir historial del paciente
  summarizeHistory: (patientId, patientName) =>
    callAI('/summarize-history', { patientId, patientName }),

  // Chat libre con la IA
  chat: (message, patientContext, conversationHistory) =>
    callAI('/chat', { message, patientContext, conversationHistory }),

  // Sugerir insumos a descontar
  suggestSupplies: (diagnosis, notes, branchId) =>
    callAI('/suggest-supplies', { diagnosis, notes, branchId }),

  // Generar mensaje de recordatorio
  generateReminderMessage: (data) =>
    callAI('/generate-reminder-message', data),
};
