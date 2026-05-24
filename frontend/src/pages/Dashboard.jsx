// Panel de control
import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatients } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';
import { useReminders } from '../hooks/useReminders';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FullPageSpinner } from '../components/ui/LoadingSpinner';
import { APPOINTMENT_STATUS, PATIENT_STATUS } from '../core/constants';

function MetricCard({ label, value, color = 'text-[#0E4A8A]' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
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
  const pendingReminders = useMemo(() => reminders.length, [reminders]);

  if (loadP || loadA || loadR) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0E4A8A]">Panel de Control</h1>
        <p className="text-sm text-gray-400 mt-0.5">{today}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Pacientes activos" value={activePatients} />
        <MetricCard label="Citas hoy" value={todayAppointments.length} color="text-[#00B4D8]" />
        <MetricCard label="Agendadas hoy" value={scheduledToday} color="text-green-600" />
        <MetricCard label="Recordatorios pendientes" value={pendingReminders} color="text-yellow-600" />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Citas de hoy</h2>
        {todayAppointments.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">Sin citas para hoy</p>
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
