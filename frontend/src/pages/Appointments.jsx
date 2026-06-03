// Gestión de citas
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { usePatients } from '../hooks/usePatients';
import { useProfessionals } from '../hooks/useProfessionals';
import { DataTable } from '../organisms/DataTable';
import { SearchBar } from '../molecules/SearchBar';
import { StatusBadge } from '../molecules/StatusBadge';
import { ConfirmModal } from '../molecules/ConfirmModal';
import { PaymentGate } from '../organisms/PaymentGate';
import { FullPageSpinner } from '../atoms/Spinner';
import { Button } from '../atoms/Button';
import { FormField, inputClass } from '../molecules/FormField';
import { ArrowLeft, Plus } from 'lucide-react';
import { APPOINTMENT_STATUS, DEFAULT_CONSULTATION_FEE, USER_ROLES } from '../core/constants';
import { MESSAGES } from '../core/messages';
import { eventBus } from '../core/eventBus';


const EMPTY_FORM = { patientId: '', patientName: '', professionalId: '', professional: '', date: '', time: '', reason: '' };

function AppointmentModal({ patients, professionals, onSave, onClose, lockedProfessional = null }) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    professionalId: lockedProfessional?.id ?? '',
    professional:   lockedProfessional?.fullName ?? lockedProfessional?.name ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pickPatient = (id) => {
    const p = patients.find(pt => pt.id === id);
    setForm(f => ({ ...f, patientId: id, patientName: p?.name ?? '' }));
  };

  const pickProfessional = (id) => {
    const pr = professionals.find(p => p.id === id);
    setForm(f => ({ ...f, professionalId: id, professional: pr?.fullName ?? pr?.name ?? '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.professionalId || !form.date || !form.time) {
      setError('Paciente, profesional, fecha y hora son obligatorios');
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
      <div className="absolute inset-0 medil-modal-overlay" onClick={onClose} />
      <div className="medil-modal relative bg-white rounded-xl w-full max-w-md p-6">
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
            {lockedProfessional ? (
              <input className={inputClass} value={form.professional} readOnly />
            ) : (
              <select className={inputClass} value={form.professionalId} onChange={e => pickProfessional(e.target.value)}>
                <option value="">Seleccionar…</option>
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName ?? p.name}</option>
                ))}
              </select>
            )}
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
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50">
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
  const { currentBranchId, user } = useAuth();
  const isDoctor = user?.role === USER_ROLES.DOCTOR;
  const { appointments, loading, cancel, markAttended, createWithPaymentCheck, createAfterPayment } = useAppointments(currentBranchId);
  const { patients, loading: loadP } = usePatients(currentBranchId);
  const { professionals, loading: loadPr } = useProfessionals(currentBranchId);

  // El profesional asociado al doctor logueado (vínculo por email)
  const myProfessional = professionals.find(p => p.email === user?.email) ?? null;

  const [showModal, setShowModal]       = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [filterStatus, setFilter]       = useState('Todas');
  const [query, setQuery]               = useState('');   // búsqueda por paciente/profesional
  const [dateFilter, setDateFilter]     = useState('');   // filtro por fecha
  const [pendingAppt, setPendingAppt]   = useState(null); // cita esperando pago

  // Verifica seguro: si está afiliado crea directo, si no abre la compuerta de pago
  const handleCreate = async (data) => {
    const result = await createWithPaymentCheck(data);
    if (result.requiresPayment) {
      setPendingAppt(data);
    } else {
      eventBus.emit('toast:show', { message: MESSAGES.success.appointmentFree, type: 'success' });
    }
  };

  // Tras aprobarse el pago, crea la cita definitivamente
  const handlePaymentSuccess = async (paymentId) => {
    await createAfterPayment(pendingAppt, paymentId);
    eventBus.emit('toast:show', { message: MESSAGES.success.appointmentCreated, type: 'success' });
    setPendingAppt(null);
  };

  const q = query.trim().toLowerCase();
  const filtered = appointments.filter(a => {
    if (filterStatus !== 'Todas' && a.status !== filterStatus) return false;
    if (dateFilter && a.date !== dateFilter) return false;
    if (q && !(`${a.patientName ?? ''} ${a.professional ?? ''}`.toLowerCase().includes(q))) return false;
    return true;
  });

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

  if (loading || loadP || loadPr) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
          <ArrowLeft size={16} strokeWidth={2.25} />
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Citas</h1>
        <Button label="Nueva cita" icon={Plus} onClick={() => setShowModal(true)} />
      </div>

      {/* Filtros: búsqueda por paciente/profesional + fecha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar por paciente o profesional…" />
        </div>
        <input
          type="date"
          className={`${inputClass} sm:max-w-[180px]`}
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
        {dateFilter && (
          <button onClick={() => setDateFilter('')} className="text-xs text-gray-500 hover:text-primary">
            Limpiar fecha
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={filtered} emptyTitle="Sin citas registradas" />

      {showModal && (
        <AppointmentModal
          patients={patients}
          professionals={professionals}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
          lockedProfessional={isDoctor ? myProfessional : null}
        />
      )}

      <PaymentGate
        isOpen={!!pendingAppt}
        appointmentData={pendingAppt}
        amount={DEFAULT_CONSULTATION_FEE}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={() => setPendingAppt(null)}
      />

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
