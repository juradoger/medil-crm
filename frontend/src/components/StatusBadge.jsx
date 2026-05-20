// Componente reutilizable de insignia de estado — Reusable status badge component
// Renderiza un badge visual según el estado y tipo recibidos — Renders a visual badge based on received status and type
import React from 'react';

// Mapas de estilos por tipo y estado — Style maps by type and status
const STYLES = {
  appointment: {
    scheduled: 'bg-primary-pale text-primary-dark border border-primary-light',
    cancelled: 'bg-red-100 text-red-700 border border-red-300',
    attended: 'bg-green-100 text-green-700 border border-green-300',
  },
  reminder: {
    pending: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    sent: 'bg-green-100 text-green-700 border border-green-300',
  },
  patient: {
    active: 'bg-primary-pale text-primary-dark border border-primary-light',
    inactive: 'bg-gray-100 text-gray-500 border border-gray-300',
  },
};

// Etiquetas en español para mostrar al usuario — Spanish labels to show the user
const LABELS = {
  appointment: { scheduled: 'Agendada', cancelled: 'Cancelada', attended: 'Atendida' },
  reminder: { pending: 'Pendiente', sent: 'Enviado' },
  patient: { active: 'Activo', inactive: 'Inactivo' },
};

/**
 * StatusBadge — Muestra el estado de un registro como etiqueta visual
 * StatusBadge — Displays the status of a record as a visual label
 *
 * @param {string} status - Estado del registro (ej. 'scheduled') — Record status (e.g. 'scheduled')
 * @param {'appointment'|'reminder'|'patient'} type - Tipo de entidad — Entity type
 */
export default function StatusBadge({ status, type }) {
  // TODO Etapa 1 — implementar lógica / implement logic
  const styleClass = STYLES[type]?.[status] ?? 'bg-gray-100 text-gray-500';
  const label = LABELS[type]?.[status] ?? status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleClass}`}>
      {label}
    </span>
  );
}
