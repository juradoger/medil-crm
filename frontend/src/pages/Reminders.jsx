// Gestión de recordatorios — Reminder management
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useReminders } from '../hooks/useReminders';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FullPageSpinner } from '../components/ui/LoadingSpinner';

export default function Reminders() {
  const { currentBranchId } = useAuth();
  const { reminders, loading, markSent } = useReminders(currentBranchId);

  const columns = [
    {
      key: 'reminderAt', label: 'Enviar a las — Send at',
      render: r => r.reminderAt ? new Date(r.reminderAt).toLocaleString('es-BO') : '—',
    },
    {
      key: 'scheduledAt', label: 'Cita — Appointment',
      render: r => r.scheduledAt ? new Date(r.scheduledAt).toLocaleString('es-BO') : '—',
    },
    { key: 'patientId', label: 'Paciente — Patient' },
    { key: 'status', label: 'Estado — Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <button
          onClick={() => markSent(r.id ?? r._id)}
          className="text-xs text-[#00B4D8] hover:underline"
        >
          Marcar enviado — Mark sent
        </button>
      ),
    },
  ];

  if (loading) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#0E4A8A]">Recordatorios Pendientes — Pending Reminders</h1>
      <DataTable
        columns={columns}
        rows={reminders}
        emptyTitle="Sin recordatorios pendientes — No pending reminders"
      />
    </div>
  );
}
