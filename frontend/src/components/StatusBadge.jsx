// Componente reutilizable de insignia de estado
import React from 'react';

const STYLES = {
  appointment: {
    scheduled: 'bg-teal-100 text-teal-800 border border-teal-300',
    cancelled:  'bg-red-100 text-red-700 border border-red-300',
    attended:   'bg-emerald-100 text-emerald-700 border border-emerald-300',
  },
  reminder: {
    pending: 'bg-amber-100 text-amber-700 border border-amber-300',
    sent:    'bg-emerald-100 text-emerald-700 border border-emerald-300',
  },
  patient: {
    active:   'bg-emerald-100 text-emerald-700 border border-emerald-300',
    inactive: 'bg-gray-100 text-gray-500 border border-gray-300',
  },
};

const LABELS = {
  appointment: {
    scheduled: 'Agendada / Scheduled',
    cancelled:  'Cancelada / Cancelled',
    attended:   'Atendida / Attended',
  },
  reminder: {
    pending: 'Pendiente / Pending',
    sent:    'Enviado / Sent',
  },
  patient: {
    active:   'Activo / Active',
    inactive: 'Inactivo / Inactive',
  },
};

/**
 * @param {string} status - Estado del registro (ej. 'scheduled')
 * @param {'appointment'|'reminder'|'patient'} type - Tipo de entidad
 */
export default function StatusBadge({ status, type }) {
  const styleClass = STYLES[type]?.[status] ?? 'bg-gray-100 text-gray-500 border border-gray-300';
  const label      = LABELS[type]?.[status] ?? status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleClass}`}>
      {label}
    </span>
  );
}
