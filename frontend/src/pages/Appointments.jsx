// Gestión de citas — Appointment management
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { usePatients } from '../hooks/usePatients';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { FullPageSpinner } from '../components/ui/LoadingSpinner';
import { FormField, inputClass } from '../components/ui/FormField';
import { APPOINTMENT_STATUS } from '../core/constants';

const EMPTY_FORM = { patientId: '', patientName: '', professional: '', professionalId: '', date: '', time: '', reason: '' };

function AppointmentModal({ patients, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pickPatient = (id) => {
    const p = patients.find(pt => (pt.id ?? pt._id) === id);
    setForm(f => ({ ...f, patientId: id, patientName: p?.name ?? '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.date || !form.time) {
      setError('Paciente, fecha y hora son obligatorios — Patient, date and time are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Pasar scheduledAt como combinación para el servicio — Pass scheduledAt combo to service
      await onSave({ ...form, scheduledAt: `${form.date}T${form.time}` });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva Cita — New Appointment</h2>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Paciente — Patient">
            <select className={inputClass} value={form.patientId} onChange={e => pickPatient(e.target.value)}>
              <option value="">Seleccionar — Select…</option>
              {patients.map(p => (
                <option key={p.id ?? p._id} value={p.id ?? p._id}>{p.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Profesional — Professional name">
            <input className={inputClass} value={form.professional} onChange={e => set('professional', e.target.value)} placeholder="Ej: Dra. Carmen Solís" />
          </FormField>
          <FormField label="Fecha — Date">
            <input className={inputClass} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </FormField>
          <FormField label="Hora — Time">
            <input className={inputClass} type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </FormField>
          <FormField label="Motivo — Reason">
            <input className={inputClass} value={form.reason} onChange={e => set('reason', e.target.value)} />
          </FormField>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] disabled:opacity-50">
              {saving ? 'Guardando…' : 'Agendar — Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_FILTERS = ['Todas — All', APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.ATTENDED, APPOINTMENT_STATUS.CANCELLED];

export default function Appointments() {
  const { currentBranchId } = useAuth();
  const { appointments, loading, create, cancel, markAttended } = useAppointments(currentBranchId);
  const { patients, loading: loadP } = usePatients(currentBranchId);

  const [showModal, setShowModal]       = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [filterStatus, setFilter]       = useState('Todas — All');

  const filtered = filterStatus === 'Todas — All'
    ? appointments
    : appointments.filter(a => a.status === filterStatus);

  const columns = [
    {
      key: 'datetime', label: 'Fecha y hora — Date & time',
      render: r => `${r.date ?? '—'} ${r.time?.slice(0, 5) ?? ''}`,
    },
    { key: 'patientName',   label: 'Paciente — Patient' },
    { key: 'professional',  label: 'Profesional' },
    { key: 'reason',        label: 'Motivo — Reason' },
    { key: 'status', label: 'Estado — Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-2">
          {r.status === APPOINTMENT_STATUS.SCHEDULED && (
            <>
              <button onClick={() => markAttended(r.id ?? r._id)} className="text-xs text-green-600 hover:underline">Atendida</button>
              <button onClick={() => setCancelTarget(r)} className="text-xs text-red-400 hover:underline">Cancelar</button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading || loadP) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0E4A8A]">Citas — Appointments</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4]">
          + Nueva Cita — New
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === s ? 'bg-[#00B4D8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={filtered} emptyTitle="Sin citas — No appointments" />

      {showModal && (
        <AppointmentModal patients={patients} onSave={create} onClose={() => setShowModal(false)} />
      )}

      <ConfirmModal
        open={!!cancelTarget}
        title="¿Cancelar cita? — Cancel appointment?"
        description="Esta acción no se puede deshacer — This action cannot be undone"
        onConfirm={async () => { await cancel(cancelTarget.id ?? cancelTarget._id); setCancelTarget(null); }}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
