// Constantes globales del backend MedIL — MedIL backend global constants
// Espejo de frontend/src/core/constants.js — Mirror of frontend/src/core/constants.js

// Roles de usuario — User roles
export const USER_ROLES = {
  ADMIN:   'admin',
  DOCTOR:  'doctor',
  PATIENT: 'patient',
};

// Estados posibles de una cita — Possible appointment statuses
export const APPOINTMENT_STATUS = {
  SCHEDULED:       'scheduled',
  CANCELLED:       'cancelled',
  ATTENDED:        'attended',
  PENDING_PAYMENT: 'pending_payment',
};

// Estados posibles de un recordatorio — Possible reminder statuses
export const REMINDER_STATUS = {
  PENDING:   'pending',
  SENT:      'sent',
  CANCELLED: 'cancelled',
};

// Estados posibles de un paciente — Possible patient statuses
export const PATIENT_STATUS = {
  ACTIVE:   'active',
  INACTIVE: 'inactive',
};

// Estados de pago — Payment statuses
export const PAYMENT_STATUS = {
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Métodos de pago — Payment methods
export const PAYMENT_METHODS = {
  QR:   'qr',
  CASH: 'cash',
};

// Estados de insumos — Supply statuses
export const SUPPLY_STATUS = {
  OK:       'ok',
  LOW:      'low',
  CRITICAL: 'critical',
};

// Horas de anticipación para recordatorio — Hours before appointment to send reminder
export const HOURS_BEFORE_REMINDER = 24;

// Duración por defecto de una cita en minutos — Default appointment duration in minutes
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;

// Porcentaje de comisión QR (2%) — QR commission percentage (2%)
export const QR_COMMISSION_PERCENTAGE = 0.02;
