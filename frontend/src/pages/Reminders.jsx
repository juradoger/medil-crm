// Gestión de recordatorios
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReminders } from '../hooks/useReminders';
import { DataTable } from '../organisms/DataTable';
import { StatusBadge } from '../molecules/StatusBadge';
import { ConfirmModal } from '../molecules/ConfirmModal';
import { FullPageSpinner } from '../atoms/Spinner';
import { REMINDER_STATUS } from '../core/constants';

const STATUS_FILTERS = ['Todas', REMINDER_STATUS.PENDING, REMINDER_STATUS.SENT];
const STATUS_LABELS  = { Todas: 'Todos', pending: 'Pendientes', sent: 'Enviados' };

export default function Reminders() {
  const { currentBranchId } = useAuth();
  const { reminders, loading, markSent } = useReminders(currentBranchId);

  const [filterStatus, setFilter]   = useState(REMINDER_STATUS.PENDING);
  const [confirmTarget, setConfirm] = useState(null);

  const filtered = filterStatus === 'Todas'
    ? reminders
    : reminders.filter(r => r.status === filterStatus);

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
      render: r => r.status === REMINDER_STATUS.PENDING && (
        <button onClick={() => setConfirm(r)} className="text-gray-400 hover:text-[#00B4D8] transition-colors" title="Marcar como enviado">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      ),
    },
  ];

  if (loading) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0096B4] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#0E4A8A]">Recordatorios</h1>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === s ? 'bg-[#00B4D8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={filtered} emptyTitle="Sin recordatorios" />

      <ConfirmModal
        open={!!confirmTarget}
        title="¿Marcar recordatorio como enviado?"
        description="Esta acción cambiará el estado del recordatorio a enviado."
        onConfirm={async () => {
          if (confirmTarget) {
            await markSent(confirmTarget.id);
            setConfirm(null);
          }
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
