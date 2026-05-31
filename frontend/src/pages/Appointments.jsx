// Gestión de citas
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { usePatients } from '../hooks/usePatients';
import { DataTable } from '../organisms/DataTable';
import { StatusBadge } from '../molecules/StatusBadge';
import { ConfirmModal } from '../molecules/ConfirmModal';
import { FullPageSpinner } from '../atoms/Spinner';
import { FormField, inputClass } from '../molecules/FormField';
import { APPOINTMENT_STATUS } from '../core/constants';
import { MESSAGES } from '../core/messages';


const EMPTY_FORM = { patientId: '', patientName: '', professional: '', date: '', time: '', reason: '' };

function AppointmentModal({ patients, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pickPatient = (id) => {
    const p = patients.find(pt => pt.id === id);
    setForm(f => ({ ...f, patientId: id, patientName: p?.name ?? '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.date || !form.time) {
      setError('Paciente, fecha y hora son obligatorios');
      return;
    }
    setSaving(true);
    setError('');
    try {
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva Cita</h2>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Paciente">
            <select className={inputClass} value={form.patientId} onChange={e => pickPatient(e.target.value)}>
              <option value="">Seleccionar…</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Profesional">
            <input className={inputClass} value={form.professional} onChange={e => set('professional', e.target.value)} placeholder="Ej: Dra. Carmen Solís" />
          </FormField>
          <FormField label="Fecha">
            <input className={inputClass} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </FormField>
          <FormField label="Hora">
            <input className={inputClass} type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </FormField>
          <FormField label="Motivo">
            <input className={inputClass} value={form.reason} onChange={e => set('reason', e.target.value)} />
          </FormField>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] disabled:opacity-50">
              {saving ? 'Guardando…' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_FILTERS = ['Todas', APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.ATTENDED, APPOINTMENT_STATUS.CANCELLED];
const STATUS_LABELS  = { 'Todas': 'Todas', scheduled: 'Agendadas', attended: 'Atendidas', cancelled: 'Canceladas' };

export default function Appointments() {
  const { currentBranchId } = useAuth();
  const { appointments, loading, create, cancel, markAttended } = useAppointments(currentBranchId);
  const { patients, loading: loadP } = usePatients(currentBranchId);

  const [showModal, setShowModal]       = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [filterStatus, setFilter]       = useState('Todas');

  const filtered = filterStatus === 'Todas'
    ? appointments
    : appointments.filter(a => a.status === filterStatus);

  const columns = [
    { key: 'datetime', label: 'Fecha y hora', render: r => `${r.date ?? '—'} ${r.time?.slice(0, 5) ?? ''}` },
    { key: 'patientName',  label: 'Paciente' },
    { key: 'professional', label: 'Profesional' },
    { key: 'reason',       label: 'Motivo' },
    { key: 'status', label: 'Estado', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-3">
          {r.status === APPOINTMENT_STATUS.SCHEDULED && (
            <>
              <button onClick={() => markAttended(r.id)} className="text-gray-400 hover:text-green-600 transition-colors" title="Marcar como atendida">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button onClick={() => setCancelTarget(r)} className="text-gray-400 hover:text-red-500 transition-colors" title="Cancelar cita">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading || loadP) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0096B4] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0E4A8A]">Citas</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4]">
          + Nueva cita
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
            {STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={filtered} emptyTitle="Sin citas registradas" />

      {showModal && (
        <AppointmentModal patients={patients} onSave={create} onClose={() => setShowModal(false)} />
      )}

      <ConfirmModal
        open={!!cancelTarget}
        title="¿Cancelar cita?"
        description={MESSAGES.confirm.cancelAppointment}
        onConfirm={async () => { await cancel(cancelTarget.id); setCancelTarget(null); }}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
