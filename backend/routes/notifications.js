import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTwilioClient, TWILIO_FROM } from '../lib/twilio.js';
import { db } from '../infrastructure/insforge.js';
import { REMINDER_STATUS } from '../core/constants.js';

const router = Router();

// POST /api/notify/reminder
// Envía recordatorio por WhatsApp ahora mismo
router.post('/reminder', requireAuth, async (req, res, next) => {
  try {
    const { reminderId, patientPhone, patientName,
            appointmentDate, appointmentTime,
            professionalName } = req.body;

    if (!patientPhone || !reminderId) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'reminderId y patientPhone son requeridos',
      });
    }

    // Formatear número para WhatsApp (Bolivia: +591 7xxxxxxx)
    const phoneFormatted = formatBolivianPhone(patientPhone);

    // Mensaje del recordatorio
    const message = buildReminderMessage({
      patientName,
      appointmentDate,
      appointmentTime,
      professionalName,
    });

    // Enviar por Twilio
    const twilioClient = getTwilioClient();
    const result = await twilioClient.messages.create({
      from: TWILIO_FROM,
      to: `whatsapp:${phoneFormatted}`,
      body: message,
    });

    // Marcar recordatorio como enviado en InsForge
    const now = new Date().toISOString();
    const { error: updateError } = await db.from('reminders')
      .update({
        status: REMINDER_STATUS.SENT,
        sentBy: req.userId,
        sentAt: now,
      })
      .eq('id', reminderId);

    if (updateError) {
      console.warn('No se pudo actualizar estado del recordatorio');
    }

    res.json({
      success: true,
      messageSid: result.sid,
      message: `WhatsApp enviado a ${phoneFormatted}`,
    });

  } catch (error) {
    // Si Twilio no está configurado, devolver error descriptivo
    if (error.message.includes('Credenciales')) {
      return res.status(503).json({
        error: 'WhatsApp no configurado',
        message: 'Las credenciales de Twilio no están configuradas. ' +
                 'El recordatorio se marcó como simulado.',
        simulated: true,
      });
    }
    next(error);
  }
});

// POST /api/notify/schedule
// Programa el envío automático de un recordatorio
router.post('/schedule', requireAuth, async (req, res, next) => {
  try {
    const { reminderId, sendAt } = req.body;

    if (!reminderId || !sendAt) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'reminderId y sendAt son requeridos',
      });
    }

    // Actualizar la fecha programada del recordatorio
    const { data, error } = await db.from('reminders')
      .update({ sendAt, status: REMINDER_STATUS.PENDING })
      .eq('id', reminderId)
      .select()
      .single();

    if (error) throw new Error('Error al programar el recordatorio');

    res.json({
      success: true,
      reminder: data,
      message: `Recordatorio programado para ${sendAt}`,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/notify/pending
// Lista recordatorios que deben enviarse ahora (sendAt <= ahora y status = pending)
router.get('/pending', requireAuth, async (req, res, next) => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await db.from('reminders')
      .select('*')
      .eq('status', REMINDER_STATUS.PENDING)
      .lte('sendAt', now);

    if (error) throw new Error('Error al obtener recordatorios');

    res.json({ reminders: data || [] });
  } catch (error) {
    next(error);
  }
});

// Helpers
function formatBolivianPhone(phone) {
  // Elimina espacios, guiones y paréntesis
  let cleaned = phone.replace(/[\s\-()]/g, '');
  // Si empieza con 0, quitar el 0
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  // Si no tiene código de país, agregar +591 (Bolivia)
  if (!cleaned.startsWith('+')) {
    cleaned = '+591' + cleaned;
  }
  return cleaned;
}

function buildReminderMessage({ patientName, appointmentDate,
                                 appointmentTime, professionalName }) {
  const fecha = new Date(appointmentDate).toLocaleDateString(
    'es-BO', { weekday: 'long', year: 'numeric',
               month: 'long', day: 'numeric' }
  );
  return `Hola ${patientName} 👋\n\n` +
    `Te recordamos que tenés una cita médica:\n` +
    `📅 ${fecha}\n` +
    `🕐 ${appointmentTime} hrs\n` +
    `👨‍⚕️ ${professionalName}\n\n` +
    `Por favor llegá 10 minutos antes.\n` +
    `Para cancelar o reprogramar, contactá a la clínica.\n\n` +
    `— MedIL CRM`;
}

export default router;
