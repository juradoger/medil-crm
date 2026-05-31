import { db } from '../infrastructure/insforge.js';
import { getTwilioClient, TWILIO_FROM } from '../lib/twilio.js';
import { REMINDER_STATUS } from '../core/constants.js';

// Procesa los recordatorios cuya hora programada ya llegó y los envía por WhatsApp
export async function processScheduledReminders() {
  try {
    const now = new Date().toISOString();

    // Obtener recordatorios pendientes cuya hora ya llegó
    const { data: reminders, error } = await db.from('reminders')
      .select(`
        *,
        patients (name, whatsappPhone),
        appointments (date, time, reason,
          professionals (fullName))
      `)
      .eq('status', REMINDER_STATUS.PENDING)
      .lte('sendAt', now);

    if (error || !reminders?.length) return;

    console.log(`Procesando ${reminders.length} recordatorios...`);

    for (const reminder of reminders) {
      try {
        const patient = reminder.patients;
        const appointment = reminder.appointments;
        const professional = appointment?.professionals;

        if (!patient?.whatsappPhone) {
          console.warn(`Paciente sin whatsappPhone: ${reminder.patientId}`);
          continue;
        }

        // Formatear teléfono
        let phone = patient.whatsappPhone.replace(/[\s\-()]/g, '');
        if (!phone.startsWith('+')) phone = '+591' + phone;

        // Mensaje
        const fecha = new Date(appointment.date).toLocaleDateString(
          'es-BO', { weekday: 'long', month: 'long', day: 'numeric' }
        );
        const body = `Hola ${patient.name} 👋\n\n` +
          `Recordatorio de tu cita médica:\n` +
          `📅 ${fecha}\n🕐 ${appointment.time} hrs\n` +
          `👨‍⚕️ ${professional?.fullName || 'Tu médico'}\n\n` +
          `— MedIL CRM`;

        // Enviar WhatsApp
        const twilioClient = getTwilioClient();
        await twilioClient.messages.create({
          from: TWILIO_FROM,
          to: `whatsapp:${phone}`,
          body,
        });

        // Marcar como enviado
        await db.from('reminders')
          .update({
            status: REMINDER_STATUS.SENT,
            sentAt: new Date().toISOString(),
            sentBy: 'system_auto',
          })
          .eq('id', reminder.id);

        console.log(`✓ Recordatorio enviado a ${phone}`);

      } catch (err) {
        console.error(`Error enviando a ${reminder.id}:`, err.message);
        // No lanzar — continuar con el siguiente
      }
    }
  } catch (err) {
    console.error('Error en reminderJob:', err.message);
  }
}
