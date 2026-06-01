// Panel de control
import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatients } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';
import { useReminders } from '../hooks/useReminders';
import { StatusBadge } from '../molecules/StatusBadge';
import { Skeleton } from '../atoms/Skeleton';
import { MESSAGES } from '../core/messages';
import { APPOINTMENT_STATUS, PATIENT_STATUS, REMINDER_STATUS } from '../core/constants';

function MetricCard({ label, value, color = 'text-navy', loading = false }) {
  return (
    <div data-testid="metric-card" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
      {loading ? (
        <>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-16 mt-2" />
        </>
      ) : (
        <>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { currentBranchId } = useAuth();
  const { patients, loading: loadP }     = usePatients(currentBranchId);
  const { appointments, loading: loadA } = useAppointments(currentBranchId);
  const { reminders, loading: loadR }    = useReminders(currentBranchId);

  const today = new Date().toISOString().slice(0, 10);

  const todayAppointments = useMemo(
    () => appointments.filter(a => a.date === today),
    [appointments, today]
  );

  const activePatients   = useMemo(() => patients.filter(p => p.status === PATIENT_STATUS.ACTIVE).length, [patients]);
  const scheduledToday   = useMemo(() => todayAppointments.filter(a => a.status === APPOINTMENT_STATUS.SCHEDULED).length, [todayAppointments]);
  const pendingReminders = useMemo(() => reminders.filter(r => r.status === REMINDER_STATUS.PENDING).length, [reminders]);

  const loading = loadP || loadA || loadR;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Panel de Control</h1>
        <p className="text-sm text-gray-400 mt-0.5">{today}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Pacientes activos" value={activePatients} loading={loading} />
        <MetricCard label="Citas hoy" value={todayAppointments.length} color="text-primary" loading={loading} />
        <MetricCard label="Agendadas hoy" value={scheduledToday} color="text-green-600" loading={loading} />
        <MetricCard label="Recordatorios pendientes" value={pendingReminders} color="text-yellow-600" loading={loading} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Citas de hoy</h2>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : todayAppointments.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">{MESSAGES.empty.agenda.noData}</p>
        ) : (
          <div className="space-y-2">
            {todayAppointments.map(a => (
              <div key={a.id} className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {a.time?.slice(0, 5) ?? '—'} · {a.patientName ?? a.patientId}
                  </p>
                  <p className="text-xs text-gray-400">{a.professional ?? a.professionalId}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
