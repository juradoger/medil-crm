// Gestión de recordatorios
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useReminders } from '../hooks/useReminders';
import { DataTable } from '../organisms/DataTable';
import { StatusBadge } from '../molecules/StatusBadge';
import { FullPageSpinner } from '../atoms/Spinner';

export default function Reminders() {
  const { currentBranchId } = useAuth();
  const { reminders, loading, markSent } = useReminders(currentBranchId);

  const columns = [
    {
      key: 'sendAt', label: 'Enviar a las',
      render: r => r.sendAt ? new Date(r.sendAt).toLocaleString('es-BO') : '—',
    },
    { key: 'message',   label: 'Mensaje' },
    { key: 'patientId', label: 'Paciente' },
    { key: 'status', label: 'Estado', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <button onClick={() => markSent(r.id)} className="text-xs text-[#00B4D8] hover:underline">
          Marcar enviado
        </button>
      ),
    },
  ];

  if (loading) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#0E4A8A]">Recordatorios pendientes</h1>
      <DataTable columns={columns} rows={reminders} emptyTitle="Sin recordatorios pendientes" />
    </div>
  );
}
