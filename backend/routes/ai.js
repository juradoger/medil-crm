import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { askClaude, getClaudeClient } from '../lib/claude.js';
import { db } from '../infrastructure/insforge.js';
import { CLAUDE_MODEL } from '../core/constants.js';

const router = Router();

// Texto usado cuando el paciente no tiene historial previo
const NO_HISTORY_TEXT = 'Sin historial previo registrado.';

// Detecta si el error indica que la IA no está disponible:
// key ausente, key inválida (401), o error de autenticación de la API
function isAIUnavailable(error) {
  return (
    error.message?.includes('CLAUDE_API_KEY') ||
    error.status === 401 ||
    error.status === 403 ||
    error.message?.includes('invalid x-api-key') ||
    error.message?.includes('authentication') ||
    error.message?.includes('API key') ||
    error?.error?.type === 'authentication_error'
  );
}

// ─── POST /api/ai/suggest-diagnosis ────────────────
// El doctor ingresa síntomas y Claude sugiere diagnóstico
router.post('/suggest-diagnosis', requireAuth, async (req, res, next) => {
  try {
    const { symptoms, patientId, doctorSpecialty } = req.body;

    if (!symptoms?.trim()) {
      return res.status(400).json({
        error: 'Síntomas requeridos',
        message: 'Describí los síntomas para obtener una sugerencia',
      });
    }

    // Obtener historial clínico del paciente para contexto
    let historialTexto = NO_HISTORY_TEXT;
    if (patientId) {
      const { data: records } = await db.from('medical_records')
        .select('diagnosis, notes, attendanceDate')
        .eq('patientId', patientId)
        .order('attendanceDate', { ascending: false })
        .limit(5);

      if (records?.length) {
        historialTexto = records.map(r =>
          `[${r.attendanceDate}] Diagnóstico: ${r.diagnosis}. ` +
          `Notas: ${r.notes || 'Sin notas.'}`
        ).join('\n');
      }
    }

    const systemPrompt = `Sos un asistente médico de apoyo para
médicos en Bolivia. Tu rol es SUGERIR diagnósticos y tratamientos
basándote en los síntomas descritos y el historial del paciente.

REGLAS IMPORTANTES:
- Respondé SIEMPRE en español
- Sé conciso y clínico (máximo 150 palabras)
- Empezá con el diagnóstico más probable
- Incluí 1-2 diagnósticos diferenciales si aplica
- Sugerí tratamiento inicial conservador
- Indicá si se necesitan estudios complementarios
- NO reemplazás al médico, solo asistís
- Especialidad del médico: ${doctorSpecialty || 'Medicina General'}

Respondé en este formato exacto:
DIAGNÓSTICO PROBABLE: [diagnóstico principal]
DIFERENCIALES: [diagnóstico 1] / [diagnóstico 2]
TRATAMIENTO SUGERIDO: [tratamiento]
ESTUDIOS: [estudios si aplican, o "No requeridos"]`;

    const userMessage =
      `HISTORIAL PREVIO DEL PACIENTE:\n${historialTexto}\n\n` +
      `SÍNTOMAS ACTUALES:\n${symptoms}`;

    const suggestion = await askClaude(systemPrompt, userMessage);

    res.json({
      suggestion,
      basedOn: {
        symptoms,
        historialRecords: historialTexto !== NO_HISTORY_TEXT,
      },
    });

  } catch (error) {
    if (isAIUnavailable(error)) {
      return res.status(503).json({
        error: 'IA no configurada',
        message: 'Configurá CLAUDE_API_KEY en el .env del backend',
        simulated: true,
        suggestion: simulateDiagnosis(req.body.symptoms),
      });
    }
    next(error);
  }
});

// ─── POST /api/ai/summarize-history ────────────────
// Genera resumen del historial clínico del paciente
router.post('/summarize-history', requireAuth, async (req, res, next) => {
  try {
    const { patientId, patientName } = req.body;

    if (!patientId) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'patientId es requerido',
      });
    }

    // Obtener historial completo
    const { data: records } = await db.from('medical_records')
      .select('diagnosis, notes, attendanceDate')
      .eq('patientId', patientId)
      .order('attendanceDate', { ascending: false })
      .limit(20);

    if (!records?.length) {
      return res.json({
        summary: 'Este paciente no tiene historial clínico registrado.',
        recordCount: 0,
      });
    }

    const historialTexto = records.map(r =>
      `[${r.attendanceDate}] ${r.diagnosis}. ${r.notes || ''}`
    ).join('\n');

    const systemPrompt = `Sos un asistente médico que resume
historiales clínicos para médicos en Bolivia.
Respondé en español, de forma concisa y clínica.
Máximo 4 líneas. Destacá: condiciones crónicas,
medicación habitual, alergias mencionadas,
y última consulta.`;

    const userMessage =
      `Paciente: ${patientName || 'Desconocido'}\n\n` +
      `HISTORIAL (${records.length} entradas):\n${historialTexto}`;

    const summary = await askClaude(systemPrompt, userMessage, 300);

    res.json({ summary, recordCount: records.length });

  } catch (error) {
    if (isAIUnavailable(error)) {
      return res.status(503).json({
        error: 'IA no configurada',
        simulated: true,
        summary: 'Resumen simulado: Paciente con consultas previas. ' +
                 'Configurá CLAUDE_API_KEY para resúmenes reales.',
        recordCount: 0,
      });
    }
    next(error);
  }
});

// ─── POST /api/ai/chat ──────────────────────────────
// Chat libre del doctor con la IA durante la consulta
router.post('/chat', requireAuth, async (req, res, next) => {
  try {
    const { message, patientContext, conversationHistory } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        error: 'Mensaje requerido',
        message: 'Escribí tu consulta para el asistente',
      });
    }

    const systemPrompt = `Sos un asistente médico para un médico
boliviano durante una consulta. Respondé en español, de forma
concisa y clínica (máximo 200 palabras por respuesta).

CONTEXTO DEL PACIENTE:
${patientContext || 'Sin contexto del paciente.'}

REGLAS:
- Respondé directamente a la pregunta del médico
- Basate en el contexto del paciente si es relevante
- Si no sabés algo, decilo claramente
- No inventés datos del paciente
- Recordá que sos asistente, no reemplazás al médico`;

    // Construir historial de conversación para Claude
    const messages = [];

    if (conversationHistory?.length) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: message });

    const claude = getClaudeClient();
    const response = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages,
    });

    res.json({
      response: response.content[0].text,
      role: 'assistant',
    });

  } catch (error) {
    if (isAIUnavailable(error)) {
      return res.status(503).json({
        error: 'IA no configurada',
        simulated: true,
        response: 'IA simulada: Configurá CLAUDE_API_KEY ' +
                  'en el backend para respuestas reales.',
        role: 'assistant',
      });
    }
    next(error);
  }
});

// ─── POST /api/ai/suggest-supplies ─────────────────
// Sugiere insumos a descontar según el diagnóstico
router.post('/suggest-supplies', requireAuth, async (req, res, next) => {
  try {
    const { diagnosis, notes, branchId } = req.body;

    if (!diagnosis) {
      return res.status(400).json({
        error: 'Diagnóstico requerido',
        message: 'Se necesita el diagnóstico para sugerir insumos',
      });
    }

    // Obtener insumos disponibles en la sucursal
    const { data: supplies } = await db.from('supplies')
      .select('id, name, unit, stockCurrent, status')
      .eq('branchId', branchId)
      .neq('status', 'critical');

    if (!supplies?.length) {
      return res.json({
        suggestions: [],
        message: 'No hay insumos disponibles en esta sucursal',
      });
    }

    const suppliesTexto = supplies.map(s =>
      `- ${s.name} (${s.unit}, stock: ${s.stockCurrent})`
    ).join('\n');

    const systemPrompt = `Sos un asistente médico que sugiere
qué insumos médicos se usaron en una consulta.
Respondé SOLO con JSON válido, sin texto adicional.
Formato: {"suggestions": [{"name": "...", "quantity": N}]}
Solo sugerí insumos de la lista disponible.
Cantidades conservadoras y realistas.`;

    const userMessage =
      `DIAGNÓSTICO: ${diagnosis}\n` +
      `NOTAS: ${notes || 'Sin notas adicionales'}\n\n` +
      `INSUMOS DISPONIBLES:\n${suppliesTexto}\n\n` +
      `Respondé solo con el JSON de sugerencias.`;

    const suggestion = await askClaude(systemPrompt, userMessage, 300);

    // Parsear JSON de la respuesta
    let suggestions = [];
    try {
      const clean = suggestion
        .replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      suggestions = parsed.suggestions || [];

      // Validar que los insumos existen en la lista
      suggestions = suggestions.filter(s =>
        supplies.some(sup =>
          sup.name.toLowerCase().includes(s.name.toLowerCase())
        )
      );
    } catch {
      suggestions = [];
    }

    res.json({ suggestions });

  } catch (error) {
    if (isAIUnavailable(error)) {
      return res.status(503).json({
        simulated: true,
        suggestions: [],
        message: 'IA no configurada — sin sugerencias de insumos',
      });
    }
    next(error);
  }
});

// ─── POST /api/ai/generate-reminder-message ────────
// Genera mensaje personalizado de recordatorio
router.post('/generate-reminder-message', requireAuth, async (req, res, next) => {
  try {
    const { patientName, appointmentDate,
            appointmentTime, reason, professionalName } = req.body;

    const systemPrompt = `Generás mensajes de recordatorio
médico en español para Bolivia. Tono amigable y profesional.
Máximo 3 líneas. Sin emojis técnicos, solo 👋 y 📅.`;

    const userMessage =
      `Generá un recordatorio para:\n` +
      `Paciente: ${patientName}\n` +
      `Fecha: ${appointmentDate} a las ${appointmentTime}\n` +
      `Motivo: ${reason}\n` +
      `Médico: ${professionalName}`;

    const message = await askClaude(systemPrompt, userMessage, 150);

    res.json({ message });

  } catch (error) {
    if (isAIUnavailable(error)) {
      return res.status(503).json({
        simulated: true,
        message: `Hola ${req.body.patientName} 👋 ` +
          `Recordatorio de tu cita el ${req.body.appointmentDate} ` +
          `a las ${req.body.appointmentTime}. — MedIL`,
      });
    }
    next(error);
  }
});

// ─── POST /api/ai/suggest-specialty ────────────────
// El paciente describe síntomas y Claude sugiere la especialidad médica adecuada
router.post('/suggest-specialty', async (req, res, next) => {
  try {
    const { symptoms, availableSpecialties } = req.body;

    if (!symptoms?.trim()) {
      return res.status(400).json({
        error: 'Síntomas requeridos',
        message: 'Describí tus síntomas para recibir una sugerencia',
      });
    }

    const specialtiesText = availableSpecialties?.length
      ? availableSpecialties.join(', ')
      : 'Medicina General, Pediatría, Cardiología, Dermatología';

    const systemPrompt = `Sos un asistente de orientación médica
para pacientes en Bolivia. Ayudás a elegir la especialidad
médica correcta según los síntomas descritos.

ESPECIALIDADES DISPONIBLES: ${specialtiesText}

REGLAS:
- Respondé SIEMPRE en español
- Sé amable y claro para un paciente no médico
- Recomendá UNA especialidad principal
- Explicá en 1 línea por qué
- Si los síntomas son urgentes, indicalo claramente
- Respondé en este formato exacto:
ESPECIALIDAD: [nombre exacto de la especialidad]
RAZÓN: [explicación en 1 línea para el paciente]
URGENCIA: [Normal / Consultar pronto / Urgente]`;

    const response = await askClaude(systemPrompt, symptoms, 200);

    // Parsear la respuesta
    const lines = response.split('\n');
    const specialty = lines.find(l => l.startsWith('ESPECIALIDAD:'))
      ?.replace('ESPECIALIDAD:', '').trim() || '';
    const reason = lines.find(l => l.startsWith('RAZÓN:'))
      ?.replace('RAZÓN:', '').trim() || '';
    const urgency = lines.find(l => l.startsWith('URGENCIA:'))
      ?.replace('URGENCIA:', '').trim() || 'Normal';

    res.json({ specialty, reason, urgency, raw: response });

  } catch (error) {
    if (isAIUnavailable(error)) {
      return res.status(503).json({
        simulated: true,
        specialty: 'Medicina General',
        reason: 'Especialidad sugerida por defecto (IA no configurada)',
        urgency: 'Normal',
      });
    }
    next(error);
  }
});

// Simulación cuando no hay API key
function simulateDiagnosis() {
  return 'DIAGNÓSTICO PROBABLE: Consulta con el especialista\n' +
    'DIFERENCIALES: Requiere evaluación clínica\n' +
    'TRATAMIENTO SUGERIDO: Evaluación médica completa\n' +
    'ESTUDIOS: Según criterio médico\n\n' +
    '(Configurá CLAUDE_API_KEY para diagnósticos reales)';
}

export default router;
