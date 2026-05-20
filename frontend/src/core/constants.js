// Constantes globales del sistema MedIL CRM — MedIL CRM global system constants

// Horas de anticipación para recordatorio — Hours before appointment to send reminder
export const HOURS_BEFORE_REMINDER = 24;

// Duración por defecto de una cita en minutos — Default appointment duration in minutes
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;

// Estados posibles de una cita — Possible appointment statuses
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',   // Agendada — Scheduled
  CANCELLED: 'cancelled',   // Cancelada — Cancelled
  ATTENDED: 'attended',     // Atendida — Attended
};

// Estados posibles de un recordatorio — Possible reminder statuses
export const REMINDER_STATUS = {
  PENDING: 'pending', // Pendiente — Pending
  SENT: 'sent',       // Enviado — Sent
};

// Estados posibles de un paciente — Possible patient statuses
export const PATIENT_STATUS = {
  ACTIVE: 'active',     // Activo — Active
  INACTIVE: 'inactive', // Inactivo — Inactive
};
