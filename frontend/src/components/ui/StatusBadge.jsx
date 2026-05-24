// Insignia de estado reutilizable — Reusable status badge
import React from 'react';

const VARIANT_MAP = {
  // Citas — Appointments
  scheduled:       'bg-blue-100 text-blue-700',
  cancelled:       'bg-red-100 text-red-700',
  attended:        'bg-green-100 text-green-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  // Pagos — Payments
  pending:         'bg-yellow-100 text-yellow-700',
  approved:        'bg-green-100 text-green-700',
  rejected:        'bg-red-100 text-red-700',
  // Pacientes — Patients
  active:          'bg-green-100 text-green-700',
  inactive:        'bg-gray-100 text-gray-500',
  // Insumos — Supplies
  ok:              'bg-green-100 text-green-700',
  low:             'bg-yellow-100 text-yellow-700',
  critical:        'bg-red-100 text-red-700',
  // Recordatorios — Reminders
  sent:            'bg-blue-100 text-blue-700',
};

const LABEL_MAP = {
  scheduled:       'Agendada',
  cancelled:       'Cancelada',
  attended:        'Atendida',
  pending_payment: 'Pago Pendiente',
  pending:         'Pendiente',
  approved:        'Aprobado',
  rejected:        'Rechazado',
  active:          'Activo',
  inactive:        'Inactivo',
  ok:              'OK',
  low:             'Bajo',
  critical:        'Crítico',
  sent:            'Enviado',
};

/**
 * Insignia de estado con color semántico — Semantic color status badge
 * @param {{ status: string, label?: string }} props
 */
export function StatusBadge({ status, label }) {
  const classes = VARIANT_MAP[status] ?? 'bg-gray-100 text-gray-600';
  const text = label ?? LABEL_MAP[status] ?? status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {text}
    </span>
  );
}
