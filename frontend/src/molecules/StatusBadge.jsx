// Insignia de estado con texto en español
import React from 'react';
import { Badge } from '../atoms/Badge';

// Mapa de estados a color y etiqueta
const STATUS_CONFIG = {
  scheduled:       { color: 'aqua',   label: 'Agendada' },
  cancelled:       { color: 'red',    label: 'Cancelada' },
  attended:        { color: 'green',  label: 'Atendida' },
  pending_payment: { color: 'orange', label: 'Pago pendiente' },
  pending:         { color: 'orange', label: 'Pendiente' },
  sent:            { color: 'green',  label: 'Enviado' },
  active:          { color: 'green',  label: 'Activo' },
  inactive:        { color: 'gray',   label: 'Inactivo' },
  ok:              { color: 'green',  label: 'OK' },
  low:             { color: 'orange', label: 'Stock bajo' },
  critical:        { color: 'red',    label: 'Crítico' },
  approved:        { color: 'green',  label: 'Aprobado' },
  rejected:        { color: 'red',    label: 'Rechazado' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { color: 'gray', label: status };
  return <Badge text={config.label} color={config.color} />;
}
