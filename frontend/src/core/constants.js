// Constantes globales del sistema MedIL CRM — MedIL CRM global system constants

// Roles de usuario — User roles
export const USER_ROLES = {
  ADMIN:   'admin',   // Administrador — Administrator
  DOCTOR:  'doctor',  // Médico — Doctor
  PATIENT: 'patient', // Paciente — Patient
};

// Estados posibles de una cita — Possible appointment statuses
export const APPOINTMENT_STATUS = {
  SCHEDULED:       'scheduled',        // Agendada — Scheduled
  CANCELLED:       'cancelled',        // Cancelada — Cancelled
  ATTENDED:        'attended',         // Atendida — Attended
  PENDING_PAYMENT: 'pending_payment',  // Pago pendiente — Pending payment
};

// Estados posibles de un recordatorio — Possible reminder statuses
export const REMINDER_STATUS = {
  PENDING:   'pending',   // Pendiente — Pending
  SENT:      'sent',      // Enviado — Sent
  CANCELLED: 'cancelled', // Cancelado (al cancelar la cita) — Cancelled (when appointment is cancelled)
};

// Estados posibles de un paciente — Possible patient statuses
export const PATIENT_STATUS = {
  ACTIVE:   'active',   // Activo — Active
  INACTIVE: 'inactive', // Inactivo — Inactive
};

// Estados de pago — Payment statuses
export const PAYMENT_STATUS = {
  PENDING:  'pending',  // Pendiente — Pending
  APPROVED: 'approved', // Aprobado — Approved
  REJECTED: 'rejected', // Rechazado — Rejected
};

// Métodos de pago — Payment methods
export const PAYMENT_METHODS = {
  QR:   'qr',   // Pago QR — QR payment
  CASH: 'cash', // Efectivo — Cash
};

// Estados de insumos — Supply statuses
export const SUPPLY_STATUS = {
  OK:       'ok',       // Stock suficiente — Sufficient stock
  LOW:      'low',      // Stock bajo — Low stock
  CRITICAL: 'critical', // Stock crítico — Critical stock
};

// Horas de anticipación para recordatorio — Hours before appointment to send reminder
export const HOURS_BEFORE_REMINDER = 24;

// Duración por defecto de una cita en minutos — Default appointment duration in minutes
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;

// Tarifa por defecto de una consulta en Bs — Default consultation fee in Bs
export const DEFAULT_CONSULTATION_FEE = 150;

// Porcentaje de comisión QR (2%) — QR commission percentage (2%)
export const QR_COMMISSION_PERCENTAGE = 0.02;

// Comisión por defecto del profesional (10%) — Default professional commission (10%)
export const DEFAULT_COMMISSION_RATE = 0.10;

// Especialidades médicas disponibles — Available medical specialties
export const MEDICAL_SPECIALTIES = [
  'Medicina General', 'Pediatría', 'Cardiología', 'Dermatología',
  'Ginecología', 'Traumatología', 'Neurología', 'Oftalmología',
  'Odontología', 'Psicología',
];

// Contraseña temporal para nuevos profesionales — Temporary password for new professionals
export const DEFAULT_DOCTOR_PASSWORD = 'MedIL2024!';

// Intervalo de polleo QR en ms — QR polling interval in ms
export const QR_POLLING_INTERVAL_MS = 3000;

// Máximo de intentos de polleo — Maximum polling attempts
export const QR_MAX_POLLING_ATTEMPTS = 20;
